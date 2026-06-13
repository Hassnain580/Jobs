import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import JobCard from '../../src/components/JobCard';
import { useSavedJobs } from '../../src/hooks/useJobs';
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

// ─── Auth Guard (not logged in) ───────────────────────────────────────────────

function LoginPrompt() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.centeredSafe}>
      <View style={styles.centered}>
        <View style={styles.iconCircle}>
          <Ionicons name="bookmark" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.bigTitle}>Save Jobs You Like</Text>
        <Text style={styles.sub}>
          Login to save jobs and access them anytime, even offline
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.88}
        >
          <Text style={styles.primaryBtnText}>Login to your account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.88}
        >
          <Text style={styles.secondaryBtnText}>Create account — it's free</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/search')} style={styles.browseLink}>
          <Text style={styles.browseLinkText}>Browse jobs without logging in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No saved jobs yet</Text>
      <Text style={styles.emptyText}>
        Tap the bookmark icon on any job to save it here for later
      </Text>
      <TouchableOpacity
        style={styles.browseSavedBtn}
        onPress={() => router.push('/(tabs)/search')}
      >
        <Ionicons name="search" size={16} color={COLORS.white} />
        <Text style={styles.browseSavedBtnText}>Browse Jobs</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Saved Screen ─────────────────────────────────────────────────────────────

export default function SavedScreen() {
  const { state } = useAuth();
  const { data: savedJobs, isLoading, refetch, isRefetching } = useSavedJobs();

  if (!state.isLoggedIn) {
    return <LoginPrompt />;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Saved Jobs</Text>
        </View>
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Jobs</Text>
        {(savedJobs?.length ?? 0) > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{savedJobs!.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={savedJobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.jobItem}>
            <JobCard job={item} />
          </View>
        )}
        ListEmptyComponent={<EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
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
  centeredSafe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  browseLink: {
    paddingVertical: 8,
  },
  browseLinkText: {
    fontSize: 13,
    color: COLORS.textGray,
    textDecorationLine: 'underline',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    minWidth: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  loader: {
    marginTop: 60,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  jobItem: {
    paddingHorizontal: 16,
    paddingTop: 4,
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
  browseSavedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  browseSavedBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
