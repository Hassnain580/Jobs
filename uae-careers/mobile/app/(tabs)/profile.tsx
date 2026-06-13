import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  danger: '#EF4444',
  success: '#059669',
};

// ─── Menu Item ────────────────────────────────────────────────────────────────

interface MenuItemProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string | number;
  rightElement?: React.ReactNode;
}

function MenuItem({ iconName, label, subtitle, onPress, danger, badge, rightElement }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
        <Ionicons
          name={iconName}
          size={20}
          color={danger ? COLORS.danger : COLORS.primary}
        />
      </View>
      <View style={styles.menuLabelWrap}>
        <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {badge !== undefined && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      {rightElement ?? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={danger ? COLORS.danger : '#C9D0D9'}
        />
      )}
    </TouchableOpacity>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function MenuSection({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <View style={styles.menuSection}>
      {title && <Text style={styles.menuSectionTitle}>{title}</Text>}
      <View style={styles.menuCard}>{children}</View>
    </View>
  );
}

// ─── Guest screen ─────────────────────────────────────────────────────────────

function GuestProfile() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.guestHero}>
        <View style={styles.guestAvatarCircle}>
          <Ionicons name="person" size={44} color={COLORS.white} />
        </View>
        <Text style={styles.guestTitle}>Your UAE Careers Account</Text>
        <Text style={styles.guestSub}>
          Login to manage your profile, track applications and set job alerts
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.push('/auth/login')}
          activeOpacity={0.88}
        >
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerBtn}
          onPress={() => router.push('/auth/register')}
          activeOpacity={0.88}
        >
          <Text style={styles.registerBtnText}>Create Free Account</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.guestMenu}>
        <MenuSection title="Discover">
          <MenuItem
            iconName="search"
            label="Browse Jobs"
            onPress={() => router.push('/(tabs)/search')}
          />
          <MenuItem
            iconName="bookmark"
            label="Saved Jobs"
            onPress={() => router.push('/auth/login')}
          />
        </MenuSection>
        <MenuSection title="For Employers">
          <MenuItem
            iconName="business"
            label="Post a Job"
            subtitle="Reach thousands of candidates"
            onPress={() => router.push('/auth/login')}
          />
        </MenuSection>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Profile screen (logged in) ───────────────────────────────────────────────

