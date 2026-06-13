import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Job, useSaveJob, useUnsaveJob } from '../hooks/useJobs';

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
  walk_in: 'Walk-in',
  internship: 'Internship',
};

const JOB_TYPE_COLORS: Record<string, string> = {
  full_time: '#1A3C6E',
  part_time: '#7C3AED',
  contract: '#059669',
  walk_in: '#FF6B35',
  internship: '#0891B2',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

function formatSalary(min?: number, max?: number, currency = 'AED'): string | null {
  if (!min && !max) return null;
  if (min && max) return `${currency} ${min.toLocaleString()} – ${max.toLocaleString()}`;
  if (min) return `From ${currency} ${min.toLocaleString()}`;
  return `Up to ${currency} ${max!.toLocaleString()}`;
}

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function stringToColor(str: string): string {
  const palette = ['#1A3C6E', '#FF6B35', '#7C3AED', '#059669', '#0891B2', '#DC2626'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

// ─── Component ────────────────────────────────────────────────────────────────

interface JobCardProps {
  job: Job;
  compact?: boolean;
}

export default function JobCard({ job, compact = false }: JobCardProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(job.isSaved ?? false);
  const saveJob = useSaveJob();
  const unsaveJob = useUnsaveJob();

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);
  const initials = getInitials(job.employer.companyName);
  const avatarColor = stringToColor(job.employer.companyName);
  const typeColor = JOB_TYPE_COLORS[job.jobType] ?? COLORS.primary;

  function handlePress() {
    router.push({ pathname: '/jobs/[id]', params: { id: job.slug } });
  }

  async function handleSave() {
    const next = !saved;
    setSaved(next);
    try {
      if (saved) {
        await unsaveJob.mutateAsync(job.id);
      } else {
        await saveJob.mutateAsync(job.id);
      }
    } catch {
      setSaved(!next); // revert on error
    }
  }

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={handlePress}
      activeOpacity={0.88}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        {job.employer.companyLogo ? (
          <Image source={{ uri: job.employer.companyLogo }} style={styles.logo} />
        ) : (
          <View style={[styles.logoFallback, { backgroundColor: avatarColor }]}>
            <Text style={styles.logoInitials}>{initials}</Text>
          </View>
        )}

        <View style={styles.titleBlock}>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {job.title}
          </Text>
          <View style={styles.companyRow}>
            <Text style={styles.companyName} numberOfLines={1}>
              {job.employer.companyName}
            </Text>
            {job.employer.isVerified && (
              <Ionicons name="checkmark-circle" size={13} color={COLORS.success} style={styles.verifiedIcon} />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={styles.bookmarkBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={saved ? COLORS.primary : COLORS.textGray}
          />
        </TouchableOpacity>
      </View>

      {/* ── Badges ── */}
      {(job.isFeatured || job.isWalkIn || job.isSponsored) && (
        <View style={styles.badgesRow}>
          {job.isFeatured && (
            <View style={[styles.badge, styles.featuredBadge]}>
              <Ionicons name="star" size={9} color={COLORS.gold} />
              <Text style={[styles.badgeText, { color: COLORS.gold }]}>Featured</Text>
            </View>
          )}
          {job.isWalkIn && (
            <View style={[styles.badge, styles.walkinBadge]}>
              <Ionicons name="walk" size={9} color={COLORS.accent} />
              <Text style={[styles.badgeText, { color: COLORS.accent }]}>Walk-in</Text>
            </View>
          )}
          {job.isSponsored && (
            <View style={[styles.badge, styles.sponsoredBadge]}>
              <Text style={[styles.badgeText, { color: '#7C3AED' }]}>Sponsored</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Info chips ── */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Ionicons name="location-outline" size={12} color={COLORS.textGray} />
          <Text style={styles.chipText} numberOfLines={1}>
            {job.city ? `${job.city}, ${job.country}` : job.country}
          </Text>
        </View>
        <View style={[styles.chip, { backgroundColor: typeColor + '18' }]}>
          <Text style={[styles.chipText, { color: typeColor, fontWeight: '700' }]}>
            {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
          </Text>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        {salary ? (
          <View style={styles.salaryRow}>
            <Ionicons name="cash-outline" size={13} color={COLORS.success} />
            <Text style={styles.salaryText}>{salary}</Text>
          </View>
        ) : (
          <Text style={styles.salaryNeg}>Salary not disclosed</Text>
        )}
        <Text style={styles.timeAgo}>{timeAgo(job.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Named export alias for convenience
export { JobCard };

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardCompact: {
    width: 260,
    marginBottom: 0,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logo: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: COLORS.background,
  },
  logoFallback: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitials: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  titleBlock: {
    flex: 1,
    marginRight: 8,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 3,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 13,
    color: COLORS.textGray,
    flex: 1,
  },
  verifiedIcon: {
    marginLeft: 3,
  },
  bookmarkBtn: {
    paddingTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 3,
  },
  featuredBadge: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FFE0A0',
  },
  walkinBadge: {
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: '#FFCFBE',
  },
  sponsoredBadge: {
    backgroundColor: '#F5F0FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
  },
  salaryNeg: {
    fontSize: 12,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  timeAgo: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
