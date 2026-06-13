import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { loginWithEmail, sendOTP, loginWithOTP } from '../../src/lib/auth'
import { useAuth } from '../../src/stores/authStore'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35' }

export default function LoginScreen() {
  const router = useRouter()
  const { dispatch } = useAuth()
  const [tab, setTab] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleEmailLogin() {
    if (!email || !password) return Alert.alert('Error', 'Please fill all fields')
    setLoading(true)
    try {
      const result = await loginWithEmail({ email, password })
      dispatch({ type: 'SET_USER', user: result.user })
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Login Failed', e.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  async function handleSendOtp() {
    if (!phone) return Alert.alert('Error', 'Enter your phone number')
    setLoading(true)
    try {
      await sendOTP(phone)
      setOtpSent(true)
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  async function handleOtpLogin() {
    if (!otp) return Alert.alert('Error', 'Enter the OTP code')
    setLoading(true)
    try {
      const result = await loginWithOTP({ phone, otp })
      dispatch({ type: 'SET_USER', user: result.user })
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Invalid OTP', e.response?.data?.message || 'OTP verification failed')
    } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🇦🇪</Text>
        <Text style={styles.title}>UAE Careers</Text>
        <Text style={styles.sub}>Sign in to your account</Text>

        {/* Tab switcher */}
        <View style={styles.tabs}>
          {(['email', 'otp'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'email' ? '✉️ Email' : '📱 Phone OTP'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'email' ? (
          <>
            <TextInput style={styles.input} placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.btn} onPress={handleEmailLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput style={styles.input} placeholder="+971 50 000 0000" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            {!otpSent ? (
              <TouchableOpacity style={styles.btn} onPress={handleSendOtp} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send OTP</Text>}
              </TouchableOpacity>
            ) : (
              <>
                <Text style={styles.otpHint}>Enter the 6-digit code sent to {phone}</Text>
                <TextInput style={[styles.input, styles.otpInput]} placeholder="000000" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
                <TouchableOpacity style={styles.btn} onPress={handleOtpLogin} disabled={loading}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify & Login</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSendOtp}><Text style={styles.link}>Resend OTP</Text></TouchableOpacity>
              </>
            )}
          </>
        )}

        <Text style={styles.divider}>— or —</Text>
        <TouchableOpacity style={styles.googleBtn}><Text style={styles.googleBtnText}>🔵  Continue with Google</Text></TouchableOpacity>
        <TouchableOpacity style={styles.linkedinBtn}><Text style={styles.linkedinBtnText}>in  Continue with LinkedIn</Text></TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/register')}>
          <Text style={styles.registerLink}>Don't have an account? <Text style={{ color: COLORS.accent, fontWeight: '700' }}>Register</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 24, alignItems: 'center' },
  logo: { fontSize: 50, marginTop: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A3C6E', marginTop: 8 },
  sub: { fontSize: 14, color: '#666', marginBottom: 24 },
  tabs: { flexDirection: 'row', backgroundColor: '#f0f4f8', borderRadius: 12, padding: 4, marginBottom: 20, width: '100%' },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, color: '#666' },
  tabTextActive: { color: '#1A3C6E', fontWeight: '700' },
  input: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 14, width: '100%', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e8ecf0' },
  otpInput: { letterSpacing: 12, textAlign: 'center', fontSize: 22, fontWeight: '700' },
  otpHint: { fontSize: 13, color: '#666', marginBottom: 10, textAlign: 'center' },
  btn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  divider: { color: '#aaa', marginVertical: 16 },
  googleBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center', marginBottom: 10 },
  googleBtnText: { fontSize: 15, color: '#333', fontWeight: '600' },
  linkedinBtn: { backgroundColor: '#0077b5', borderRadius: 12, padding: 14, width: '100%', alignItems: 'center', marginBottom: 20 },
  linkedinBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
  link: { color: '#1A3C6E', fontWeight: '600', marginTop: 8 },
  registerLink: { fontSize: 14, color: '#666', marginTop: 16 },
})