function stringToColor(str: string): string {
  const palette = ['#1A3C6E', '#FF6B35', '#7C3AED', '#059669', '#0891B2'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

function computeProfileCompletion(user: any, isEmployer: boolean): number {
  const fields = isEmployer
    ? [user?.firstName, user?.email, user?.employerProfile?.companyName, user?.employerProfile?.industry, user?.employerProfile?.country]
    : [user?.firstName, user?.email, user?.phone, user?.jobSeekerProfile?.headline, user?.jobSeekerProfile?.cvUrl];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default function ProfileScreen() {
  const { state, logout } = useAuth();
  const router = useRouter();

  if (!state.isLoggedIn) {
    return <GuestProfile />;
  }

  const { user } = state;
  const isEmployer = user?.role === 'employer';
  const fullName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'User';
  const initials = fullName.slice(0, 2).toUpperCase() || 'U';
  const avatarBg = stringToColor(fullName);
  const completion = computeProfileCompletion(user, isEmployer);

  function handleLogout() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* ── Hero / Avatar Section ── */}
        <View style={styles.heroBanner}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarCircle, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}
          <Text style={styles.heroName}>{fullName}</Text>
          <View style={[styles.roleBadge, isEmployer && styles.roleBadgeEmployer]}>
            <Ionicons
              name={isEmployer ? 'business' : 'person'}
              size={13}
              color={isEmployer ? COLORS.accent : COLORS.primary}
            />
            <Text style={[styles.roleText, isEmployer && { color: COLORS.accent }]}>
              {isEmployer ? 'Employer' : 'Job Seeker'}
            </Text>
          </View>
          <Text style={styles.heroEmail}>{user?.email ?? user?.phone ?? ''}</Text>
        </View>

        {/* ── Profile Completion ── (job seekers only) */}
        {!isEmployer && (
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionTitle}>Profile Completion</Text>
              <Text style={[styles.completionPct, { color: completion >= 80 ? COLORS.success : COLORS.accent }]}>
                {completion}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completion}%` as any,
                    backgroundColor: completion >= 80 ? COLORS.success : COLORS.accent,
                  },
                ]}
              />
            </View>
            {completion < 100 && (
              <Text style={styles.completionHint}>Complete your profile to appear in recruiter searches</Text>
            )}
          </View>
        )}

        {/* ── Employer / Job Seeker Menu ── */}
        {isEmployer ? (
          <MenuSection title="Employer Tools">
            <MenuItem
              iconName="add-circle"
              label="Post a Job"
              subtitle="Create a new job listing"
              onPress={() => router.push('/employer/post-job')}
            />
            <MenuItem
              iconName="briefcase"
              label="My Job Posts"
              subtitle="Manage your active listings"
              onPress={() => Alert.alert('Coming Soon', 'My Jobs page is coming soon')}
            />
            <MenuItem
              iconName="people"
              label="Applications Received"
              badge={3}
              onPress={() => Alert.alert('Coming Soon', 'Applications page is coming soon')}
            />
          </MenuSection>
        ) : (
          <MenuSection title="Job Seeker">
            <MenuItem
              iconName="document-text"
              label="My Applications"
              subtitle="Track your job applications"
              onPress={() => Alert.alert('Coming Soon', 'Applications page is coming soon')}
            />
            <MenuItem
              iconName="notifications"
              label="Job Alerts"
              subtitle="Manage your saved searches"
              onPress={() => Alert.alert('Coming Soon', 'Job alerts coming soon')}
            />
            <MenuItem
              iconName="attach"
              label="Upload CV / Resume"
              subtitle={user?.jobSeekerProfile?.cvUrl ? 'CV uploaded' : 'No CV uploaded yet'}
              onPress={() => Alert.alert('Coming Soon', 'CV upload coming soon')}
              rightElement={
                user?.jobSeekerProfile?.cvUrl ? (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                ) : undefined
              }
            />
          </MenuSection>
        )}

        {/* ── Account ── */}
        <MenuSection title="Account">
          <MenuItem
            iconName="create"
            label="Edit Profile"
            onPress={() => Alert.alert('Coming Soon', 'Profile editor coming soon')}
          />
          <MenuItem
            iconName="lock-closed"
            label="Change Password"
            onPress={() => Alert.alert('Coming Soon', 'Password change coming soon')}
          />
          <MenuItem
            iconName="settings"
            label="Settings"
            onPress={() => Alert.alert('Coming Soon', 'Settings coming soon')}
          />
        </MenuSection>

        {/* ── About ── */}
        <MenuSection>
          <MenuItem
            iconName="information-circle"
            label="About UAE Careers"
            onPress={() => Alert.alert('UAE Careers', 'Version 1.0.0\n\nYour trusted Gulf job portal.')}
          />
          <MenuItem
            iconName="shield-checkmark"
            label="Privacy Policy"
            onPress={() => Alert.alert('Privacy', 'Privacy policy page coming soon')}
          />
          <MenuItem
            iconName="help-circle"
            label="Help & Support"
            onPress={() => Alert.alert('Support', 'Contact us at ask@uaecareer.ae')}
          />
        </MenuSection>

        {/* ── Logout ── */}
        <MenuSection>
          <MenuItem
            iconName="log-out"
            label="Log Out"
            onPress={handleLogout}
            danger
          />
        </MenuSection>

        <View style={styles.versionRow}>
          <Text style={styles.version}>UAE Careers v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  // Guest
  guestHero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 10,
  },
  guestAvatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
  },
  guestSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 18,
  },
  loginBtn: {
    backgroundColor: COLORS.accent,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  registerBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  registerBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 15,
  },
  guestMenu: {
    flex: 1,
    paddingTop: 8,
  },
  // Logged in hero
  heroBanner: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 20,
    gap: 6,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 4,
  },
  avatarInitials: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
  },
  heroName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EEF3FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleBadgeEmployer: {
    backgroundColor: '#FFF0EB',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  // Profile completion
  completionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  completionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  completionPct: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  completionHint: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 8,
  },
  // Menu
  menuSection: {
    marginHorizontal: 16,
    marginTop: 14,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 6,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EEF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: {
    backgroundColor: '#FEF2F2',
  },
  menuLabelWrap: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  menuSub: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 1,
  },
  menuBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  versionRow: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    fontSize: 12,
    color: '#C4CAD6',
  },
});
