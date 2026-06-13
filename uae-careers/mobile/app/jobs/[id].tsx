import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  ActivityIndicator,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJob, useSaveJob, useUnsaveJob } from '../../src/hooks/useJobs';
import FraudNotice from '../../src/components/FraudNotice';
import AdBanner from '../../src/components/AdBanner';
import { useAuth } from '../../src/stores/authStore';

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

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  walk_in: 'Walk-in Interview',
  internship: 'Internship',
};

const APPLY_METHOD_LABELS: Record<string, string> = {
  email: 'Apply via Email',
  phone: 'Call to Apply',
  website: 'Apply on Website',
  whatsapp: 'Apply via WhatsApp',
  in_person: 'Walk-in / In Person',
};

// ─── Info Chip ─────────────────────────────────────────────────────────────────

function InfoChip({
  icon,
  text,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
}) {
  return (
    <View style={[styles.chip, color ? { backgroundColor: color + '18', borderColor: color + '40' } : undefined]}>
      <Ionicons name={icon} size={13} color={color ?? COLORS.textGray} />
      <Text style={[styles.chipText, color ? { color, fontWeight: '600' } : undefined]}>{text}</Text>
    </View>
  );
}

// ─── Product Banners ──────────────────────────────────────────────────────────

const BANNERS = [
  { id: '1', title: 'CV Writing Service', subtitle: 'Professional CV for AED 99', bg: '#1A3C6E', textColor: '#FFFFFF' },
  { id: '2', title: 'Interview Coaching', subtitle: 'Ace your next interview', bg: '#FF6B35', textColor: '#FFFFFF' },
  { id: '3', title: 'Featured Listing', subtitle: 'Boost your job visibility', bg: '#FFB400', textColor: '#1a1a2e' },
];

// ─── Job Detail Screen ────────────────────────────────────────────────────────

