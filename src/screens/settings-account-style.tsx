import React, {useCallback, useState} from 'react';

import {observer} from 'mobx-react';

import {SettingsAccountStyle} from '@app/components/settings-account-style';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {Wallet} from '@app/models/wallet';
import {WalletCardPattern, WalletCardStyle} from '@app/types';

export const SettingsAccountStyleScreen = observer(() => {
  const navigation = useTypedNavigation();
  const route = useTypedRoute<'settingsAccountStyle'>();

  // TODO Wallet can be null
  const wallet = Wallet.getById(route.params.address) as Wallet;
  const [pattern, setPattern] = useState<string>(wallet.pattern);

  const [cardStyle, setCardStyle] = useState<WalletCardStyle>(
    wallet.cardStyle || WalletCardStyle.flat,
  );

  const [colors, setColors] = useState([
    wallet.colorFrom,
    wallet.colorTo,
    wallet.colorPattern,
  ]);

  const [patternStyle, setPatternStyle] = useState<WalletCardPattern>(
    wallet.pattern.startsWith(WalletCardPattern.circle)
      ? WalletCardPattern.circle
      : WalletCardPattern.rhombus,
  );

  const onPressApply = useCallback(() => {
    Wallet.setCardStyle(wallet.address, {
      cardStyle,
      colorFrom: colors[0],
      colorTo: colors[1],
      colorPattern: colors[2],
      pattern,
    });
    navigation.goBack();
  }, [cardStyle, colors, navigation, pattern, wallet.address]);

  return (
    <SettingsAccountStyle
      setPattern={setPattern}
      onPressApply={onPressApply}
      patternStyle={patternStyle}
      colors={colors}
      cardStyle={cardStyle}
      pattern={pattern}
      setPatternStyle={setPatternStyle}
      setColors={setColors}
      setCardStyle={setCardStyle}
      wallet={wallet}
    />
  );
});
