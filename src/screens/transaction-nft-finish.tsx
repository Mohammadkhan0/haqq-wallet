import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {observer} from 'mobx-react';
import prompt from 'react-native-prompt-android';

import {TransactionNftFinish} from '@app/components/transaction-nft-finish';
import {shortAddress} from '@app/helpers/short-address';
import {useTypedNavigation, useTypedRoute} from '@app/hooks';
import {useAndroidBackHandler} from '@app/hooks/use-android-back-handler';
import {useTransaction} from '@app/hooks/use-transaction';
import {I18N, getText} from '@app/i18n';
import {Contact, ContactType} from '@app/models/contact';
import {sendNotification} from '@app/services';
import {HapticEffects, vibrate} from '@app/services/haptic';

export const TransactionNftFinishScreen = observer(() => {
  const {navigate, getParent, goBack} = useTypedNavigation();
  useAndroidBackHandler(() => {
    goBack();
    return true;
  }, [goBack]);
  const {hash, nft} = useTypedRoute<'transactionNftFinish'>().params;
  const transaction = useTransaction(hash);

  const [contact, setContact] = useState(
    Contact.getById(transaction?.to ?? ''),
  );

  useEffect(() => {
    if (contact?.account !== transaction?.to) {
      setContact(Contact.getById(transaction?.to ?? ''));
    }
  }, [contact?.account, transaction?.to]);

  const short = useMemo(
    () => shortAddress(transaction?.to ?? ''),
    [transaction?.to],
  );

  const onSubmit = () => {
    getParent()?.goBack();
  };

  const onPressContact = useCallback(() => {
    if (transaction?.to) {
      prompt(
        getText(
          contact
            ? I18N.transactionFinishEditContact
            : I18N.transactionFinishAddContact,
        ),
        getText(I18N.transactionFinishContactMessage, {
          address: transaction?.to,
        }),
        value => {
          if (contact) {
            Contact.update(contact.account, {
              name: value,
            });
            sendNotification(I18N.transactionFinishContactUpdated);
          } else {
            Contact.create(transaction.to, {
              name: value,
              type: ContactType.address,
              visible: true,
            });
            sendNotification(I18N.transactionFinishContactAdded);
            setContact(Contact.getById(transaction?.to ?? ''));
          }
        },
        {
          defaultValue: contact?.name ?? '',
          placeholder: getText(I18N.transactionFinishContactMessagePlaceholder),
        },
      );
    }
  }, [transaction?.to, contact]);

  useEffect(() => {
    vibrate(HapticEffects.success);
  }, [hash, navigate]);

  return (
    <TransactionNftFinish
      item={nft}
      onPressContact={onPressContact}
      onSubmit={onSubmit}
      transaction={transaction}
      contact={contact}
      short={short}
    />
  );
});
