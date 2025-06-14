import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  View,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { signUp, UserType } from '../services/authService';
import { RootStackParamList } from '../../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type SignUpRouteProp = RouteProp<RootStackParamList, 'SignUp'>;
type SignUpNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const route = useRoute<SignUpRouteProp>();
  const navigation = useNavigation<SignUpNavigationProp>();
  const { role } = route.params;

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '', general: '' };

    if (!formData.name) {
      newErrors.name = 'Name is required.';
      isValid = false;
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      await signUp(formData, role === 'client' ? UserType.CLIENT : UserType.COACH);
      Alert.alert('Success', `${capitalize(role)} created successfully!`);
      navigation.navigate('SignIn');
    } catch (error: any) {
      setErrors((prev) => ({ ...prev, general: error.message || 'Unexpected error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#1565c0', '#0d47a1']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Ionicons 
              name={role === 'client' ? 'person-outline' : 'school-outline'} 
              size={48} 
              color="#fff" 
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Sign Up as {capitalize(role)}</Text>
            <Text style={styles.subtitle}>
              {role === 'client' 
                ? 'Join Hobiez to find and book amazing lessons'
                : 'Start sharing your expertise with students'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={formData.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
              />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#0d47a1" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.switchText}>
                Already have an account?{' '}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate('SignIn')}
                >
                  Sign In
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 32,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#0d47a1',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  linkText: {
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    color: 'white',
  },
  errorText: {
    color: '#ffbdbd',
    fontSize: 12,
    marginBottom: 4,
    paddingLeft: 4,
  },
});
