// import { cloneDeep } from 'lodash';
import BN from 'bn.js';
import { RPCMethod } from '@zilliqa-js/core';

export class blockchain {
  private _http = `https://api.zilliqa.com/`;
  private _zilswap = '459cb2d3baf7e61cfbd5fe362f289ae92b2babb0';
  private _xcad = '1fb1a4fd7ba94b1617641d6022ba48cafa77eef0';
  private _100 = new BN(100000);
  private _zero = new BN(0);

  public async getLiquidity(token: string, address: string) {
    const poolFiled = 'pools';
    const totalSupplyFiled = 'total_supply';
    const dexBalanceFiled = 'balances';
    const tokenBalanceFiled = 'balances';
    const batch = [
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._zilswap,
          poolFiled,
          [token]
        ],
        id: 1,
        jsonrpc: `2.0`,
      },
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._zilswap,
          dexBalanceFiled,
          [token]
        ],
        id: 1,
        jsonrpc: `2.0`,
      },
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._xcad,
          poolFiled,
          [token]
        ],
        id: 1,
        jsonrpc: `2.0`,
      },
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._xcad,
          dexBalanceFiled,
          [token]
        ],
        id: 1,
        jsonrpc: `2.0`,
      },
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._toHex(token),
          tokenBalanceFiled,
          []
        ],
        id: 1,
        jsonrpc: `2.0`,
      },
      {
        method: RPCMethod.GetSmartContractSubState,
        params: [
          this._toHex(token),
          totalSupplyFiled,
          []
        ],
        id: 1,
        jsonrpc: `2.0`,
      }
    ];
    const res = await this._send(batch);
    const [, tokenReserve] = res[0]['result'][poolFiled][token]['arguments'];
    const zBalance = res[1]['result'][dexBalanceFiled];
    const tokenBalances = res[4]['result'][tokenBalanceFiled];
    const userBalance = tokenBalances[address];
    const totalSupply = res[5]['result'][totalSupplyFiled];

    let poolAmount = new BN('0');
    let contribution = new BN(tokenReserve);

    for (const iterator of Object.values(zBalance)) {
      if (typeof iterator === 'string') {
        const v = new BN(iterator);
        poolAmount = poolAmount.add(v);
      }
    }

    for (const key in zBalance) {
      if (key in tokenBalances) {
        const userContributionbalance = new BN(zBalance[key]);
        const contributionPercentage = userContributionbalance.mul(this._100).div(poolAmount);
  
        if (this._zero.eq(contributionPercentage)) {
          continue;
        }
  
        const userValue = contribution.mul(contributionPercentage).div(this._100);
        const currentBalance = new BN(tokenBalances[key]);
    
        tokenBalances[key] = currentBalance.add(userValue).toString();
      }
    }

    return {
      balances: tokenBalances,
      totalSupply,
      userBalance
    };
  }

  private _toHex(address: string) {
    return String(address).replace('0x', '').toLowerCase();
  }

  private async _send(batch: object[]) {
    const res = await fetch(this._http, {
      method: `POST`,
      headers: {
        "Content-Type": `application/json`,
      },
      body: JSON.stringify(batch),
    });
    return res.json();
  }
}

new blockchain().getLiquidity('0xa845c1034cd077bd8d32be0447239c7e4be6cb21', '0x007744a9a6e150406db18c442269b0eb052444ad');