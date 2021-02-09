import { Zilliqa } from '@zilliqa-js/zilliqa';
import { fromBech32Address } from '@zilliqa-js/crypto';
import { cloneDeep } from 'lodash';
import BN from 'bn.js';

const { blockchain } = new Zilliqa('https://api.zilliqa.com');
const zilswap = '0xBa11eB7bCc0a02e947ACF03Cc651Bfaf19C9EC00';

export async function getPool(token: string) {
  const field = 'balances';
  const res = await blockchain.getSmartContractSubState(
    zilswap,
    field,
    [token]
  );

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (!res || !res.result || !res.result[field] || !res.result[field][token]) {
    return {};
  }

  return cloneDeep(res.result[field][token]);
}

export async function getBalances(token: string) {
  const base16 = fromBech32Address(token);
  const field = 'balances';
  const res = await blockchain.getSmartContractSubState(
    base16,
    field
  );

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (!res || !res.result || !res.result[field]) {
    return {};
  }

  const balances = cloneDeep(res.result[field]);
  let pool = {};

  try {
    pool = await getPool(String(base16).toLowerCase());
  } catch {
    //
  }

  for (const key in balances) {
    if (key in pool) {
      const _poolBalance = new BN(pool[key]);
      const _tokenBalance = new BN(balances[key]);
      const _balance = _poolBalance.add(_tokenBalance);

      balances[key] = _balance.toString();
    }
  }

  return balances;
}

export async function getBalance(token: string, address: string) {
  address = String(address).toLowerCase();
  const base16 = fromBech32Address(token);
  const field = 'balances';
  const res = await blockchain.getSmartContractSubState(
    base16,
    field,
    [address]
  );

  if (res.error) {
    throw new Error(res.error.message);
  }

  if (res && res.result && res.result[field] && res.result[field][address]) {
    return res.result[field][address];
  }

  return '0';
}
