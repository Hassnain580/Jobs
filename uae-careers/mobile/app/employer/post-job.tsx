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
import { api } from '../../src/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A3C6E',
  accent: '#FF6B35',
  gold: '#FFB400',
  background: '#F5F7FA',
  white: '#FFFFFF',
  textDark: '#1a1a2e',
  textGray: '#666',
  border: '#E5E7EB',
  success: '#059669',
};

const STEPS = [
  { label: 'Basic', icon: 'document-text' as const },
  { label: 'Details', icon: 'clipboard' as const },
  { label: 'Salary & Note', icon: 'cash' as const },
  { label: 'Apply & Submit', icon: 'send' as const },
];

const JOB_TYPES: { label: string; value: string }[] = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Internship', value: 'internship' },
];

const CATEGORIES = [
  'Accounting & Finance',
  'Administration',
  'Construction',
  'Customer Service',
  'Engineering',
  'Healthcare & Medical',
  'Hospitality & Tourism',
  'Human Resources',
  'Information Technology',
  'Legal',
  'Marketing & Sales',
  'Oil & Gas',
  'Operations',
  'Real Estate',
  'Teaching & Education',
];

const COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain'];

const APPLY_METHODS: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Email', value: 'email', icon: 'mail' },
  { label: 'Phone', value: 'phone', icon: 'call' },
  { label: 'WhatsApp', value: 'whatsapp', icon: 'logo-whatsapp' },
  { label: 'Website', value: 'website', icon: 'globe' },
  { label: 'Walk-in / In Person', value: 'in_person', icon: 'walk' },
];

// ─── Form Types ───────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  title: string;
  category: string;
  country: string;
  city: string;
  jobType: string;
  // Step 2
  description: string;
  requirements: string;
  // Step 3
  importantNote: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryHidden: boolean;
  // Step 4
  applyMethod: string;
  applyContact: string;
  applyUrl: string;
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Label({ text, required, hint }: { text: string; required?: boolean; hint?: string }) {
  return (
    <View style={styles.labelWrap}>
      <Text style={styles.label}>
        {text}
        {required ? <Text style={{ color: COLORS.accent }}> *</Text> : null}
      </Text>
      {hint && <Text style={styles.labelHint}>{hint}</Text>}
    </View>
  );
}

function PickerChip({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons name={icon} size={14} color={active ? COLORS.white : COLORS.textGray} />
      )}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  required,
  hint,
  maxLength,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
  required?: boolean;
  hint?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Label text={label} required={required} hint={hint} />
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        value={value}
        onChangeText={maxLength ? (v) => onChangeText(v.slice(0, maxLength)) : onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoCorrect={false}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {maxLength && (
        <Text style={styles.charCount}>{value.length}/{maxLength}</Text>
      )}
    </View>
  );
}