type TabKey = 'description' | 'requirements' | 'company';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state } = useAuth();
  const { data: job, isLoading, error } = useJob(id ?? '');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  async function handleSave() {
    if (!state.isLoggedIn) return router.push('/auth/login');
    const next = !saved;
    setSaved(next);
    try {
      if (saved) {
        await unsaveJob.mutateAsync(job!.id);
      } else {
        await saveJob.mutateAsync(job!.id);
      }
    } catch {
      setSaved(!next);
    }
  }

  async function handleApply() {
    if (!state.isLoggedIn) {
      Alert.alert('Login Required', 'Please login to apply for this job.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    if (!job) return;

    switch (job.applyMethod) {
      case 'email':
        Linking.openURL(`mailto:${job.applyContact}?subject=Application for ${job.title}`);
        break;
      case 'phone':
        Linking.openURL(`tel:${job.applyContact}`);
        break;
      case 'whatsapp':
        Linking.openURL(`https://wa.me/${job.applyContact?.replace(/\D/g, '')}`);
        break;
      case 'website':
        Linking.openURL(job.applyUrl ?? job.applyContact ?? '');
        break;
      case 'in_person':
        Alert.alert('Walk-in Interview', `Visit: ${job.applyContact ?? 'See job description for address details.'}`);
        break;
      default:
        Alert.alert('Apply', 'Contact the employer via the details in the job description.');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: `Check out this job: ${job?.title} at ${job?.employer.companyName}\nhttps://uaecareer.ae/jobs/${job?.slug}`,
        title: job?.title,
      });
    } catch {
      // noop
    }
  }

  function getInitials(name: string): string {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  }

  function formatSalary(): string | null {
    if (!job?.salaryMin && !job?.salaryMax) return null;
    const cur = job.salaryCurrency ?? 'AED';
    if (job.salaryMin && job.salaryMax)
      return `${cur} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `From ${cur} ${job.salaryMin.toLocaleString()}`;
    return `Up to ${cur} ${job.salaryMax!.toLocaleString()}`;
  }

  function timeAgo(dateStr: string): string {
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
    if (diffDays === 0) return 'Posted today';
    if (diffDays === 1) return 'Posted yesterday';
    if (diffDays < 7) return `Posted ${diffDays} days ago`;
    return `Posted ${Math.floor(diffDays / 7)} weeks ago`;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  if (error || !job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Job Details</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Job not found</Text>
          <Text style={styles.errorText}>This job may have been removed or expired.</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={() => router.back()}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const salary = formatSalary();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{job.title}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerActionBtn}>
            <Ionicons name="share-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.headerActionBtn}>
            <Ionicons
              name={saved ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={saved ? COLORS.gold : COLORS.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Company hero ── */}
        <View style={styles.companyHero}>
          {job.employer.companyLogo ? (
            <Image source={{ uri: job.employer.companyLogo }} style={styles.companyLogo} />
          ) : (
            <View style={styles.companyLogoFallback}>
              <Text style={styles.companyLogoInitials}>{getInitials(job.employer.companyName)}</Text>
            </View>
          )}

          <Text style={styles.jobTitle}>{job.title}</Text>

          <View style={styles.companyNameRow}>
            <Text style={styles.companyNameText}>{job.employer.companyName}</Text>
            {job.employer.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            )}
          </View>

          <Text style={styles.postedDate}>{timeAgo(job.createdAt)}</Text>
        </View>

        {/* ── Chips ── */}
        <View style={styles.chipsArea}>
          <InfoChip icon="location" text={job.city ? `${job.city}, ${job.country}` : job.country} />
          <InfoChip
            icon="time"
            text={JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
            color={COLORS.primary}
          />
          {salary && <InfoChip icon="cash" text={salary} color={COLORS.success} />}
          {job.isFeatured && <InfoChip icon="star" text="Featured" color={COLORS.gold} />}
          {job.isWalkIn && <InfoChip icon="walk" text="Walk-in" color={COLORS.accent} />}
        </View>

        {/* ── Important Note ── */}
        {job.importantNote && (
          <View style={styles.importantNote}>
            <View style={styles.importantNoteHeader}>
              <Ionicons name="warning" size={16} color="#D97706" />
              <Text style={styles.importantNoteTitle}>Important Note</Text>
            </View>
            <Text style={styles.importantNoteText}>{job.importantNote}</Text>
          </View>
        )}

        {/* Ad */}
        <View style={styles.adWrap}>
          <AdBanner size="small" />
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabsRow}>
          {([
            { key: 'description', label: 'Description' },
            { key: 'requirements', label: 'Requirements' },
            { key: 'company', label: 'Company' },
          ] as { key: TabKey; label: string }[]).map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, activeTab === t.key && styles.tabActive]}
              onPress={() => setActiveTab(t.key)}
            >
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab Content ── */}
        <View style={styles.tabContent}>
          {activeTab === 'description' && (
            <Text style={styles.bodyText}>{job.description || 'No description provided.'}</Text>
          )}
          {activeTab === 'requirements' && (
            <Text style={styles.bodyText}>{job.requirements || 'No specific requirements listed.'}</Text>
          )}
          {activeTab === 'company' && (
            <View>
              <View style={styles.companyInfoRow}>
                <View style={styles.companyInfoIcon}>
                  <Ionicons name="business" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.companyInfoLabel}>Company</Text>
                <Text style={styles.companyInfoValue}>{job.employer.companyName}</Text>
              </View>
              {job.employer.industry && (
                <View style={styles.companyInfoRow}>
                  <View style={styles.companyInfoIcon}>
                    <Ionicons name="briefcase" size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.companyInfoLabel}>Industry</Text>
                  <Text style={styles.companyInfoValue}>{job.employer.industry}</Text>
                </View>
              )}
              {job.employer.country && (
                <View style={styles.companyInfoRow}>
                  <View style={styles.companyInfoIcon}>
                    <Ionicons name="location" size={14} color={COLORS.primary} />
                  </View>
                  <Text style={styles.companyInfoLabel}>Country</Text>
                  <Text style={styles.companyInfoValue}>{job.employer.country}</Text>
                </View>
              )}
              <View style={styles.companyInfoRow}>
                <View style={styles.companyInfoIcon}>
                  <Ionicons name="eye" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.companyInfoLabel}>Views</Text>
                <Text style={styles.companyInfoValue}>{job.viewCount.toLocaleString()}</Text>
              </View>
              <View style={styles.companyInfoRow}>
                <View style={styles.companyInfoIcon}>
                  <Ionicons name="people" size={14} color={COLORS.primary} />
                </View>
                <Text style={styles.companyInfoLabel}>Applied</Text>
                <Text style={styles.companyInfoValue}>{job.applicationCount.toLocaleString()}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Product banners ── */}
        <Text style={styles.sectionLabel}>Explore Services</Text>
        <FlatList
          horizontal
          data={BANNERS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.productBanner, { backgroundColor: item.bg }]}>
              <Text style={[styles.productBannerTitle, { color: item.textColor }]}>{item.title}</Text>
              <Text style={[styles.productBannerSub, { color: item.textColor + 'CC' }]}>{item.subtitle}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannersRow}
        />

        {/* ── Fraud notice ── */}
        <View style={styles.fraudWrap}>
          <FraudNotice />
        </View>

        {/* Spacer for fixed apply bar */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* ── Fixed Apply Button ── */}
      <View style={styles.applyBar}>
        <View style={styles.applyBarInner}>
          <View style={styles.applyMethodInfo}>
            <Text style={styles.applyMethodLabel}>How to apply</Text>
            <Text style={styles.applyMethodValue} numberOfLines={1}>
              {APPLY_METHOD_LABELS[job.applyMethod] ?? 'Contact employer'}
            </Text>
          </View>
          <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.88}>
            <Ionicons name="send" size={16} color={COLORS.white} />
            <Text style={styles.applyBtnText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerActionBtn: {
    padding: 6,
  },
  loader: {
    marginTop: 60,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 8,
  },
  errorBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  errorBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  // Company hero
  companyHero: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  companyLogo: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.background,
    marginBottom: 14,
  },
  companyLogoFallback: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  companyLogoInitials: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 6,
  },
  companyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  companyNameText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
  postedDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  // Chips
  chipsArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  // Important note
  importantNote: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
  },
  importantNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  importantNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92600A',
  },
  importantNoteText: {
    fontSize: 13,
    color: '#713F12',
    lineHeight: 20,
  },
  adWrap: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tabContent: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    minHeight: 80,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 22,
  },
  // Company info rows
  companyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 10,
  },
  companyInfoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfoLabel: {
    fontSize: 13,
    color: COLORS.textGray,
    width: 80,
  },
  companyInfoValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  // Product banners
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  bannersRow: {
    paddingHorizontal: 16,
    gap: 10,
  },
  productBanner: {
    width: 200,
    borderRadius: 14,
    padding: 16,
    justifyContent: 'center',
    minHeight: 80,
  },
  productBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  productBannerSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  fraudWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  // Apply bar
  applyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  applyBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyMethodInfo: {
    flex: 1,
  },
  applyMethodLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  applyMethodValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 12,
  },
  applyBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
});
