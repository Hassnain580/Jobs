import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Alert, ActivityIndicator, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useJob } from '../../src/hooks/useJobs'
import { FraudNotice } from '../../src/components/FraudNotice'
import { api } from '../../src/lib/api'
import { useQueryClient } from '@tanstack/react-query'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35', gold: '#FFB400' }

type Tab = 'description' | 'requirements' | 'company'

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: job, isLoading } = useJob(id)
  const [tab, setTab] = useState<Tab>('description')
  const [saved, setSaved] = useState(false)
  const qc = useQueryClient()
  const router = useRouter()

  async function handleApply() {
    if (!job) return
    switch (job.applyMethod) {
      case 'EMAIL': case 'email':
        Linking.openURL(`mailto:${job.applyContact}?subject=Application for ${job.title}`)
        break
      case 'WHATSAPP': case 'whatsapp':
        Linking.openURL(`https://wa.me/${job.applyContact?.replace(/\D/g, '')}`)
        break
      case 'EXTERNAL_URL': case 'website':
        Linking.openURL(job.applyUrl || job.applyContact || '')
        break
      case 'IN_APP': case 'in_person':
        Alert.alert('Apply Now', 'Would you like to submit your application?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Apply', onPress: async () => {
            try {
              await api.post(`/applications/jobs/${job.id}/apply`)
              Alert.alert('Success', 'Application submitted!')
              qc.invalidateQueries({ queryKey: ['my-applications'] })
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to apply')
            }
          }}
        ])
        break
    }
  }

  async function handleSave() {
    if (!job) return
    setSaved(!saved)
    if (!saved) await api.post(`/saved/${job.id}`)
    else await api.delete(`/saved/${job.id}`)
    qc.invalidateQueries({ queryKey: ['saved-jobs'] })
  }

  async function handleShare() {
    if (!job) return
    Share.share({ message: `${job.title} at ${job.employer?.companyName}\nhttps://uaecareer.ae/jobs/${job.slug}` })
  }

  if (isLoading) return <ActivityIndicator color={COLORS.primary} style={{ marginTop: 80 }} />
  if (!job) return <View style={styles.center}><Text>Job not found</Text></View>

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <View style={styles.logoCircle}><Text style={styles.logoText}>{job.employer?.companyName?.slice(0, 2).toUpperCase() || 'CO'}</Text></View>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <Text style={styles.company}>{job.employer?.companyName}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>📍 {job.city ? `${job.city}, ` : ''}{job.country}</Text>
            {job.jobType && <Text style={styles.meta}>• {job.jobType}</Text>}
          </View>
          {!job.salaryHidden && job.salaryMin && (
            <Text style={styles.salary}>💰 {job.salaryCurrency} {job.salaryMin?.toLocaleString()}{job.salaryMax ? `–${job.salaryMax?.toLocaleString()}` : '+'}</Text>
          )}
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleSave}><Text style={{ fontSize: 22 }}>{saved ? '🔖' : '🏷️'}</Text></TouchableOpacity>
            <TouchableOpacity onPress={handleShare}><Text style={{ fontSize: 22 }}>📤</Text></TouchableOpacity>
          </View>
        </View>

        {/* Important Note */}
        {job.importantNote && (
          <View style={styles.importantNote}>
            <Text style={styles.importantNoteTitle}>⚠️ Important Note</Text>
            <Text style={styles.importantNoteText}>{job.importantNote}</Text>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['description', 'requirements', 'company'] as Tab[]).map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {tab === 'description' && <Text style={styles.bodyText}>{job.description}</Text>}
          {tab === 'requirements' && <Text style={styles.bodyText}>{job.requirements || 'No specific requirements listed.'}</Text>}
          {tab === 'company' && (
            <View>
              <Text style={styles.bodyText}>{job.employer?.description || `${job.employer?.companyName} is looking for talented candidates to join their team.`}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
          <FraudNotice />
        </View>
      </ScrollView>

      {/* Fixed Apply Button */}
      <View style={styles.applyBar}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
          <Text style={styles.applyBtnText}>Apply Now →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerCard: { backgroundColor: '#fff', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  logoCircle: { width: 64, height: 64, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  jobTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', textAlign: 'center', marginBottom: 4 },
  company: { fontSize: 15, color: '#555', marginBottom: 8 },
  metaRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  meta: { fontSize: 13, color: '#666' },
  salary: { fontSize: 14, fontWeight: '700', color: '#059669', marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  importantNote: { backgroundColor: '#FFF8E6', borderLeftWidth: 4, borderLeftColor: COLORS.gold, margin: 16, borderRadius: 10, padding: 14 },
  importantNoteTitle: { fontSize: 14, fontWeight: '800', color: '#92600A', marginBottom: 6 },
  importantNoteText: { fontSize: 13, color: '#555', lineHeight: 20 },
  tabRow: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: COLORS.accent },
  tabBtnText: { fontSize: 13, color: '#999', fontWeight: '600' },
  tabBtnTextActive: { color: COLORS.accent },
  content: { padding: 16 },
  bodyText: { fontSize: 14, color: '#444', lineHeight: 22 },
  applyBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#eee' },
  applyBtn: { backgroundColor: COLORS.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
})
