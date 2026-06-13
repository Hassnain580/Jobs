import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { JobCard } from '../../src/components/JobCard'
import { useSavedJobs } from '../../src/hooks/useJobs'
import { useAuth } from '../../src/stores/authStore'
import { api } from '../../src/lib/api'
import { useQueryClient } from '@tanstack/react-query'

export default function SavedScreen() {
  const { state } = useAuth()
  const router = useRouter()
  const qc = useQueryClient()
  const { data: saved, isLoading } = useSavedJobs()

  async function unsave(jobId: string) {
    await api.delete(`/saved/${jobId}`)
    qc.invalidateQueries({ queryKey: ['saved-jobs'] })
  }

  if (!state.isLoggedIn) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ fontSize: 48 }}>🔖</Text>
        <Text style={styles.title}>Save jobs you like</Text>
        <Text style={styles.sub}>Login to save and track your favourite jobs</Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/auth/login')}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (isLoading) return <ActivityIndicator color="#1A3C6E" style={{ marginTop: 60 }} />

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.header}><Text style={styles.pageTitle}>Saved Jobs ({saved?.length || 0})</Text></View>
      <FlatList
        data={saved} keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16 }}>
            <JobCard job={item} onSave={unsave} isSaved />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No saved jobs yet. Start bookmarking!</Text>}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#F5F7FA' },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a2e' },
  sub: { fontSize: 14, color: '#666', textAlign: 'center', paddingHorizontal: 40 },
  btn: { backgroundColor: '#1A3C6E', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  header: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  pageTitle: { fontSize: 18, fontWeight: '700', color: '#1A3C6E' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
})
