import { Zilliqa } from '@zilliqa-js/zilliqa';
import { fromBech32Address } from '@zilliqa-js/crypto';

export async function getBalances(address: string) {
  const { blockchain } = new Zilliqa('https://api.zilliqa.com');
  const base16 = fromBech32Address(address);
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

  return {};
}
