import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { register } from '../../src/lib/auth'
import { useAuth } from '../../src/stores/authStore'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35' }

export default function RegisterScreen() {
  const router = useRouter()
  const { dispatch } = useAuth()
  const [tab, setTab] = useState<'seeker' | 'employer'>('seeker')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!agreed) return Alert.alert('Terms', 'Please accept the terms and conditions')
    if (!email || !password) return Alert.alert('Error', 'Please fill all required fields')
    setLoading(true)
    try {
      const result = await register({ firstName, lastName, email, phone, password, role: tab === 'employer' ? 'employer' : 'job_seeker' })
      dispatch({ type: 'SET_USER', user: result.user })
      router.replace('/(tabs)')
    } catch (e: any) {
      Alert.alert('Registration Failed', e.response?.data?.message || 'Please try again')
    } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>🇦🇪</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join UAE Careers today — it's free</Text>

        <View style={styles.tabs}>
          {(['seeker', 'employer'] as const).map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'seeker' ? '👤 Job Seeker' : '🏢 Employer'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === 'seeker' ? (
          <>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="First name" value={firstName} onChangeText={setFirstName} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Last name" value={lastName} onChangeText={setLastName} />
            </View>
          </>
        ) : (
          <TextInput style={styles.input} placeholder="Company name" value={companyName} onChangeText={setCompanyName} />
        )}
        <TextInput style={styles.input} placeholder="Email address *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone number (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.checkRow} onPress={() => setAgreed(!agreed)}>
          <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
            {agreed && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>I agree to the <Text style={{ color: COLORS.accent }}>Terms & Conditions</Text> and <Text style={{ color: COLORS.accent }}>Privacy Policy</Text></Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')}>
          <Text style={styles.loginLink}>Already have an account? <Text style={{ color: COLORS.accent, fontWeight: '700' }}>Login</Text></Text>
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
  row: { flexDirection: 'row', width: '100%' },
  input: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 14, width: '100%', fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e8ecf0' },
  checkRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 16, gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: '#1A3C6E', borderColor: '#1A3C6E' },
  checkLabel: { flex: 1, fontSize: 13, color: '#555', lineHeight: 18 },
  btn: { backgroundColor: '#FF6B35', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loginLink: { fontSize: 14, color: '#666', marginTop: 20 },
})
