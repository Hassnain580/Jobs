import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import JobCard from '../../src/components/JobCard';
import FraudNotice from '../../src/components/FraudNotice';
import AdBanner from '../../src/components/AdBanner';
import { useFeaturedJobs, useJobs, useWalkInJobs } from '../../src/hooks/useJobs';
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
};

const CATEGORIES = [
  { name: 'Accounting', emoji: '💼', slug: 'accounting-finance' },
  { name: 'IT & Tech', emoji: '💻', slug: 'information-technology' },
  { name: 'Engineering', emoji: '⚙️', slug: 'engineering' },
  { name: 'HR & Admin', emoji: '👥', slug: 'human-resources' },
  { name: 'Medical', emoji: '🏥', slug: 'healthcare-medical' },
  { name: 'Hospitality', emoji: '🏨', slug: 'hospitality-tourism' },
  { name: 'Oil & Gas', emoji: '⛽', slug: 'oil-gas' },
  { name: 'Legal', emoji: '⚖️', slug: 'legal' },
  { name: 'Sales', emoji: '📊', slug: 'sales-marketing' },
  { name: 'Construction', emoji: '🏗️', slug: 'construction' },
];

// ─── Notification Modal ───────────────────────────────────────────────────────

interface NotificationDotProps {
  count?: number;
  onPress: () => void;
}

function NotificationBell({ count = 0, onPress }: NotificationDotProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.bellBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
      {count > 0 && (
        <View style={styles.notifDot}>
          <Text style={styles.notifDotText}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({ emoji, name, slug }: { emoji: string; name: string; slug: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.catCard}
      onPress={() => router.push({ pathname: '/(tabs)/search', params: { category: slug } })}
      activeOpacity={0.8}
    >
      <Text style={styles.catEmoji}>{emoji}</Text>
      <Text style={styles.catName}>{name}</Text>
    </TouchableOpacity>
  );
}

// ─── Home Screen ─────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { data: featured, isLoading: featuredLoading } = useFeaturedJobs();
  const { data: walkin } = useWalkInJobs();
  const {
    data: latest,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
  } = useJobs();

  const latestJobs = latest?.pages?.flatMap((p) => p.data?.jobs ?? []) ?? [];
  const [adUnlocked, setAdUnlocked] = useState(false);
  const GUEST_JOB_LIMIT = 5;

  function handleWatchAd() {
    // Rewarded Ad integration point — swap with actual AdMob rewarded ad
    Alert.alert('Watch Ad', 'Ad would play here. Unlocking more results.', [
      { text: 'OK', onPress: () => setAdUnlocked(true) },
    ]);
  }

  const visibleLatest = !state.isLoggedIn && !adUnlocked
    ? latestJobs.slice(0, GUEST_JOB_LIMIT)
    : latestJobs;

  const showAdGate = !state.isLoggedIn && !adUnlocked && latestJobs.length >= GUEST_JOB_LIMIT;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerGreeting}>
              {state.isLoggedIn ? `Hello, ${state.user?.firstName ?? 'there'} 👋` : 'Welcome to'}
            </Text>
            <Text style={styles.headerLogo}>UAE Careers 🇦🇪</Text>
          </View>
          <NotificationBell count={3} onPress={() => Alert.alert('Notifications', 'Notification centre coming soon!')} />
        </View>

        {/* ── Hero search bar ── */}
        <View style={styles.heroGradient}>
          <Text style={styles.heroTitle}>Find Your Dream Job in the Gulf</Text>
          <Text style={styles.heroSub}>50–100 fresh openings every day</Text>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/search')}
            activeOpacity={0.9}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Job title, company, keyword...</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Fraud notice */}
          <FraudNotice />

          {/* Featured Jobs */}
          {(featured ?? []).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="star" size={16} color={COLORS.gold} /> Featured Jobs
                </Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/search', params: { featured: '1' } })}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={featured}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <JobCard job={item} compact />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Walk-in Interviews */}
          {(walkin ?? []).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="walk" size={16} color={COLORS.accent} /> Walk-in Interviews
                </Text>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/search', params: { jobType: 'walk_in' } })}>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={walkin}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <JobCard job={item} compact />}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {/* Ad Banner */}
          <AdBanner size="small" />

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <FlatList
              horizontal
              data={CATEGORIES}
              keyExtractor={(item) => item.slug}
              renderItem={({ item }) => (
                <CategoryCard emoji={item.emoji} name={item.name} slug={item.slug} />
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </View>

          {/* Latest Jobs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Jobs</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                <Text style={styles.seeAll}>Browse all</Text>
              </TouchableOpacity>
            </View>

            {visibleLatest.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {/* Ad gate for guests */}
            {showAdGate && (
              <View style={styles.adGate}>
                <Ionicons name="videocam-outline" size={36} color={COLORS.accent} />
                <Text style={styles.adGateTitle}>Watch a short ad to see more jobs</Text>
                <Text style={styles.adGateSub}>Or login to browse unlimited jobs for free</Text>
                <View style={styles.adGateBtns}>
                  <TouchableOpacity style={styles.watchBtn} onPress={handleWatchAd}>
                    <Ionicons name="play-circle" size={18} color={COLORS.white} />
                    <Text style={styles.watchBtnText}>Watch Ad</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
                    <Text style={styles.loginBtnText}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Load more button */}
            {(state.isLoggedIn || adUnlocked) && hasNextPage && (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={() => fetchNextPage()}>
                <Text style={styles.loadMoreText}>Load more jobs</Text>
                <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Bottom ad */}
          <AdBanner size="medium" />
          <View style={styles.bottomPad} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: COLORS.primary,
  },
  headerGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  bellBtn: {
    position: 'relative',
    padding: 4,
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  notifDotText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  heroGradient: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 6,
    lineHeight: 30,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 8,
  },
  catCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 82,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  catEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  catName: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  adGate: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  adGateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  adGateSub: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 18,
  },
  adGateBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
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
  loginBtn: {
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  loginBtnText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  loadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  loadMoreText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  bottomPad: {
    height: 24,
  },
});
