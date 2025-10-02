import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { signUp, UserType } from '../services/authService';
import { RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens, surfaces, utils } from '../../shared/design/tokens';
import AuthLayout from '../components/AuthLayout';

type SignUpRouteProp = RouteProp<RootStackParamList, 'SignUp'>;
type SignUpNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const route = useRoute<SignUpRouteProp>();
  const navigation = useNavigation<SignUpNavigationProp>();
  const { role } = route.params;

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', general: '' };
    if (!formData.name.trim()) { newErrors.name = 'Name is required.'; isValid = false; }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = 'Enter a valid email.'; isValid = false; }
    if (!formData.password || formData.password.length < 6) { newErrors.password = 'Min 6 characters.'; isValid = false; }
    setErrors(newErrors); return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;
    setIsLoading(true);
    try {
      await signUp(formData, role === 'client' ? UserType.CLIENT : UserType.COACH);
      navigation.navigate('SignIn');
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, general: error.message || 'Unexpected error' }));
    } finally { setIsLoading(false); }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <AuthLayout>
      <View style={styles.header}> 
        <View style={styles.headerIconWrap}>
          <Ionicons name={role === 'client' ? 'person-outline' : 'school-outline'} size={40} color={tokens.colors.textOnDark} />
        </View>
        <Text style={styles.title}>Sign Up as {capitalize(role)}</Text>
        <Text style={styles.subtitle}>
          {role === 'client' ? 'Find & book lessons with expert coaches.' : 'Share expertise & build your coaching brand.'}
        </Text>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.sectionLabel}>ACCOUNT INFO</Text>

        <View style={[styles.inputGroup, errors.name && styles.inputGroupError]}> 
          <Ionicons name="person-outline" size={20} color={errors.name ? tokens.colors.error : '#64748b'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#94a3b8"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>
        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

        <View style={[styles.inputGroup, errors.email && styles.inputGroupError]}> 
          <Ionicons name="mail-outline" size={20} color={errors.email ? tokens.colors.error : '#64748b'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94a3b8"
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            returnKeyType="next"
          />
        </View>
        {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

        <View style={[styles.inputGroup, errors.password && styles.inputGroupError]}> 
          <Ionicons name="lock-closed-outline" size={20} color={errors.password ? tokens.colors.error : '#64748b'} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={secure}
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.toggleSecure} accessibilityLabel={secure ? 'Show password' : 'Hide password'}>
            <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

        {errors.general ? <Text style={[styles.errorText, { marginTop: 4 }]}>{errors.general}</Text> : null}

        <TouchableOpacity style={[styles.primaryButton, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading} accessibilityLabel="Create your Hobinet account">
          {isLoading ? <ActivityIndicator color={tokens.colors.primaryDark} /> : <Text style={styles.primaryButtonText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryGhostBtn} onPress={() => navigation.navigate('SignIn')} accessibilityLabel="Go to sign in">
          <Text style={styles.secondaryGhostBtnText}>Have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: tokens.space.xl, paddingTop: Platform.OS === 'ios' ? 70 : 46, paddingBottom: 80 },
  header: { alignItems: 'center', marginBottom: tokens.space.xl },
  headerIconWrap: { width: 72, height: 72, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: tokens.space.md, borderWidth: 1, borderColor: tokens.colors.borderGlass },
  title: { fontSize: 30, color: tokens.colors.textOnDark, fontWeight: tokens.fontWeight.heavy as any, textAlign: 'center', letterSpacing: 0.6, marginBottom: tokens.space.sm },
  subtitle: { fontSize: 15, lineHeight: 22, color: tokens.colors.textSubtle, textAlign: 'center', maxWidth: 300 },
  formCard: { ...surfaces.glassCard, borderRadius: tokens.radius.xl, padding: tokens.space.xl, ...utils.shadowSoft },
  sectionLabel: { fontSize: 12, fontWeight: tokens.fontWeight.bold as any, letterSpacing: 0.8, color: tokens.colors.textOnDark, marginBottom: tokens.space.md },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: tokens.colors.input, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space.md, marginBottom: tokens.space.sm, borderWidth: 1.5, borderColor: tokens.colors.inputBorder },
  inputGroupError: { borderColor: tokens.colors.error },
  inputIcon: { marginRight: tokens.space.sm },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: tokens.fontWeight.medium as any, color: tokens.colors.textDark },
  toggleSecure: { padding: 4, marginLeft: 4 },
  errorText: { color: tokens.colors.error, fontSize: 12, marginBottom: tokens.space.xs, fontWeight: tokens.fontWeight.medium as any },
  primaryButton: { backgroundColor: tokens.colors.light, paddingVertical: tokens.space.lg, borderRadius: tokens.radius.pill, marginTop: tokens.space.lg, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  primaryButtonText: { color: tokens.colors.primary, fontSize: 16, fontWeight: tokens.fontWeight.bold as any },
  secondaryGhostBtn: { marginTop: tokens.space.md, paddingVertical: tokens.space.sm, alignItems: 'center' },
  secondaryGhostBtnText: { color: tokens.colors.textOnDark, fontSize: 14, fontWeight: tokens.fontWeight.semibold as any, textDecorationLine: 'underline' },
});