// ─── Step Progress ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <View style={styles.stepRow}>
      {STEPS.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <React.Fragment key={step.label}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleCompleted,
                  isCurrent && styles.stepCircleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                ) : (
                  <Text style={[styles.stepNum, (isCompleted || isCurrent) && styles.stepNumActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text
                style={[styles.stepLabel, isCurrent && styles.stepLabelActive]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>
            {i < totalSteps - 1 && (
              <View style={[styles.stepConnector, isCompleted && styles.stepConnectorDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Step Screens ─────────────────────────────────────────────────────────────

function Step1Basic({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  return (
    <View>
      <Field
        label="Job Title"
        required
        value={form.title}
        onChangeText={(v) => setForm({ ...form, title: v })}
        placeholder="e.g. Senior Accountant"
        hint="Be specific — better titles get more applicants"
      />

      <Label text="Category" required />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((cat) => (
            <PickerChip
              key={cat}
              label={cat}
              active={form.category === cat}
              onPress={() => setForm({ ...form, category: cat })}
            />
          ))}
        </View>
      </ScrollView>

      <Label text="Country" required />
      <View style={styles.chipsRow}>
        {COUNTRIES.map((c) => (
          <PickerChip
            key={c}
            label={c}
            active={form.country === c}
            onPress={() => setForm({ ...form, country: c })}
          />
        ))}
      </View>

      <Field
        label="City"
        value={form.city}
        onChangeText={(v) => setForm({ ...form, city: v })}
        placeholder="Dubai, Abu Dhabi, Riyadh..."
      />

      <Label text="Job Type" required />
      <View style={styles.chipsRow}>
        {JOB_TYPES.map((t) => (
          <PickerChip
            key={t.value}
            label={t.label}
            active={form.jobType === t.value}
            onPress={() => setForm({ ...form, jobType: t.value })}
          />
        ))}
      </View>
    </View>
  );
}

function Step2Details({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  return (
    <View>
      <Field
        label="Job Description"
        required
        value={form.description}
        onChangeText={(v) => setForm({ ...form, description: v })}
        placeholder="Describe the role, responsibilities, and work environment..."
        multiline
        hint="Minimum 100 characters recommended"
      />

      <Field
        label="Requirements"
        value={form.requirements}
        onChangeText={(v) => setForm({ ...form, requirements: v })}
        placeholder="List qualifications, experience, skills required..."
        multiline
      />
    </View>
  );
}

function Step3SalaryNote({ form, setForm }: { form: FormData; setForm: (f: FormData) => void }) {
  return (
    <View>
      {/* Salary */}
      <Label text="Salary Range" hint="Leave blank to show 'Not disclosed'" />
      <TouchableOpacity
        style={styles.toggleRow}
        onPress={() => setForm({ ...form, salaryHidden: !form.salaryHidden })}
      >
        <View style={[styles.toggle, form.salaryHidden && styles.toggleActive]}>
          <View style={[styles.toggleThumb, form.salaryHidden && styles.toggleThumbActive]} />
        </View>
        <Text style={styles.toggleLabel}>Hide salary from listing</Text>
      </TouchableOpacity>

      {!form.salaryHidden && (
        <View style={styles.salaryRow}>
          <View style={styles.salaryField}>
            <Field
              label="Min (AED)"
              value={form.salaryMin}
              onChangeText={(v) => setForm({ ...form, salaryMin: v })}
              placeholder="5,000"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.salaryDash}>
            <Text style={styles.salaryDashText}>–</Text>
          </View>
          <View style={styles.salaryField}>
            <Field
              label="Max (AED)"
              value={form.salaryMax}
              onChangeText={(v) => setForm({ ...form, salaryMax: v })}
              placeholder="10,000"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {/* Important Note */}
      <Field
        label="Important Note"
        value={form.importantNote}
        onChangeText={(v) => setForm({ ...form, importantNote: v })}
        placeholder="Any urgent info candidates must know before applying (e.g. walk-in timings, dress code, required documents)..."
        multiline
        maxLength={500}
        hint="This will appear in an amber box on the job detail page"
      />

      {form.importantNote.length > 0 && (
        <View style={styles.notePreview}>
          <View style={styles.notePreviewHeader}>
            <Ionicons name="warning" size={14} color="#D97706" />
            <Text style={styles.notePreviewTitle}>Preview</Text>
          </View>
          <Text style={styles.notePreviewText}>{form.importantNote}</Text>
        </View>
      )}
    </View>
  );
}

function Step4ApplySubmit({
  form,
  setForm,
  onSubmit,
  loading,
}: {
  form: FormData;
  setForm: (f: FormData) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <View>
      <Label text="How should candidates apply?" required />
      <View style={styles.chipsRow}>
        {APPLY_METHODS.map((m) => (
          <PickerChip
            key={m.value}
            label={m.label}
            icon={m.icon}
            active={form.applyMethod === m.value}
            onPress={() => setForm({ ...form, applyMethod: m.value, applyContact: '' })}
          />
        ))}
      </View>

      {form.applyMethod === 'email' && (
        <Field
          label="Email Address"
          required
          value={form.applyContact}
          onChangeText={(v) => setForm({ ...form, applyContact: v })}
          placeholder="hr@yourcompany.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}
      {form.applyMethod === 'phone' && (
        <Field
          label="Phone Number"
          required
          value={form.applyContact}
          onChangeText={(v) => setForm({ ...form, applyContact: v })}
          placeholder="+971 50 000 0000"
          keyboardType="phone-pad"
        />
      )}
      {form.applyMethod === 'whatsapp' && (
        <Field
          label="WhatsApp Number"
          required
          value={form.applyContact}
          onChangeText={(v) => setForm({ ...form, applyContact: v })}
          placeholder="+971 50 000 0000"
          keyboardType="phone-pad"
        />
      )}
      {form.applyMethod === 'website' && (
        <Field
          label="Application URL"
          required
          value={form.applyUrl}
          onChangeText={(v) => setForm({ ...form, applyUrl: v })}
          placeholder="https://careers.yourcompany.com/apply"
          keyboardType="url"
          autoCapitalize="none"
        />
      )}
      {form.applyMethod === 'in_person' && (
        <Field
          label="Walk-in Address / Instructions"
          required
          value={form.applyContact}
          onChangeText={(v) => setForm({ ...form, applyContact: v })}
          placeholder="Building name, floor, timing, dress code..."
          multiline
        />
      )}

      {/* Preview card */}
      <View style={styles.previewCard}>
        <Text style={styles.previewCardTitle}>Preview</Text>
        <Text style={styles.previewJobTitle}>{form.title || '(No title)'}</Text>
        <Text style={styles.previewMeta}>
          {form.city ? `${form.city}, ` : ''}{form.country || 'Country'}{'  ·  '}{JOB_TYPES.find((t) => t.value === form.jobType)?.label ?? form.jobType}
        </Text>
        {!form.salaryHidden && (form.salaryMin || form.salaryMax) && (
          <Text style={styles.previewSalary}>
            AED {form.salaryMin || '?'} – {form.salaryMax || '?'}
          </Text>
        )}
        {form.importantNote ? (
          <View style={styles.previewNote}>
            <Ionicons name="warning" size={12} color="#D97706" />
            <Text style={styles.previewNoteText} numberOfLines={2}>{form.importantNote}</Text>
          </View>
        ) : null}
        <Text style={styles.previewCategory}>{form.category || 'Category not set'}</Text>
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
        onPress={onSubmit}
        disabled={loading}
        activeOpacity={0.88}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.submitBtnText}>Submit Job Listing</Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.submitNote}>
        Your listing will be reviewed before going live. This usually takes under 24 hours.
      </Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  title: '',
  category: '',
  country: 'UAE',
  city: '',
  jobType: 'full_time',
  description: '',
  requirements: '',
  importantNote: '',
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: 'AED',
  salaryHidden: false,
  applyMethod: 'email',
  applyContact: '',
  applyUrl: '',
};

export default function PostJobScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  function validateStep(): boolean {
    switch (step) {
      case 0:
        if (!form.title.trim()) {
          Alert.alert('Required', 'Please enter a job title.');
          return false;
        }
        if (!form.category) {
          Alert.alert('Required', 'Please select a category.');
          return false;
        }
        if (!form.country) {
          Alert.alert('Required', 'Please select a country.');
          return false;
        }
        return true;
      case 1:
        if (!form.description.trim() || form.description.trim().length < 30) {
          Alert.alert('Required', 'Please enter a job description (at least 30 characters).');
          return false;
        }
        return true;
      case 2:
        return true;
      case 3:
        if (!form.applyMethod) {
          Alert.alert('Required', 'Please select how candidates should apply.');
          return false;
        }
        if (form.applyMethod !== 'website' && !form.applyContact.trim()) {
          Alert.alert('Required', 'Please enter the contact information for applying.');
          return false;
        }
        if (form.applyMethod === 'website' && !form.applyUrl.trim()) {
          Alert.alert('Required', 'Please enter the application URL.');
          return false;
        }
        return true;
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    try {
      await api.post('/jobs', {
        title: form.title.trim(),
        category: form.category,
        country: form.country,
        city: form.city.trim() || undefined,
        jobType: form.jobType,
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
        importantNote: form.importantNote.trim() || undefined,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin.replace(/,/g, ''), 10) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax.replace(/,/g, ''), 10) : undefined,
        salaryCurrency: form.salaryCurrency,
        salaryHidden: form.salaryHidden,
        applyMethod: form.applyMethod,
        applyContact: form.applyContact.trim() || undefined,
        applyUrl: form.applyUrl.trim() || undefined,
      });
      Alert.alert(
        '🎉 Job Submitted!',
        'Your listing has been submitted for review and will go live within 24 hours.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }],
      );
    } catch (e: any) {
      Alert.alert('Submission Failed', e.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Sticky header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (step > 0 ? handleBack() : router.back())}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* ── Step indicator ── */}
      <StepIndicator currentStep={step} totalSteps={STEPS.length} />

      {/* ── Step content ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.stepHeading}>{STEPS[step].label}</Text>

          {step === 0 && <Step1Basic form={form} setForm={setForm} />}
          {step === 1 && <Step2Details form={form} setForm={setForm} />}
          {step === 2 && <Step3SalaryNote form={form} setForm={setForm} />}
          {step === 3 && (
            <Step4ApplySubmit
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              loading={loading}
            />
          )}

          {/* ── Nav buttons (steps 0-2) ── */}
          {step < STEPS.length - 1 && (
            <View style={styles.navRow}>
              {step > 0 && (
                <TouchableOpacity style={styles.navBackBtn} onPress={handleBack}>
                  <Ionicons name="arrow-back" size={16} color={COLORS.textGray} />
                  <Text style={styles.navBackText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.navNextBtn} onPress={handleNext}>
                <Text style={styles.navNextText}>Next</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    marginRight: 4,
  },
  // Step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.border,
    marginBottom: 18,
    marginHorizontal: 4,
  },
  stepConnectorDone: {
    backgroundColor: COLORS.success,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCurrent: {
    backgroundColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.success,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  stepNumActive: {
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '500',
    maxWidth: 50,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  stepHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 16,
    marginTop: 8,
  },
  // Field
  fieldWrap: {
    marginBottom: 8,
  },
  labelWrap: {
    marginBottom: 6,
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  labelHint: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputMultiline: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  // Chips
  horizontalScroll: {
    flexGrow: 0,
    marginVertical: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.white,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  chipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  // Salary
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  salaryField: {
    flex: 1,
  },
  salaryDash: {
    paddingTop: 38,
  },
  salaryDashText: {
    fontSize: 18,
    color: COLORS.textGray,
    fontWeight: '700',
  },
  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleLabel: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  // Note preview
  notePreview: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  notePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  notePreviewTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92600A',
  },
  notePreviewText: {
    fontSize: 13,
    color: '#713F12',
    lineHeight: 18,
  },
  // Preview card
  previewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  previewJobTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 13,
    color: COLORS.textGray,
    marginBottom: 6,
  },
  previewSalary: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.success,
    marginBottom: 8,
  },
  previewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  previewNoteText: {
    flex: 1,
    fontSize: 12,
    color: '#713F12',
    lineHeight: 16,
  },
  previewCategory: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16,
  },
  submitNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  // Navigation
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: COLORS.white,
  },
  navBackText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  navNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 13,
  },
  navNextText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
