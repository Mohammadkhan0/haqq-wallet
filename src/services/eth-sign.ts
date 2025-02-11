import {TransactionRequest} from '@haqq/provider-base';

import {app} from '@app/contexts';
import {awaitForJsonRpcSign} from '@app/helpers/await-for-json-rpc-sign';
import {Wallet} from '@app/models/wallet';
import {EIPTypedData} from '@app/types';
import {stringToHex} from '@app/utils';
import {HAQQ_METADATA, ZERO_HEX_NUMBER} from '@app/variables/common';
import {EIP155_SIGNING_METHODS} from '@app/variables/EIP155';

import {Balance} from './balance';

export type EthSignErrorDataDetails = {
  handled?: boolean;
  message?: string;
  reason?: string;
  code?: string;
  error?: {
    code: number;
  };
  // transaction from wallet provider
  transaction?: TransactionRequest;
};

export type EthSignErrorData = {
  method: EIP155_SIGNING_METHODS;
  details?: EthSignErrorDataDetails;
};

export class EthSignError extends Error {
  name = 'EthSignError';
  data?: EthSignErrorData;

  constructor(message: string, data?: EthSignErrorData) {
    super(message);
    this.data = data;
  }

  // handled is `true` when JsonRpcSignScreen notify user about error by modal
  // https://github.com/haqq-network/haqq-wallet/blob/main/src/screens/json-rpc-sign-screen.tsx#L87
  get isHandled() {
    return this.data?.details?.handled;
  }

  toString() {
    return `${this.name} : ${this.message} \n ${JSON.stringify(
      this.data || {},
      null,
      2,
    )}`;
  }
}

const getWalletAddress = (wallet: Wallet | string) =>
  typeof wallet === 'string' ? wallet : wallet.address;

const prepareTransaction = async (from: string, tx: TransactionRequest) => {
  tx.from = from;

  if (!tx.value) {
    tx.value = ZERO_HEX_NUMBER;
  }

  if (!tx.nonce) {
    const rpcProvider = await app.getRpcProvider();
    tx.nonce = await rpcProvider.getTransactionCount(from, 'latest');
  }

  return tx;
};

export class EthSign {
  static async personalSign(wallet: Wallet | string, message: string) {
    if (!wallet || !message) {
      throw new EthSignError('Invalid params', {
        method: EIP155_SIGNING_METHODS.PERSONAL_SIGN,
      });
    }
    const address = getWalletAddress(wallet);
    return await awaitForJsonRpcSign({
      metadata: HAQQ_METADATA,
      chainId: app.provider.ethChainId,
      request: {
        method: EIP155_SIGNING_METHODS.PERSONAL_SIGN,
        params: [address, stringToHex(message)],
      },
      selectedAccount: address,
    });
  }

  static async signTransaction(
    wallet: Wallet | string,
    tx: TransactionRequest,
  ) {
    if (!wallet || !tx) {
      throw new EthSignError('Invalid params', {
        method: EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION,
      });
    }

    const address = getWalletAddress(wallet);
    const preparedTx = await prepareTransaction(address, tx);

    try {
      return await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        chainId: app.provider.ethChainId,
        request: {
          method: EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION,
          params: [preparedTx],
        },
        selectedAccount: address,
        hideContractAttention: true,
      });
    } catch (e) {
      const error = e as EthSignErrorDataDetails;
      throw new EthSignError(error.reason! || error.message!, {
        method: EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION,
        details: error,
      });
    }
  }

  static async sendTransaction(
    wallet: Wallet | string,
    tx: TransactionRequest,
  ) {
    if (!wallet || !tx) {
      throw new EthSignError('Invalid params', {
        method: EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
      });
    }

    const address = getWalletAddress(wallet);
    const preparedTx = await prepareTransaction(address, tx);

    try {
      return await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        chainId: app.provider.ethChainId,
        request: {
          method: EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
          params: [preparedTx],
        },
        selectedAccount: address,
        hideContractAttention: true,
      });
    } catch (e) {
      const error = e as EthSignErrorDataDetails;
      throw new EthSignError(error.reason! || error.message!, {
        method: EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION,
        details: error,
      });
    }
  }

  static async calculateGasPrice(tx: TransactionRequest) {
    const rpcProvider = await app.getRpcProvider();
    const estimatedGas = await rpcProvider.estimateGas(tx);
    const gasPrice = await rpcProvider.getGasPrice();

    return new Balance(estimatedGas).operate(new Balance(gasPrice), 'mul');
  }

  static async signTypedData(wallet: Wallet | string, typedData: EIPTypedData) {
    if (!wallet || !typedData) {
      throw new EthSignError('Invalid params', {
        method: EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
      });
    }

    const address = getWalletAddress(wallet);

    try {
      return await awaitForJsonRpcSign({
        metadata: HAQQ_METADATA,
        chainId: app.provider.ethChainId,
        request: {
          method: EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
          params: [address, typedData],
        },
        selectedAccount: address,
        hideContractAttention: true,
      });
    } catch (e) {
      const error = e as EthSignErrorDataDetails;
      throw new EthSignError(error.reason! || error.message!, {
        method: EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA,
        details: error,
      });
    }
  }
}
