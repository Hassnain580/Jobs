import React, { useState } from 'react';
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
import { register } from '../../src/lib/auth';
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
  success: '#059669',
};

type AccountType = 'seeker' | 'employer';

// ─── Input Field ──────────────────────────────────────────────────────────────

interface FieldProps {
  iconName: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  required?: boolean;
  error?: string;
}

function Field({
  iconName,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  required,
  error,
}: FieldProps) {
  const [show, setShow] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={styles.fieldWrap}>
      <View style={[styles.inputWrap, error ? styles.inputError : undefined]}>
        <Ionicons name={iconName} size={18} color={COLORS.textGray} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={required ? `${placeholder} *` : placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !show}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShow((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textGray} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── Password strength ────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isLong = password.length >= 8;
  const score = [hasUpper, hasLower, hasNumber, isLong].filter(Boolean).length;

  if (!password) return null;

  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  const color = score <= 1 ? '#EF4444' : score === 2 ? '#F59E0B' : score === 3 ? '#3B82F6' : COLORS.success;

  return (
    <View style={styles.pwStrength}>
      <View style={styles.pwBars}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.pwBar, i <= score && { backgroundColor: color }]}
          />
        ))}
      </View>
      <Text style={[styles.pwLabel, { color }]}>{label}</Text>
    </View>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();
  const { dispatch } = useAuth();

  const [accountType, setAccountType] = useState<AccountType>('seeker');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (accountType === 'seeker' && !firstName.trim()) errs.firstName = 'First name is required';
    if (accountType === 'employer' && !companyName.trim()) errs.companyName = 'Company name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email is required';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!agreed) errs.terms = 'Please accept the terms and conditions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await register({
        firstName: accountType === 'seeker' ? firstName.trim() : companyName.trim(),
        lastName: accountType === 'seeker' ? lastName.trim() : '',
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role: accountType === 'employer' ? 'employer' : 'job_seeker',
      });
      dispatch({ type: 'SET_USER', user: result.user });
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert(
        'Registration Failed',
        e.response?.data?.message ?? 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
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
          {/* Close btn */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={COLORS.textGray} />
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoBlock}>
            <Text style={styles.logoEmoji}>🇦🇪</Text>
            <Text style={styles.logoText}>Create Account</Text>
            <Text style={styles.subtitle}>Join UAE Careers — it's free</Text>
          </View>

          {/* Account type toggle */}
          <View style={styles.toggleRow}>
            {(['seeker', 'employer'] as AccountType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.toggleBtn, accountType === t && styles.toggleBtnActive]}
                onPress={() => setAccountType(t)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={t === 'seeker' ? 'person' : 'business'}
                  size={16}
                  color={accountType === t ? COLORS.white : COLORS.textGray}
                />
                <Text style={[styles.toggleText, accountType === t && styles.toggleTextActive]}>
                  {t === 'seeker' ? 'Job Seeker' : 'Employer'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name fields */}
          {accountType === 'seeker' ? (
            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Field
                  iconName="person-outline"
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                  required
                  error={errors.firstName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  iconName="person-outline"
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>
          ) : (
            <Field
              iconName="business-outline"
              placeholder="Company name"
              value={companyName}
              onChangeText={setCompanyName}
              required
              error={errors.companyName}
            />
          )}

          <Field
            iconName="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            required
            error={errors.email}
          />

          <Field
            iconName="phone-portrait-outline"
            placeholder="Phone number (optional)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Field
            iconName="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            required
            error={errors.password}
          />
          <PasswordStrength password={password} />

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreed((v) => !v)}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <Ionicons name="checkmark" size={14} color={COLORS.white} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>
          {errors.terms ? <Text style={styles.fieldError}>{errors.terms}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : (
                <>
                  <Ionicons name="person-add" size={18} color={COLORS.white} />
                  <Text style={styles.primaryBtnText}>Create Account</Text>
                </>
              )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            style={styles.loginRow}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Login</Text>
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
    marginBottom: 24,
    marginTop: 4,
  },
  logoEmoji: {
    fontSize: 48,
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
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldWrap: {
    marginBottom: 4,
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
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
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
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 4,
  },
  pwStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -6,
    marginBottom: 12,
  },
  pwBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  pwBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  pwLabel: {
    fontSize: 12,
    fontWeight: '700',
    width: 50,
    textAlign: 'right',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.accent,
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  loginRow: {
    alignSelf: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  loginLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
