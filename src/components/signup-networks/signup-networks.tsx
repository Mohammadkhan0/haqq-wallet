import React, {useCallback, useMemo, useState} from 'react';

import {Color} from '@app/colors';
import {
  Button,
  ButtonVariant,
  LottieWrap,
  PopupContainer,
  Spacer,
  Text,
} from '@app/components/ui';
import {createTheme} from '@app/helpers';
import {I18N} from '@app/i18n';
import {SssProviders} from '@app/services/provider-sss';

import {SocialButton, SocialButtonVariant} from '../social-button';

export type SssNetworksProps = {
  isGoogleSupported: boolean;
  isAppleSupported: boolean;
  onLogin: (provider: SssProviders) => Promise<void>;
  onLoginLaterPress(): void;
};

export const SignupNetworks = ({
  isGoogleSupported,
  isAppleSupported,
  onLogin,
  onLoginLaterPress,
}: SssNetworksProps) => {
  const [isApple, setIsApple] = useState(false);
  const [isGoogle, setIsGoogle] = useState(false);

  const isLoading = useMemo(() => isApple || isGoogle, [isApple, isGoogle]);

  const onPressLoginGoogle = useCallback(async () => {
    try {
      setIsGoogle(true);

      await onLogin(SssProviders.google);
    } finally {
      setIsGoogle(false);
    }
  }, [onLogin]);

  const onPressLoginApple = useCallback(async () => {
    try {
      setIsApple(true);

      await onLogin(SssProviders.apple);
    } finally {
      setIsApple(false);
    }
  }, [onLogin]);

  return (
    <PopupContainer style={styles.container}>
      <Spacer centered>
        <LottieWrap
          source={require('../../../assets/animations/soc-login.json')}
          style={styles.logo}
          autoPlay
          loop
        />
      </Spacer>
      {/* <SocialButton variant={SocialButtonVariant.discord} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.twitter} />
        <Spacer height={10} />
        <SocialButton variant={SocialButtonVariant.facebook} /> */}

      {isAppleSupported && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isApple}
            disabled={isLoading && !isApple}
            onPress={onPressLoginApple}
            variant={SocialButtonVariant.apple}
          />
        </>
      )}
      {isGoogleSupported && (
        <>
          <Spacer height={10} />
          <SocialButton
            loading={isGoogle}
            disabled={isLoading && !isGoogle}
            onPress={onPressLoginGoogle}
            variant={SocialButtonVariant.google}
          />
        </>
      )}
      <Spacer height={10} />
      <Text
        t15
        i18n={I18N.sssNetworkWeb3AuthDescription}
        color={Color.textBase2}
      />
      <Spacer height={8} />
      <Button
        onPress={onLoginLaterPress}
        i18n={I18N.sssLoginLater}
        variant={ButtonVariant.text}
        textColor={Color.textRed1}
        testID="sss_login_later"
      />
    </PopupContainer>
  );
};

const styles = createTheme({
  logo: {
    width: 148,
    height: 148,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
});
