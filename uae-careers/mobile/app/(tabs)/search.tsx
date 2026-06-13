import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import JobCard from '../../src/components/JobCard';
import AdBanner from '../../src/components/AdBanner';
import { useJobs, JobFilters } from '../../src/hooks/useJobs';
import { useAuth } from '../../src/stores/authStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  primary: '#1A3C6E',
  accent: '#FF6B35',
  background: '#F5F7FA',
  white: '#FFFFFF',
  textDark: '#1a1a2e',
  textGray: '#666',
  border: '#E5E7EB',
};

const COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Oman', 'Bahrain', 'Egypt', 'Jordan'];
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
const JOB_TYPES: { label: string; value: string }[] = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Walk-in', value: 'walk_in' },
  { label: 'Internship', value: 'internship' },
];

const GUEST_LIMIT = 5;

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Filter Modal ─────────────────────────────────────────────────────────────

interface FilterState {
  country: string;
  category: string;
  jobType: string;
}

interface FilterModalProps {
  visible: boolean;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
}

function FilterModal({ visible, filters, onApply, onClose }: FilterModalProps) {
  const [local, setLocal] = useState<FilterState>(filters);

  function reset() {
    setLocal({ country: '', category: '', jobType: '' });
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Jobs</Text>
            <TouchableOpacity onPress={reset}>
              <Text style={styles.modalReset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Country */}
            <Text style={styles.filterGroupLabel}>Country</Text>
            <View style={styles.filterChipsWrap}>
              {COUNTRIES.map((c) => (
                <FilterChip
                  key={c}
                  label={c}
                  active={local.country === c}
                  onPress={() => setLocal((p) => ({ ...p, country: p.country === c ? '' : c }))}
                />
              ))}
            </View>

            {/* Job Type */}
            <Text style={styles.filterGroupLabel}>Job Type</Text>
            <View style={styles.filterChipsWrap}>
              {JOB_TYPES.map((t) => (
                <FilterChip
                  key={t.value}
                  label={t.label}
                  active={local.jobType === t.value}
                  onPress={() => setLocal((p) => ({ ...p, jobType: p.jobType === t.value ? '' : t.value }))}
                />
              ))}
            </View>

            {/* Category */}
            <Text style={styles.filterGroupLabel}>Category</Text>
            <View style={styles.filterChipsWrap}>
              {CATEGORIES.map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={local.category === cat}
                  onPress={() => setLocal((p) => ({ ...p, category: p.category === cat ? '' : cat }))}
                />
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={() => { onApply(local); onClose(); }}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Search Screen ────────────────────────────────────────────────────────────

export default function SearchScreen() {
  const params = useLocalSearchParams<{ category?: string; jobType?: string; featured?: string }>();
  const { state } = useAuth();
  const [query, setQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [adUnlocked, setAdUnlocked] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    country: '',
    category: params.category ?? '',
    jobType: params.jobType ?? '',
  });

  const queryFilters: JobFilters = {
    query,
    country: filters.country || undefined,
    category: filters.category || undefined,
    jobType: filters.jobType || undefined,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isFetching } = useJobs(queryFilters);
  const jobs = data?.pages?.flatMap((p) => p.data?.jobs ?? []) ?? [];

  const activeFilterCount = [filters.country, filters.category, filters.jobType].filter(Boolean).length;

  const visibleJobs =
    !state.isLoggedIn && !adUnlocked ? jobs.slice(0, GUEST_LIMIT) : jobs;
  const showAdGate =
    !state.isLoggedIn && !adUnlocked && jobs.length >= GUEST_LIMIT;

  function handleWatchAd() {
    Alert.alert('Watch Ad', 'Ad would play here. Unlocking more results.', [
      { text: 'OK', onPress: () => setAdUnlocked(true) },
    ]);
  }

  const inputRef = useRef<TextInput>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Search Bar ── */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputWrap}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Job title, company, keyword..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
            onPress={() => setFilterModalOpen(true)}
          >
            <Ionicons
              name="options"
              size={20}
              color={activeFilterCount > 0 ? COLORS.white : COLORS.primary}
            />
            {activeFilterCount > 0 && (
              <View style={styles.filterCount}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Active Filter Quick-chips ── */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.activeFilters}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {filters.country ? (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setFilters((f) => ({ ...f, country: '' }))}
              >
                <Text style={styles.activeChipText}>{filters.country}</Text>
                <Ionicons name="close" size={12} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}
            {filters.category ? (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setFilters((f) => ({ ...f, category: '' }))}
              >
                <Text style={styles.activeChipText}>{filters.category}</Text>
                <Ionicons name="close" size={12} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}
            {filters.jobType ? (
              <TouchableOpacity
                style={styles.activeChip}
                onPress={() => setFilters((f) => ({ ...f, jobType: '' }))}
              >
                <Text style={styles.activeChipText}>
                  {JOB_TYPES.find((t) => t.value === filters.jobType)?.label ?? filters.jobType}
                </Text>
                <Ionicons name="close" size={12} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              onPress={() => setFilters({ country: '', category: '', jobType: '' })}
              style={styles.clearAllChip}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── Results count ── */}
        {!isLoading && (
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {isFetching && !isFetchingNextPage
                ? 'Searching...'
                : `${jobs.length}${hasNextPage ? '+' : ''} jobs found`}
            </Text>
          </View>
        )}

        {/* ── Job List ── */}
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.loader} />
        ) : (
          <FlatList
            data={visibleJobs}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <View style={styles.jobItem}>
                <JobCard job={item} />
                {index === 2 && <AdBanner size="small" />}
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No jobs found</Text>
                <Text style={styles.emptyText}>
                  Try different keywords or adjust your filters
                </Text>
                <TouchableOpacity
                  style={styles.emptyResetBtn}
                  onPress={() => {
                    setQuery('');
                    setFilters({ country: '', category: '', jobType: '' });
                  }}
                >
                  <Text style={styles.emptyResetText}>Reset search</Text>
                </TouchableOpacity>
              </View>
            }
            ListFooterComponent={
              <>
                {showAdGate && (
                  <View style={styles.adGate}>
                    <Ionicons name="videocam-outline" size={34} color={COLORS.accent} />
                    <Text style={styles.adGateTitle}>Watch a short ad to see more results</Text>
                    <View style={styles.adGateBtns}>
                      <TouchableOpacity style={styles.watchBtn} onPress={handleWatchAd}>
                        <Ionicons name="play-circle" size={16} color={COLORS.white} />
                        <Text style={styles.watchBtnText}>Watch Ad</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {isFetchingNextPage && (
                  <ActivityIndicator color={COLORS.primary} style={{ padding: 16 }} />
                )}
                {(state.isLoggedIn || adUnlocked) && hasNextPage && !isFetchingNextPage && (
                  <TouchableOpacity
                    style={styles.loadMoreBtn}
                    onPress={() => fetchNextPage()}
                  >
                    <Text style={styles.loadMoreText}>Load more</Text>
                    <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
                <View style={{ height: 24 }} />
              </>
            }
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>

      <FilterModal
        visible={filterModalOpen}
        filters={filters}
        onApply={(f) => setFilters(f)}
        onClose={() => setFilterModalOpen(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    padding: 0,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E0F5',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  filterCountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  activeFilters: {
    flexGrow: 0,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activeFiltersContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  activeChipText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  clearAllChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearAllText: {
    fontSize: 12,
    color: COLORS.textGray,
  },
  resultsBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  loader: {
    marginTop: 60,
  },
  listContent: {
    flexGrow: 1,
  },
  jobItem: {
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyResetBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  emptyResetText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  adGate: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  adGateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  adGateBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  watchBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    marginBottom: 8,
  },
  loadMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  // Filter modal styles
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalReset: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
  },
  filterGroupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 10,
  },
  filterChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  applyBtn: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
