import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import AuthLayout from '../components/AuthLayout';
import { requestPasswordReset } from '../services/authService';
import { tokens, surfaces, utils } from '../../shared/design/tokens';

// Screen 1: Ask for email. Backend always returns generic success message.
// User then goes to VerifyResetCode screen to enter tokenId + code.

type ForgotPasswordNav = NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;

const ForgotPassword: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNav>();
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email.trim()) { setError('Please enter your email'); return; }
    setLoading(true); setError(''); setStatusMessage('');
    try {
      const res = await requestPasswordReset(email.trim());
      setStatusMessage(res.message || 'If an account exists, a reset code was sent.');
      // Navigate to next step letting user supply tokenId + code (since backend does not return token id yet)
      navigation.navigate('VerifyResetCode', { email: email.trim() });
    } catch (e: any) {
      setError(e.message || 'Unable to request reset');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>Enter the email associated with your account. We'll send a 6-digit code and a token ID link (if available).</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            returnKeyType="done"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {statusMessage ? <Text style={styles.success}>{statusMessage}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={tokens.colors.textOnDark} /> : <Text style={styles.buttonText}>Request Reset</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.secondaryText}>Back to Sign In</Text>
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

export default ForgotPassword;
