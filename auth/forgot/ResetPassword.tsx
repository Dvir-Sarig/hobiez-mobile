import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import AuthLayout from '../components/AuthLayout';
import { resetPassword } from '../services/authService';
import { tokens, surfaces, utils } from '../../shared/design/tokens';

// Screen 3: Set new password.

const MIN_LENGTH = 8;

type Nav = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

const ResetPassword: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const route = useRoute<any>();
  const { email, code } = route.params || {};

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const validate = () => {
    if (!email || !code) { setError('Missing email or code'); return false; }
    if (newPassword.length < MIN_LENGTH) { setError(`Password must be at least ${MIN_LENGTH} characters`); return false; }
    if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) { setError('Include letters and numbers'); return false; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true); setError(''); setSuccessMsg('');
    try {
  const res = await resetPassword(email, code, newPassword, confirmPassword);
      setSuccessMsg(res.message || 'Password updated');
      // After brief delay navigate to SignIn
      setTimeout(() => navigation.navigate('SignIn'), 1000);
    } catch (e: any) {
      setError(e.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>Code verified for {email || 'your email'}. Choose a strong password (min 8 chars incl. letters & numbers).</Text>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={newPassword}
            onChangeText={(t) => { setNewPassword(t); setError(''); }}
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
            returnKeyType="done"
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

        <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color={tokens.colors.textOnDark} /> : <Text style={styles.buttonText}>Reset Password</Text>}
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

export default ResetPassword;
