import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../shared/design/tokens';

interface AuthLayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export default function AuthLayout({ children, scroll = true }: AuthLayoutProps) {
  const content = (
    <View style={styles.inner}>
      {children}
    </View>
  );
  return (
    <LinearGradient colors={tokens.colors.gradient as [string,string,string]} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      {/* Decorative bubbles reused from lesson search aesthetic */}
      <View style={styles.bubbles} pointerEvents="none">
        <View style={[styles.bubble, { top: -60, left: -50, width: 200, height: 200 }]} />
        <View style={[styles.bubble, { top: 180, right: -70, width: 240, height: 240, opacity: 0.55 }]} />
        <View style={[styles.bubble, { bottom: -80, left: -40, width: 180, height: 180, opacity: 0.35 }]} />
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : content}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  bubbles: { position: 'absolute', inset: 0 },
  bubble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 400 },
  scrollContent: { paddingHorizontal: tokens.space.xl, paddingTop: Platform.OS === 'ios' ? 70 : 54, paddingBottom: 90 },
  inner: { flexGrow: 1, justifyContent: 'center' },
});
