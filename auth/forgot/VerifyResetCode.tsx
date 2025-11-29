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
    if (code.length !== 6) { setError('Code must be 6 digits'); return; }
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const ok = await verifyPasswordResetCode(email, code);
      if (!ok) { setError('Invalid or expired code'); return; }
      setSuccessMsg('Code valid. Continue.');
      navigation.navigate('ResetPassword', { email, code });
    } catch (e: any) {
      setError(e.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.title}>Verify Code</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {email || 'your email'}.</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
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
          {loading ? <ActivityIndicator color={tokens.colors.textOnDark} /> : <Text style={styles.buttonText}>Verify Code</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.secondaryText}>Request new code</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  card: { ...surfaces.glassCard, borderRadius: tokens.radius.xl, padding: tokens.space.xl, ...utils.shadowSoft },
  title: { fontSize: 26, fontWeight: tokens.fontWeight.heavy as any, color: tokens.colors.textOnDark, marginBottom: tokens.space.sm },
  subtitle: { fontSize: 14, lineHeight: 20, color: tokens.colors.textSubtle, marginBottom: tokens.space.lg },
  inputGroup: { backgroundColor: tokens.colors.input, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space.md, marginBottom: tokens.space.sm, borderWidth: 1.5, borderColor: tokens.colors.inputBorder },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: tokens.fontWeight.medium as any, color: tokens.colors.textDark },
  button: { backgroundColor: tokens.colors.primary, paddingVertical: tokens.space.lg, borderRadius: tokens.radius.pill, alignItems: 'center', marginTop: tokens.space.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: tokens.colors.textOnDark, fontSize: 16, fontWeight: tokens.fontWeight.bold as any },
  secondary: { marginTop: tokens.space.md, alignItems: 'center' },
  secondaryText: { color: tokens.colors.textOnDark, fontSize: 14, fontWeight: tokens.fontWeight.semibold as any, textDecorationLine: 'underline' },
  error: { color: tokens.colors.error, marginTop: 8, fontSize: 13 },
  success: { color: '#10b981', marginTop: 8, fontSize: 13 }
});

export default VerifyResetCode;
