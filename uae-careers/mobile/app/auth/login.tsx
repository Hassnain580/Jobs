import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loginWithEmail, sendOTP, loginWithOTP } from '../../src/lib/auth';
import { useAuth } from '../../src/stores/authStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A3C6E',
  accent: '#FF6B35',
  background: '#F5F7FA',
  white: '#FFFFFF',
  textDark: '#1a1a2e',
  textGray: '#666',
  border: '#E5E7EB',
};

// ─── OTP Box Input ────────────────────────────────────────────────────────────

interface OTPInputProps {
  value: string;
  onChange: (val: string) => void;
  length?: number;
}

function OTPInput({ value, onChange, length = 6 }: OTPInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableOpacity style={styles.otpWrap} activeOpacity={1} onPress={() => inputRef.current?.focus()}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.otpBox,
            value.length === i && styles.otpBoxFocused,
            value[i] && styles.otpBoxFilled,
          ]}
        >
          <Text style={styles.otpDigit}>{value[i] ?? ''}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.otpHiddenInput}
        caretHidden
      />
    </TouchableOpacity>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

type LoginTab = 'email' | 'otp';

export default function LoginScreen() {
  const router = useRouter();
  const { dispatch } = useAuth();
  const [tab, setTab] = useState<LoginTab>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown(seconds = 60) {
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleEmailLogin() {
    if (!email.trim() || !password) {
      return Alert.alert('Missing Fields', 'Please enter your email and password.');
    }
    setLoading(true);
    try {
      const result = await loginWithEmail({ email: email.trim(), password });
      dispatch({ type: 'SET_USER', user: result.user });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login Failed', e.response?.data?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOTP() {
    if (!phone.trim()) {
      return Alert.alert('Missing Field', 'Please enter your phone number.');
    }
    setLoading(true);
    try {
      await sendOTP(phone.trim());
      setOtpSent(true);
      startCountdown(60);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    if (otp.length < 6) {
      return Alert.alert('Incomplete OTP', 'Please enter the 6-digit code.');
    }
    setLoading(true);
    try {
      const result = await loginWithOTP({ phone: phone.trim(), otp });
      dispatch({ type: 'SET_USER', user: result.user });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Invalid OTP', e.response?.data?.message ?? 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    Alert.alert('Google Sign In', 'Google authentication integration coming soon.\n\nInstall expo-auth-session for OAuth support.');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={COLORS.textGray} />
          </TouchableOpacity>

          {/* Logo & title */}
          <View style={styles.logoBlock}>
            <Text style={styles.logoEmoji}>🇦🇪</Text>
            <Text style={styles.logoText}>UAE Careers</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabRow}>
            {(['email', 'otp'] as LoginTab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => { setTab(t); setOtpSent(false); setOtp(''); }}
              >
                <Ionicons
                  name={t === 'email' ? 'mail' : 'phone-portrait'}
                  size={15}
                  color={tab === t ? COLORS.white : COLORS.textGray}
                />
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'email' ? 'Email' : 'Phone OTP'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Email tab ── */}
          {tab === 'email' ? (
            <>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleEmailLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleEmailLogin}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading
                  ? <ActivityIndicator color={COLORS.white} />
                  : <Text style={styles.primaryBtnText}>Login</Text>}
              </TouchableOpacity>
            </>
          ) : (
            /* ── Phone OTP tab ── */
            <>
              <View style={styles.inputWrap}>
                <Ionicons name="phone-portrait-outline" size={18} color={COLORS.textGray} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="+971 50 000 0000"
                  placeholderTextColor="#9CA3AF"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!otpSent}
                />
                {otpSent && (
                  <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }}>
                    <Text style={styles.changeText}>Change</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!otpSent ? (
                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleSendOTP}
                  disabled={loading}
                  activeOpacity={0.88}
                >
                  {loading
                    ? <ActivityIndicator color={COLORS.white} />
                    : <Text style={styles.primaryBtnText}>Send OTP</Text>}
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={styles.otpHint}>
                    Enter the 6-digit code sent to {phone}
                  </Text>
                  <OTPInput value={otp} onChange={setOtp} />

                  <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.btnDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={loading}
                    activeOpacity={0.88}
                  >
                    {loading
                      ? <ActivityIndicator color={COLORS.white} />
                      : <Text style={styles.primaryBtnText}>Verify & Login</Text>}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendLink}
                    onPress={countdown > 0 ? undefined : handleSendOTP}
                    disabled={countdown > 0}
                  >
                    <Text style={[styles.resendText, countdown > 0 && { color: '#9CA3AF' }]}>
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social */}
          <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleLogin} activeOpacity={0.85}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity
            style={styles.registerRow}
            onPress={() => router.replace('/auth/register')}
          >
            <Text style={styles.registerText}>
              Don't have an account?{' '}
              <Text style={styles.registerLink}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    padding: 6,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  logoEmoji: {
    fontSize: 52,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 4,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 12,
  },
  changeText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  otpHint: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
    lineHeight: 18,
  },
  otpWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    position: 'relative',
  },
  otpBox: {
    width: 46,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF3FF',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  otpDigit: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  otpHiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendLink: {
    alignSelf: 'center',
    marginTop: 14,
  },
  resendText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
  },
  socialBtnText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  registerRow: {
    alignSelf: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  registerLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
