import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * AdBanner — Placeholder component.
 *
 * To integrate real AdMob ads:
 * 1. Install: npx expo install react-native-google-mobile-ads
 * 2. Add google-mobile-ads plugin to app.json plugins with your app IDs
 * 3. Replace this component body with:
 *
 * import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
 * const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
 * return (
 *   <BannerAd unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
 * );
 */

interface AdBannerProps {
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export default function AdBanner({ size = 'small', onPress }: AdBannerProps) {
  const height = size === 'large' ? 250 : size === 'medium' ? 120 : 60;

  return (
    <TouchableOpacity
      style={[styles.container, { height }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.85 : 1}
      disabled={!onPress}
    >
      <Ionicons name="megaphone-outline" size={20} color="#B0B8C8" />
      <Text style={styles.label}>Advertisement</Text>
      <Text style={styles.sub}>Your ad could appear here</Text>
    </TouchableOpacity>
  );
}

// Named export alias
export { AdBanner };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF2F8',
    borderRadius: 8,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE3EE',
    borderStyle: 'dashed',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  sub: {
    fontSize: 11,
    color: '#C4CAD6',
  },
});
