import { Zilliqa } from '@zilliqa-js/zilliqa';
import { fromBech32Address } from '@zilliqa-js/crypto';

const { blockchain } = new Zilliqa('https://api.zilliqa.com');

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

  if (res && res.result && res.result[field]) {
    return res.result[field];
  }

  return '0';
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
