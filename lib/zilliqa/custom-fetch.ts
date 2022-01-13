// import { cloneDeep } from 'lodash';
import { RPCMethod } from '@zilliqa-js/core';

export class blockchain {
  private _http = `https://api.zilliqa.com/`;
  private _zilswap = '459cb2d3baf7e61cfbd5fe362f289ae92b2babb0';
  private _xcad = '1fb1a4fd7ba94b1617641d6022ba48cafa77eef0';

  public async getLiquidity(token: string) {
    const poolFiled = 'pools';
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
      }
    ];
    const res = await this._send(batch);

    console.log(res);
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

const bl = new blockchain();

bl.getLiquidity('0xa845c1034cd077bd8d32be0447239c7e4be6cb21');