import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const COLORS = {
  gold: '#FFB400',
  accent: '#FF6B35',
  textDark: '#1a1a2e',
  textGray: '#666',
};

interface FraudNoticeProps {
  text?: string;
  email?: string;
  dismissible?: boolean;
  variant?: 'warning' | 'danger';
}

export default function FraudNotice({
  text,
  email = 'ask@uaecareer.ae',
  dismissible = true,
  variant = 'warning',
}: FraudNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  function handleDismiss() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDismissed(true);
  }

  if (dismissed) return null;

  const isWarning = variant === 'warning';

  const defaultText =
    `⚠️  UAE Careers is a job listing portal — we are NOT a recruiter or placement agency.\n\n` +
    `Never pay for job applications, interviews, tests, or recruitment processes. ` +
    `Legitimate employers will never ask for money.\n\n` +
    `Report fraud: ${email}`;

  return (
    <View style={[styles.container, isWarning ? styles.containerWarning : styles.containerDanger]}>
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: isWarning ? COLORS.gold : COLORS.accent }]} />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Ionicons
            name={isWarning ? 'warning' : 'alert-circle'}
            size={18}
            color={isWarning ? COLORS.gold : COLORS.accent}
          />
          <Text style={[styles.title, { color: isWarning ? '#92600A' : '#9A1A0A' }]}>
            {isWarning ? 'Fraud Warning' : 'Important Notice'}
          </Text>
          {dismissible && (
            <TouchableOpacity onPress={handleDismiss} style={styles.dismissBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={16} color={COLORS.textGray} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.body}>{text ?? defaultText}</Text>
      </View>
    </View>
  );
}

// Named export alias
export { FraudNotice };

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  containerWarning: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  containerDanger: {
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  accentBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  dismissBtn: {
    padding: 2,
  },
  body: {
    fontSize: 12,
    color: COLORS.textGray,
    lineHeight: 18,
  },
});
