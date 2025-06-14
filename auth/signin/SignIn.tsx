import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { signIn, UserType } from '../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { AuthContext } from '../AuthContext';
import { Ionicons } from '@expo/vector-icons';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { setAuthState } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>(UserType.CLIENT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shakeAnimation] = useState(new Animated.Value(0));

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      shakeError();
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const data = await signIn(email, password, userType);

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userId', data.userId.toString());
      await AsyncStorage.setItem('userType', userType.toLowerCase());

      setAuthState({
        userId: data.userId.toString(),
        userType: userType.toLowerCase(),
        token: data.token,
      });
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection';
      }
      setError(errorMessage);
      shakeError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1565c0', '#0d47a1']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons 
              name="log-in-outline" 
              size={48} 
              color="#fff" 
              style={styles.headerIcon}
            />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your journey</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={24}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {error ? (
              <Animated.View 
                style={[
                  styles.errorContainer,
                  { transform: [{ translateX: shakeAnimation }] }
                ]}
              >
                <Ionicons name="alert-circle-outline" size={20} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            ) : null}

            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === UserType.CLIENT && styles.userTypeSelected,
                ]}
                onPress={() => setUserType(UserType.CLIENT)}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={userType === UserType.CLIENT ? '#fff' : '#1976d2'} 
                  style={styles.userTypeIcon}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === UserType.CLIENT && styles.userTypeTextSelected,
                  ]}
                >
                  Client
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === UserType.COACH && styles.userTypeSelected,
                ]}
                onPress={() => setUserType(UserType.COACH)}
              >
                <Ionicons 
                  name="school-outline" 
                  size={20} 
                  color={userType === UserType.COACH ? '#fff' : '#1976d2'} 
                  style={styles.userTypeIcon}
                />
                <Text
                  style={[
                    styles.userTypeText,
                    userType === UserType.COACH && styles.userTypeTextSelected,
                  ]}
                >
                  Coach
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signInText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.switchText}>
                Don't have an account?{' '}
                <Text
                  style={styles.signUpLink}
                  onPress={() =>
                    navigation.navigate('SignUp', {
                      role: userType.toLowerCase() as 'client' | 'coach',
                    })
                  }
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
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
    marginBottom: 12,
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
  eyeIcon: {
    padding: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: 'white',
  },
  userTypeSelected: {
    backgroundColor: '#1976d2',
  },
  userTypeIcon: {
    marginRight: 8,
  },
  userTypeText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 16,
  },
  userTypeTextSelected: {
    color: 'white',
  },
  signInButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
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
  signInText: {
    color: 'white',
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
  signUpLink: {
    fontWeight: 'bold',
    color: 'white',
    textDecorationLine: 'underline',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6b6b',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
