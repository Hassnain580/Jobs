import React, { useState } from 'react'
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { JobCard } from '../../src/components/JobCard'
import { useJobs } from '../../src/hooks/useJobs'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35', bg: '#F5F7FA' }
const COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Walk-in', 'Internship']

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('')
  const [jobType, setJobType] = useState('')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useJobs({
    search: query, country, jobType,
  })
  const jobs = data?.pages?.flatMap(p => p.data?.jobs || []) || []

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={styles.searchBar}>
        <TextInput style={styles.input} placeholder="🔍  Job title, company, keyword..." value={query} onChangeText={setQuery} returnKeyType="search" />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {COUNTRIES.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, country === c && styles.chipActive]} onPress={() => setCountry(country === c ? '' : c)}>
            <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterRow, { marginTop: 0 }]}>
        {JOB_TYPES.map(t => (
          <TouchableOpacity key={t} style={[styles.chip, jobType === t && styles.chipActive]} onPress={() => setJobType(jobType === t ? '' : t)}>
            <Text style={[styles.chipText, jobType === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={jobs} keyExtractor={i => i.id}
          renderItem={({ item }) => <View style={{ paddingHorizontal: 16 }}><JobCard job={item} /></View>}
          ListEmptyComponent={<Text style={styles.empty}>No jobs found. Try different filters.</Text>}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={COLORS.primary} style={{ padding: 16 }} /> : null}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  searchBar: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  input: { backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, fontSize: 14, color: '#333' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 10, flexGrow: 0 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#999', marginTop: 60, fontSize: 14 },
})
