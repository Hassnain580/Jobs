import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { JobCard } from '../../src/components/JobCard'
import { FraudNotice } from '../../src/components/FraudNotice'
import { AdBanner } from '../../src/components/AdBanner'
import { useFeaturedJobs, useJobs } from '../../src/hooks/useJobs'
import { useAuth } from '../../src/stores/authStore'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35', bg: '#F5F7FA' }

const CATEGORIES = [
  { name: 'Accounting', emoji: '💼', slug: 'accounting-finance' },
  { name: 'IT', emoji: '💻', slug: 'information-technology' },
  { name: 'Engineering', emoji: '⚙️', slug: 'engineering' },
  { name: 'HR', emoji: '👥', slug: 'human-resources' },
  { name: 'Medical', emoji: '🏥', slug: 'healthcare-medical' },
  { name: 'Hospitality', emoji: '🏨', slug: 'hospitality-tourism' },
  { name: 'Oil & Gas', emoji: '⛽', slug: 'oil-gas' },
  { name: 'Legal', emoji: '⚖️', slug: 'legal' },
]

export default function HomeScreen() {
  const router = useRouter()
  const { state } = useAuth()
  const { data: featured } = useFeaturedJobs()
  const { data: latest, refetch, isRefetching } = useJobs()
  const latestJobs = latest?.pages?.flatMap(p => p.data?.jobs || []) || []

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🇦🇪 UAE Careers</Text>
          <TouchableOpacity><Text style={{ fontSize: 22 }}>🔔</Text></TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Find Your Dream Job in the Gulf</Text>
          <Text style={styles.heroSub}>50–100 fresh job openings every day</Text>
          <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/search')}>
            <Text style={styles.searchPlaceholder}>🔍  Search job title, company...</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <FraudNotice />
          <AdBanner />

          {/* Featured Jobs */}
          {featured && featured.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>⭐ Featured Jobs</Text>
              <FlatList
                horizontal data={featured} keyExtractor={i => i.id}
                renderItem={({ item }) => <View style={{ width: 280, marginRight: 12 }}><JobCard job={item} /></View>}
                showsHorizontalScrollIndicator={false}
              />
            </>
          )}

          {/* Categories */}
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <FlatList
            horizontal data={CATEGORIES} keyExtractor={i => i.slug}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.catCard} onPress={() => router.push({ pathname: '/(tabs)/search', params: { category: item.slug } })}>
                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                <Text style={styles.catName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />

          {/* Latest Jobs */}
          <Text style={styles.sectionTitle}>Latest Jobs</Text>
          {latestJobs.slice(0, 5).map(job => <JobCard key={job.id} job={job} />)}

          {/* Ad Gate */}
          {!state.isLoggedIn && (
            <View style={styles.adGate}>
              <Text style={styles.adGateTitle}>🎬 Watch a short ad to see more jobs</Text>
              <Text style={styles.adGateSub}>Or login to browse unlimited jobs for free</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                <TouchableOpacity style={styles.watchBtn}><Text style={{ color: '#fff', fontWeight: '700' }}>Watch Ad</Text></TouchableOpacity>
                <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}><Text style={{ color: COLORS.primary, fontWeight: '700' }}>Login</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {state.isLoggedIn && latestJobs.slice(5).map(job => <JobCard key={job.id} job={job} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  logo: { fontSize: 20, fontWeight: '800', color: '#1A3C6E' },
  hero: { backgroundColor: '#1A3C6E', padding: 20, marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 14 },
  searchBar: { backgroundColor: '#fff', borderRadius: 10, padding: 14 },
  searchPlaceholder: { color: '#999', fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a2e', marginTop: 20, marginBottom: 12 },
  catCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginRight: 10, alignItems: 'center', minWidth: 80, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 1 },
  catName: { fontSize: 11, color: '#1A3C6E', fontWeight: '600', marginTop: 6, textAlign: 'center' },
  adGate: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginVertical: 16, borderWidth: 1, borderColor: '#eee' },
  adGateTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', textAlign: 'center' },
  adGateSub: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },
  watchBtn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  loginBtn: { backgroundColor: '#eef3ff', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
})
