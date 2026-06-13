import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuth } from '../../src/stores/authStore'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35', bg: '#F5F7FA' }

function MenuItem({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[styles.menuLabel, danger && { color: '#e74c3c' }]}>{label}</Text>
      <Text style={{ color: '#ccc', fontSize: 16 }}>›</Text>
    </TouchableOpacity>
  )
}

export default function ProfileScreen() {
  const { state, logout } = useAuth()
  const router = useRouter()

  if (!state.isLoggedIn) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 48 }}>👤</Text>
        <Text style={styles.bigTitle}>Your Account</Text>
        <Text style={styles.sub}>Login to manage your profile, applications and job alerts</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}><Text style={styles.loginBtnText}>Login</Text></TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/auth/register')}><Text style={styles.registerBtnText}>Create Account</Text></TouchableOpacity>
      </SafeAreaView>
    )
  }

  const { user } = state
  const profile = user?.jobSeekerProfile || user?.employerProfile
  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}` : (user?.email || user?.phone || 'User')
  const isEmployer = user?.role === 'EMPLOYER'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name.slice(0, 2).toUpperCase()}</Text></View>
          <Text style={styles.name}>{name.trim()}</Text>
          <View style={[styles.roleBadge, isEmployer && { backgroundColor: '#fff3ee' }]}>
            <Text style={[styles.roleText, isEmployer && { color: COLORS.accent }]}>{isEmployer ? '🏢 Employer' : '👤 Job Seeker'}</Text>
          </View>
        </View>

        {/* Profile completion (job seekers) */}
        {!isEmployer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Completion</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${profile?.profileComplete || 20}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{profile?.profileComplete || 20}% complete</Text>
          </View>
        )}

        <View style={styles.menuSection}>
          {isEmployer ? (
            <>
              <MenuItem icon="📋" label="My Job Posts" onPress={() => {}} />
              <MenuItem icon="➕" label="Post a Job" onPress={() => router.push('/employer/post-job')} />
              <MenuItem icon="👥" label="Applications Received" onPress={() => {}} />
            </>
          ) : (
            <>
              <MenuItem icon="📄" label="My Applications" onPress={() => {}} />
              <MenuItem icon="🔔" label="Job Alerts" onPress={() => {}} />
              <MenuItem icon="📎" label="Upload CV" onPress={() => {}} />
            </>
          )}
          <MenuItem icon="✏️" label="Edit Profile" onPress={() => {}} />
          <MenuItem icon="⚙️" label="Settings" onPress={() => {}} />
          <MenuItem icon="🚪" label="Logout" onPress={logout} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F5F7FA', padding: 24 },
  bigTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  sub: { fontSize: 14, color: '#666', textAlign: 'center' },
  loginBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, marginTop: 8, width: '100%', alignItems: 'center' },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  registerBtn: { backgroundColor: '#eef3ff', paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  registerBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  avatarSection: { backgroundColor: COLORS.primary, padding: 30, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  roleBadge: { backgroundColor: '#eef3ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8 },
  roleText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  card: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  progressBg: { height: 8, backgroundColor: '#eee', borderRadius: 4 },
  progressFill: { height: 8, backgroundColor: COLORS.accent, borderRadius: 4 },
  progressLabel: { fontSize: 12, color: '#666', marginTop: 6 },
  menuSection: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  menuLabel: { flex: 1, fontSize: 15, color: '#333' },
})
