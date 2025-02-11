import React, {useCallback} from 'react';

import {StakingDelegateFinish} from '@app/components/staking-delegate-finish/staking-delegate-finish';
import {app} from '@app/contexts';
import {Events} from '@app/events';
import {awaitForEventDone} from '@app/helpers/await-for-event-done';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {AWAIT_NEW_BLOCK_MS} from '@app/variables/common';

export const StakingDelegateFinishScreen = () => {
  const navigation = useTypedNavigation();
  const {params} = useTypedRoute<'stakingDelegateFinish'>();

  const onDone = useCallback(async () => {
    app.emit(Events.onStakingSync);
    setTimeout(() => {
      app.emit(Events.onStakingSync);
    }, AWAIT_NEW_BLOCK_MS);
    await awaitForEventDone(Events.onAppReviewRequest);
    navigation.getParent()?.goBack();
  }, [navigation]);

  return (
    <StakingDelegateFinish
      onDone={onDone}
      validator={params.validator}
      amount={params.amount}
      fee={params.fee}
      txhash={params.txhash}
    />
  );
};
