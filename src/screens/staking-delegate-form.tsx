import React, {useCallback, useMemo, useState} from 'react';

import {ProviderLedgerReactNative} from '@haqq/provider-ledger-react-native';

import {StakingDelegateForm} from '@app/components/staking-delegate-form';
import {app} from '@app/contexts';
import {getProviderInstanceForWallet} from '@app/helpers';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useLayoutEffectAsync} from '@app/hooks/use-effect-async';
import {useWalletsBalance} from '@app/hooks/use-wallets-balance';
import {Wallet} from '@app/models/wallet';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';
import {FEE_ESTIMATING_TIMEOUT_MS} from '@app/variables/common';

export const StakingDelegateFormScreen = () => {
  const navigation = useTypedNavigation();
  const {account, validator} = useTypedRoute<'stakingDelegateForm'>().params;
  const wallet = Wallet.getById(account);
  const balances = useWalletsBalance([wallet!]);
  const currentBalance = useMemo(() => balances[account], [balances, account]);
  const [fee, setFee] = useState<Balance | null>(null);

  const setDefaultFee = useCallback(
    () => setFee(new Balance(Cosmos.fee.amount)),
    [],
  );

  useLayoutEffectAsync(async () => {
    const timer = setTimeout(() => {
      setDefaultFee();
    }, FEE_ESTIMATING_TIMEOUT_MS);

    const instance = await getProviderInstanceForWallet(wallet!, true);
    const cosmos = new Cosmos(app.provider);
    try {
      setFee(null);
      const f = await cosmos.simulateDelegate(
        instance,
        wallet!.path!,
        validator.operator_address,
        currentBalance.availableForStake,
      );
      Logger.log('f.amount', f.amount);
      setFee(new Balance(f.amount));
    } catch (err) {
      if (instance instanceof ProviderLedgerReactNative) {
        instance.abort();
        clearTimeout(timer);
        setDefaultFee();
      }
    } finally {
      clearTimeout(timer);
    }

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const onAmount = useCallback(
    (amount: number) => {
      if (fee !== null) {
        navigation.navigate('stakingDelegatePreview', {
          validator,
          account,
          amount: amount,
          fee: fee,
        });
      }
    },
    [fee, navigation, account, validator],
  );

  return (
    <StakingDelegateForm
      validator={validator}
      account={account}
      onAmount={onAmount}
      balance={currentBalance.availableForStake}
      fee={fee}
    />
  );
};
