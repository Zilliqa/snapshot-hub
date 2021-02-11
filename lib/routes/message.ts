import { Router } from 'express';
import BN from 'bn.js';
import fromentries from 'object.fromentries';
import spaces from '@snapshot-labs/snapshot-spaces';
import { verifySignature, pinJson } from '../utils';
import { Message } from '../models';
import { getBalances, getTotalSupply, getBalance } from '../zilliqa';

import pkg from '../../package.json';

import { ErrorCodes } from '../config';

const _PROCENT = new BN(1);

export const message = Router();
const gZIL = 'zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e';

const tokens = fromentries(
  Object.entries(spaces).map((space: any) => {
    return [space[1].token, space[0]]
  })
);

const proposal = (res: any, msg: any) => {
  if (msg.type !== 'proposal') {
    return null;
  }

  if (
    Object.keys(msg.payload).length !== 9 ||
    !msg.payload.choices ||
    msg.payload.choices.length < 2 ||
    isNaN(msg.payload.snapshot) ||
    !msg.payload.metadata
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_PROPOSAL_FORMAT,
      error_description: 'incorect proposal format'
    });
  }

  if (!msg.payload.quorum ||
      Number(msg.payload.quorum) > 100 ||
      Number(msg.payload.quorum) < 0
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_QUORUM,
      error_description: 'incorect quorum'
    });
  }

  if (
    !msg.payload.name ||
    msg.payload.name.length > 256 ||
    !msg.payload.body ||
    msg.payload.body.length > 4e4
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_PROPOSAL_SIZE,
      error_description: 'incorect proposal size'
    });
  }

  if (
    typeof msg.payload.metadata !== 'object' ||
    JSON.stringify(msg.payload.metadata).length > 2e4
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_PROPOSAL_METADATA,
      error_description: 'incorect proposal metadata'
    });
  }

  if (
    !msg.payload.start ||
    // ts > msg.payload.start ||
    !msg.payload.end ||
    msg.payload.start >= msg.payload.end
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_PROPOSAL_PERIOD,
      error_description: 'incorect proposal period'
    });
  }
}
const vote = async (res: any, msg: any, ts: string) => {
  if (msg.type !== 'vote') {
    return null;
  }

  if (
    Object.keys(msg.payload).length !== 3 ||
    !msg.payload.proposal ||
    !msg.payload.choice ||
    !msg.payload.metadata
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_VOTE_FORMAT,
      error_description: 'incorect vote format'
    });
  }

  if (
    typeof msg.payload.metadata !== 'object' ||
    JSON.stringify(msg.payload.metadata).length > 1e4
  ) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_VOTE_METADATA,
      error_description: 'incorect vote metadata'
    });
  }

  const proposal = await Message.findOne({
    where: {
      token: msg.token,
      author_ipfs_hash: msg.payload.proposal
    }
  });

  if (!proposal) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_PROPOSAL_FORMAT,
      error_description: 'incorect vote proposal'
    });
  }
  const payload = JSON.parse(proposal.payload);

  if (Number(ts) > Number(payload.end) || Number(payload.start) > Number(ts)) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_VOTE_FORMAT,
      error_description: 'not in voting window'
    });
  }
}

message.post('/message', async (req, res) => {
  const body = req.body;
  const msg = JSON.parse(body.msg);
  const ts = (Date.now() / 1e3).toFixed();

  if (!body || !body.address || !body.msg || !body.sig) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_DATA,
      error_description: 'incorect message body'
    });
  }

  if (!tokens[msg.token]) {
    return res.status(400).json({
      code: ErrorCodes.UNKNOWN_SPACE,
      error_description: 'unknown space'
    });
  }

  msg.timestamp = Number(msg.timestamp);

  if (!msg.timestamp || isNaN(msg.timestamp) || msg.timestamp > (ts + 30)) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_DATA,
      error_description: 'wrong timestamp'
    });
  }

  if (!msg.version || msg.version !== pkg.version) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_VER,
      error_description: 'incorrect version'
    });
  }

  if (!msg.type || !['proposal', 'vote'].includes(msg.type)) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_TYPE,
      error_description: 'incorrect type'
    });
  }

  try {
    const checked = verifySignature(
      body.sig.message,
      body.sig.publicKey,
      body.sig.signature,
      body.address
    );

    if (!checked) {
      throw new Error();
    }
  } catch (err) {
    return res.status(400).json({
      code: ErrorCodes.INCORRECT_SIGNATURE,
      error_description: 'incorrect signature'
    });
  }

  proposal(res, msg);
  await vote(res, msg, ts);

  const space = tokens[msg.token];
  let authorIpfsRes: any | null = null;

  if (msg.type === 'proposal') {
    const createrBalance = await getBalance(msg.token, body.address);
    const totalSupply = await getTotalSupply(msg.token);
    const _balance = new BN(createrBalance);
    const _1000 = new BN(1000);
    const _totalSupply = new BN(totalSupply);
    const _n = _1000.mul(_PROCENT);
    const _min = _totalSupply.div(_n);
    const _minGZIL = new BN('30000000000000000');

    if (msg.token == gZIL && _balance.lt(_minGZIL)) {
      return res.status(400).json({
        code: ErrorCodes.MIN_BALANCE_ERROR,
        error_description: 'you require 30 $gZIL or more to submit a proposal.'
      });
    }

    if (_balance.lt(_min) && msg.token !== gZIL) {
      return res.status(400).json({
        code: ErrorCodes.MIN_BALANCE_ERROR,
        error_description: `Your balance below than 0.${_PROCENT}%.`
      });
    }
    const balances = await getBalances(msg.token);
    authorIpfsRes = await pinJson({
      balances,
      totalSupply,
      address: body.address,
      msg: body.msg,
      sig: body.sig,
      version: '2'
    });
    await Message.create({
      space,
      token: msg.token,
      author_ipfs_hash: authorIpfsRes,
      address: body.address,
      version: msg.version,
      timestamp: msg.timestamp,
      type: 'proposal',
      payload: JSON.stringify(msg.payload),
      sig: JSON.stringify(body.sig)
    });
  }

  if (msg.type === 'vote') {
    authorIpfsRes = await pinJson({
      address: body.address,
      msg: body.msg,
      sig: body.sig,
      version: '2'
    });
    await Message.create({
      space,
      token: msg.token,
      author_ipfs_hash: authorIpfsRes,
      address: body.address,
      version: msg.version,
      timestamp: msg.timestamp,
      type: 'vote',
      proposal_id: msg.payload.proposal,
      payload: JSON.stringify(msg.payload),
      sig: JSON.stringify(body.sig)
    });
  }

  console.log(
    `Address "${body.address}"\n`,
    `Token "${msg.token}"\n`,
    `Type "${msg.type}"\n`,
    `IPFS hash "${authorIpfsRes}"`
  );

  return res.json({ ipfsHash: authorIpfsRes });
});
