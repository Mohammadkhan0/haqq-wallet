import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {ProposalDepositForm} from '@app/components/proposal-deposit-form';
import {app} from '@app/contexts';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Balance} from '@app/services/balance';
import {Cosmos} from '@app/services/cosmos';

export const ProposalDepositFormScreen = () => {
  const navigation = useTypedNavigation();
  const {account, proposal} = useTypedRoute<'proposalDepositForm'>().params;
  const fee = useMemo(() => new Balance(Cosmos.fee.amount), []);
  const [balance, setBalance] = useState(Balance.Empty);

  useEffect(() => {
    const newBalance = app.getAvailableBalance(account);
    setBalance(newBalance);
  }, [account]);

  const onAmount = useCallback(
    (amount: number) => {
      navigation.navigate('proposalDepositPreview', {
        proposal,
        account,
        fee,
        amount,
      });
    },
    [fee, navigation, account, proposal],
  );

  return (
    <ProposalDepositForm
      account={account}
      onAmount={onAmount}
      balance={balance}
      fee={fee}
    />
  );
};
