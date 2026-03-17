import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import AuthLayout from '../components/AuthLayout';
import { verifyPasswordResetCode } from '../services/authService';
import { tokens, surfaces, utils } from '../../shared/design/tokens';

// Screen 2: User enters 6-digit code for given email. On success navigate to ResetPassword.

type Nav = NativeStackNavigationProp<RootStackParamList, 'VerifyResetCode'>;

const VerifyResetCode: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { email } = route.params || {};

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const tryVerify = async () => {
    if (code.length !== 6) { setError('הקוד חייב להיות בן 6 ספרות'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const ok = await verifyPasswordResetCode(email, code);
      if (!ok) { setError('קוד לא תקין או פג תוקף'); return; }
      setSuccessMsg('הקוד תקין. ממשיכים.');
      navigation.navigate('ResetPassword', { email, code });
    } catch (e: any) {
      setError(e.message || 'האימות נכשל');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.title}>אימות קוד</Text>
        <Text style={styles.subtitle}>הזן את הקוד בן 6 הספרות שנשלח ל-{email || 'האימייל שלך'}.</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="קוד בן 6 ספרות"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={code}
            onChangeText={(t) => { setCode(t); setError(''); }}
            maxLength={6}
            returnKeyType="done"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={tryVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={tokens.colors.textOnDark} /> : <Text style={styles.buttonText}>אמת קוד</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.secondaryText}>שלח קוד חדש</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  card: { ...surfaces.glassCard, borderRadius: tokens.radius.xl, padding: tokens.space.xl, ...utils.shadowSoft },
  title: { fontSize: 26, fontWeight: tokens.fontWeight.heavy as any, color: tokens.colors.textOnDark, marginBottom: tokens.space.sm, textAlign: 'left', writingDirection: 'rtl' },
  subtitle: { fontSize: 14, lineHeight: 20, color: tokens.colors.textSubtle, marginBottom: tokens.space.lg, textAlign: 'left', writingDirection: 'rtl' },
  inputGroup: { backgroundColor: tokens.colors.input, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space.md, marginBottom: tokens.space.sm, borderWidth: 1.5, borderColor: tokens.colors.inputBorder },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: tokens.fontWeight.medium as any, color: tokens.colors.textDark },
  button: { backgroundColor: tokens.colors.primary, paddingVertical: tokens.space.lg, borderRadius: tokens.radius.pill, alignItems: 'center', marginTop: tokens.space.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: tokens.colors.textOnDark, fontSize: 16, fontWeight: tokens.fontWeight.bold as any, textAlign: 'left', writingDirection: 'rtl' },
  secondary: { marginTop: tokens.space.md, alignItems: 'center' },
  secondaryText: { color: tokens.colors.textOnDark, fontSize: 14, fontWeight: tokens.fontWeight.semibold as any, textDecorationLine: 'underline', textAlign: 'left', writingDirection: 'rtl' },
  error: { color: tokens.colors.error, marginTop: 8, fontSize: 13, textAlign: 'left', writingDirection: 'rtl' },
  success: { color: '#10b981', marginTop: 8, fontSize: 13, textAlign: 'left', writingDirection: 'rtl' }
});

export default VerifyResetCode;
