import fetch from 'node-fetch';
import pinataSDK from '@pinata/sdk';

const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

export async function pinJson(body: object) {
  let ipfsHash: string;

  const result = await pinata.pinJSONToIPFS(body);
  ipfsHash = result.IpfsHash;

  fetch(`https://ipfs2arweave.com/permapin/${ipfsHash}`)
    .then(res => res.json())
    .then(json => console.log('Arweave success', json))
    .catch(e => console.error('Arweave error', e));

  return ipfsHash;
}
