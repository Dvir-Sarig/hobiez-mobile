import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PaymentStatus, PaymentMethod } from '../../types/Registration';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; bg: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  NOT_SET: { label: 'לא שולם', color: '#78909c', bg: 'rgba(120,144,156,0.12)', icon: 'payment' },
  PENDING: { label: 'בהמתנה', color: '#f57c00', bg: 'rgba(245,124,0,0.12)', icon: 'hourglass-top' },
  CONFIRMED: { label: 'מאושר', color: '#43a047', bg: 'rgba(67,160,71,0.12)', icon: 'check-circle' },
  REJECTED: { label: 'נדחה', color: '#e53935', bg: 'rgba(229,57,53,0.12)', icon: 'cancel' },
};

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: string; iconFamily: 'material' | 'community' | 'bit-image' | 'paybox-image'; color: string }> = {
  BIT: { label: 'ביט', icon: 'bit-logo', iconFamily: 'bit-image', color: '#0b2f35' },
  PAYBOX: { label: 'פייבוקס', icon: 'paybox-logo', iconFamily: 'paybox-image', color: '#0891b2' },
  CASH: { label: 'מזומן', icon: 'payments', iconFamily: 'material', color: '#16a34a' },
  OTHER: { label: 'אחר', icon: 'more-horiz', iconFamily: 'material', color: '#64748b' },
};

const BitLogoMark: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Image
    source={require('../../../assets/bit-logo.png')}
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.2) }}
    resizeMode="contain"
  />
);

const PayBoxLogoMark: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Image
    source={require('../../../assets/paybox-logo.png')}
    style={{ width: size, height: size, borderRadius: Math.round(size * 0.5) }}
    resizeMode="contain"
  />
);

export const PaymentMethodIcon: React.FC<{ method: PaymentMethod; size?: number; color?: string }> = ({ method, size = 14, color }) => {
  const cfg = METHOD_CONFIG[method];
  if (cfg.iconFamily === 'bit-image') {
    return <BitLogoMark size={size} />;
  }
  if (cfg.iconFamily === 'paybox-image') {
    return <PayBoxLogoMark size={size} />;
  }
  const c = color || cfg.color;
  if (cfg.iconFamily === 'community') {
    return <MaterialCommunityIcons name={cfg.icon as any} size={size} color={c} />;
  }
  return <MaterialIcons name={cfg.icon as any} size={size} color={c} />;
};

export const PaymentMethodChip: React.FC<{ method: PaymentMethod }> = ({ method }) => {
  const cfg = METHOD_CONFIG[method];
  return (
    <View style={[styles.methodChip, { backgroundColor: cfg.color + '14', borderColor: cfg.color + '30' }]}>
      <PaymentMethodIcon method={method} size={18} color={cfg.color} />
      <Text style={[styles.methodChipText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

interface Props {
  status: PaymentStatus;
  compact?: boolean;
  method?: PaymentMethod;
}

const PaymentStatusBadge: React.FC<Props> = ({ status, compact = false, method }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.NOT_SET;
  const showMethodInline = compact && (status === 'PENDING' || status === 'CONFIRMED') && !!method;

  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={[styles.compactBadge, { backgroundColor: config.bg, borderColor: config.color + '30' }]}>
          <MaterialIcons name={config.icon} size={12} color={config.color} />
          <Text style={[styles.compactText, { color: config.color }]}>{config.label}</Text>
          {showMethodInline && method ? (
            <View style={styles.inlineMethodWrap}>
              <PaymentMethodIcon method={method} size={18} color={config.color} />
            </View>
          ) : null}
        </View>
        {!showMethodInline && method && <PaymentMethodChip method={method} />}
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color + '30' }]}>
        <MaterialIcons name={config.icon} size={16} color={config.color} />
        <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
      </View>
      {method && <PaymentMethodChip method={method} />}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    writingDirection: 'rtl',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  inlineMethodWrap: {
    marginStart: 2,
    borderStartWidth: 1,
    borderStartColor: 'rgba(15,23,42,0.18)',
    paddingStart: 4,
  },
  compactText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    writingDirection: 'rtl',
  },
  methodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  methodChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    writingDirection: 'rtl',
  },
});

export default PaymentStatusBadge;
