import React, {useCallback, useEffect, useMemo} from 'react';

import {View} from 'react-native';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  Icon,
  InfoBlock,
  KeyboardSafeArea,
  Spacer,
  Text,
} from '@app/components/ui';
import {NetworkFee} from '@app/components/ui/network-fee';
import {SumBlock} from '@app/components/ui/sum-block';
import {createTheme} from '@app/helpers';
import {formatPercents} from '@app/helpers/format-percents';
import {useSumAmount} from '@app/hooks/use-sum-amount';
import {I18N} from '@app/i18n';
import {Balance, FEE_AMOUNT} from '@app/services/balance';
import {ValidatorItem, ValidatorStatus} from '@app/types';
import {CURRENCY_NAME} from '@app/variables/common';

export type StakingDelegateFormProps = {
  validator: ValidatorItem;
  account: string;
  onAmount: (amount: number) => void;
  fee: Balance | null;
  balance: Balance;
};

export const StakingDelegateForm = ({
  validator: {
    commission: {commission_rates},
    localStatus,
  },
  onAmount,
  fee,
  balance,
}: StakingDelegateFormProps) => {
  const transactionFee = useMemo(
    () => (fee !== null ? fee.max(FEE_AMOUNT) : Balance.Empty),
    [fee],
  );

  const maxAmount = useMemo(() => {
    return balance.operate(transactionFee, 'sub');
  }, [balance, transactionFee]);

  const amounts = useSumAmount(Balance.Empty, maxAmount, new Balance(0.01));

  const validatorCommission = useMemo(() => {
    return formatPercents(commission_rates.rate);
  }, [commission_rates]);

  const onDone = useCallback(() => {
    onAmount(parseFloat(amounts.amount));
  }, [amounts, onAmount]);

  const onPressMax = useCallback(() => {
    amounts.setMax();
  }, [amounts]);

  useEffect(() => {
    const INPUT_PRECISION = 3;
    const first = new Balance(+amounts.amount, INPUT_PRECISION)
      .toEther()
      .toPrecision(INPUT_PRECISION);
    const second = new Balance(amounts.maxAmount, INPUT_PRECISION)
      .toEther()
      .toPrecision(INPUT_PRECISION);
    if (first >= second) {
      amounts.setMax();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fee, amounts.maxAmount.toHex()]);

  return (
    <KeyboardSafeArea isNumeric style={styles.container}>
      <View style={styles.row}>
        <Text t14 i18n={I18N.stakingDelegateFormCommission} />
        <Text t10>{validatorCommission}%</Text>
      </View>
      <Spacer centered>
        <SumBlock
          value={amounts.amount}
          error={amounts.error}
          currency={CURRENCY_NAME}
          balance={balance}
          onChange={amounts.setAmount}
          onMax={onPressMax}
        />
      </Spacer>
      <NetworkFee fee={fee} currency="ISLM" />
      {localStatus === ValidatorStatus.inactive ||
        (localStatus === ValidatorStatus.jailed && (
          <>
            <Spacer height={8} />
            <InfoBlock
              warning
              i18n={I18N.stakingUnDelegatePreviewJailedAttention}
              icon={<Icon name="warning" color={Color.textYellow1} />}
            />
          </>
        ))}
      <Spacer height={16} />
      <Button
        i18n={I18N.stakingDelegateFormPreview}
        disabled={!amounts.isValid || fee === null}
        variant={ButtonVariant.contained}
        onPress={onDone}
      />
      <Spacer height={16} />
    </KeyboardSafeArea>
  );
};

const styles = createTheme({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});
