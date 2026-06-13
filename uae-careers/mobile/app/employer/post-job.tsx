import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { api } from '../../src/lib/api'

const COLORS = { primary: '#1A3C6E', accent: '#FF6B35' }
const STEPS = ['Basic', 'Details', 'Apply', 'Preview']
const APPLY_METHODS = ['EMAIL', 'EXTERNAL_URL', 'WHATSAPP', 'IN_APP']
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Walk-in', 'Internship']

export default function PostJobScreen() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [country, setCountry] = useState('UAE')
  const [city, setCity] = useState('')
  const [jobType, setJobType] = useState('Full-time')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState('')
  const [importantNote, setImportantNote] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [applyMethod, setApplyMethod] = useState('EMAIL')
  const [applyEmail, setApplyEmail] = useState('')
  const [applyUrl, setApplyUrl] = useState('')
  const [applyWhatsapp, setApplyWhatsapp] = useState('')

  async function handleSubmit() {
    setLoading(true)
    try {
      await api.post('/jobs', {
        title, category, country, city, jobType, description, requirements,
        importantNote, salaryMin: parseInt(salaryMin) || null, salaryMax: parseInt(salaryMax) || null,
        applyMethod, applyEmail, applyUrl, applyWhatsapp,
      })
      Alert.alert('Success!', 'Your job has been submitted for review.', [{ text: 'OK', onPress: () => router.back() }])
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to post job')
    } finally { setLoading(false) }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepCircle, i <= step && styles.stepCircleActive]}>
              <Text style={[styles.stepNum, i <= step && styles.stepNumActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{s}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <View>
            <Text style={styles.label}>Job Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Senior Accountant" value={title} onChangeText={setTitle} />
            <Text style={styles.label}>Country</Text>
            <TextInput style={styles.input} placeholder="UAE" value={country} onChangeText={setCountry} />
            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} placeholder="Dubai" value={city} onChangeText={setCity} />
            <Text style={styles.label}>Job Type</Text>
            <View style={styles.optionRow}>
              {JOB_TYPES.map(t => (
                <TouchableOpacity key={t} style={[styles.option, jobType === t && styles.optionActive]} onPress={() => setJobType(t)}>
                  <Text style={[styles.optionText, jobType === t && styles.optionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={styles.label}>Job Description *</Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Describe the role..." value={description} onChangeText={setDescription} multiline numberOfLines={6} />
            <Text style={styles.label}>Requirements</Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="List qualifications and requirements..." value={requirements} onChangeText={setRequirements} multiline numberOfLines={4} />
            <Text style={styles.label}>⚠️ Important Note <Text style={styles.charCount}>({importantNote.length}/500)</Text></Text>
            <TextInput style={[styles.input, styles.textarea]} placeholder="Any urgent info candidates must know..." value={importantNote} onChangeText={t => setImportantNote(t.slice(0, 500))} multiline numberOfLines={3} />
            <View style={styles.salaryRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Min Salary (AED)</Text>
                <TextInput style={styles.input} placeholder="5000" value={salaryMin} onChangeText={setSalaryMin} keyboardType="numeric" />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Max Salary (AED)</Text>
                <TextInput style={styles.input} placeholder="10000" value={salaryMax} onChangeText={setSalaryMax} keyboardType="numeric" />
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.label}>How should candidates apply?</Text>
            <View style={styles.optionRow}>
              {APPLY_METHODS.map(m => (
                <TouchableOpacity key={m} style={[styles.option, applyMethod === m && styles.optionActive]} onPress={() => setApplyMethod(m)}>
                  <Text style={[styles.optionText, applyMethod === m && styles.optionTextActive]}>{m.replace('_', ' ')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {applyMethod === 'EMAIL' && <TextInput style={styles.input} placeholder="hr@company.com" value={applyEmail} onChangeText={setApplyEmail} keyboardType="email-address" />}
            {applyMethod === 'EXTERNAL_URL' && <TextInput style={styles.input} placeholder="https://careers.company.com/apply" value={applyUrl} onChangeText={setApplyUrl} />}
            {applyMethod === 'WHATSAPP' && <TextInput style={styles.input} placeholder="+971 50 000 0000" value={applyWhatsapp} onChangeText={setApplyWhatsapp} keyboardType="phone-pad" />}
          </View>
        )}

        {step === 3 && (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>{title || 'Job Title'}</Text>
            <Text style={styles.previewMeta}>📍 {city ? `${city}, ` : ''}{country}  •  {jobType}</Text>
            {(salaryMin || salaryMax) && <Text style={styles.previewSalary}>💰 AED {salaryMin || '?'} – {salaryMax || '?'}</Text>}
            {importantNote ? <View style={styles.previewNote}><Text style={{ color: '#92600A', fontWeight: '700' }}>⚠️ Important: </Text><Text style={{ color: '#555' }}>{importantNote}</Text></View> : null}
            <Text style={styles.previewSection}>Description</Text>
            <Text style={styles.previewBody}>{description || '(No description)'}</Text>
            <Text style={styles.previewSection}>Apply via: {applyMethod}</Text>
          </View>
        )}

        <View style={styles.navRow}>
          {step > 0 && <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}><Text style={styles.backBtnText}>← Back</Text></TouchableOpacity>}
          {step < 3 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(step + 1)}>
              <Text style={styles.nextBtnText}>Next →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.nextBtnText}>Submit Job</Text>}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  stepRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  stepCircleActive: { backgroundColor: COLORS.primary },
  stepNum: { fontSize: 13, fontWeight: '700', color: '#999' },
  stepNumActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#aaa' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6, marginTop: 14 },
  charCount: { color: '#999', fontWeight: '400' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 14, borderWidth: 1, borderColor: '#e8ecf0', marginBottom: 4 },
  textarea: { height: 120, textAlignVertical: 'top' },
  salaryRow: { flexDirection: 'row' },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  option: { borderRadius: 20, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff' },
  optionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionText: { fontSize: 13, color: '#555' },
  optionTextActive: { color: '#fff', fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 24, marginBottom: 40 },
  backBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14 },
  backBtnText: { color: '#555', fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  submitBtn: { backgroundColor: COLORS.accent, borderRadius: 12, paddingHorizontal: 28, paddingVertical: 14 },
  nextBtnText: { color: '#fff', fontWeight: '700' },
  preview: { backgroundColor: '#fff', borderRadius: 14, padding: 16 },
  previewTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a2e', marginBottom: 6 },
  previewMeta: { fontSize: 13, color: '#666', marginBottom: 6 },
  previewSalary: { fontSize: 14, fontWeight: '700', color: '#059669', marginBottom: 10 },
  previewNote: { backgroundColor: '#FFF8E6', borderLeftWidth: 3, borderLeftColor: '#FFB400', padding: 10, borderRadius: 8, marginBottom: 12, flexDirection: 'row', flexWrap: 'wrap' },
  previewSection: { fontSize: 14, fontWeight: '700', color: '#1A3C6E', marginTop: 14, marginBottom: 6 },
  previewBody: { fontSize: 13, color: '#444', lineHeight: 20 },
})
