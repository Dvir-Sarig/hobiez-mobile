import { Linking, Alert } from 'react-native';

export const openWhatsAppChat = (phoneNumber: string | null | undefined, country: string | null | undefined) => {
  if (!phoneNumber) {
    Alert.alert('אין מספר טלפון', 'המשתמש לא סיפק מספר טלפון.');
    return;
  }

  let formattedPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');

  if ((country === 'Israel' || country === 'ישראל') && formattedPhoneNumber.startsWith('0')) {
    formattedPhoneNumber = `972${formattedPhoneNumber.substring(1)}`;
  }

  const url = `https://wa.me/${formattedPhoneNumber}`;

  Linking.openURL(url).catch(() => {
    Alert.alert('שגיאה', 'לא ניתן לפתוח את WhatsApp. ודא שהאפליקציה מותקנת במכשיר.');
  });
};
