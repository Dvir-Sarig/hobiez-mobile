import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PaymentMethod } from '../../types/Registration';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDeclare: (method: PaymentMethod, note?: string) => Promise<void>;
}

type MethodEntry = {
  key: PaymentMethod;
  label: string;
  subtitle: string;
  iconType: 'image-bit' | 'image-paybox' | 'material';
  icon?: string;
  iconBg: string;
  iconColor: string;
};

const PAYMENT_METHODS: MethodEntry[] = [
  {
    key: 'BIT',
    label: 'Bit',
    subtitle: 'Pay via Bit app',
    iconType: 'image-bit',
    iconBg: '#00353b',
    iconColor: '#39edf6',
  },
  {
    key: 'PAYBOX',
    label: 'PayBox',
    subtitle: 'Pay via PayBox app',
    iconType: 'image-paybox',
    iconBg: '#0ea5e9',
    iconColor: '#ffffff',
  },
  {
    key: 'CASH',
    label: 'Cash',
    subtitle: 'Physical cash payment',
    iconType: 'material',
    icon: 'account-balance-wallet',
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
  },
  {
    key: 'OTHER',
    label: 'Other',
    subtitle: 'Bank transfer or other',
    iconType: 'material',
    icon: 'swap-horiz',
    iconBg: '#f1f5f9',
    iconColor: '#64748b',
  },
];

const MethodIcon: React.FC<{ entry: MethodEntry; size?: number }> = ({ entry, size = 28 }) => {
  if (entry.iconType === 'image-bit') {
    return (
      <Image
        source={require('../../../assets/bit-logo.png')}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}
        resizeMode="contain"
      />
    );
  }
  if (entry.iconType === 'image-paybox') {
    return (
      <Image
        source={require('../../../assets/paybox-logo.png')}
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.5) }}
        resizeMode="contain"
      />
    );
  }
  return <MaterialIcons name={entry.icon as any} size={size} color={entry.iconColor} />;
};

const DeclarePaymentModal: React.FC<Props> = ({ isOpen, onClose, onDeclare }) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeclare = async () => {
    if (!selectedMethod) return;
    try {
      setIsSubmitting(true);
      await onDeclare(selectedMethod, note.trim() || undefined);
      setSelectedMethod(null);
      setNote('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setNote('');
    onClose();
  };

  return (
    <Modal visible={isOpen} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.shell}>
          <LinearGradient
            colors={['#0d47a1', '#1976d2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerBar}
          >
            <View style={styles.headerLeft}>
              <View style={styles.headerIconBadge}>
                <MaterialIcons name="payment" size={22} color="#ffffff" />
              </View>
              <View style={styles.headerTextCol}>
                <Text style={styles.headerTitle}>Declare Payment</Text>
                <Text style={styles.headerSubtitle}>Select how you paid</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
              <MaterialIcons name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.content}>
            <Text style={styles.sectionLabel}>Payment Method</Text>

            {/* Modern list rows */}
            <View style={styles.methodList}>
              {PAYMENT_METHODS.map((m, idx) => {
                const isSelected = selectedMethod === m.key;
                const isLast = idx === PAYMENT_METHODS.length - 1;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.methodRow,
                      isSelected && styles.methodRowSelected,
                      !isLast && styles.methodRowBorder,
                    ]}
                    onPress={() => setSelectedMethod(m.key)}
                    activeOpacity={0.65}
                  >
                    {/* Icon bubble */}
                    <View style={[
                      styles.iconBubble,
                      m.iconType === 'material' && { backgroundColor: m.iconBg },
                    ]}>
                      <MethodIcon entry={m} size={28} />
                    </View>

                    {/* Labels */}
                    <View style={styles.methodTextCol}>
                      <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                        {m.label}
                      </Text>
                      <Text style={styles.methodSubtitle}>{m.subtitle}</Text>
                    </View>

                    {/* Radio indicator */}
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Note (optional)</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="e.g. Paid via Bit"
              placeholderTextColor="#90a4ae"
              value={note}
              onChangeText={setNote}
              maxLength={200}
            />
          </View>

          <View style={styles.footerBar}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} disabled={isSubmitting}>
              <Text style={[styles.cancelBtnText, isSubmitting && { opacity: 0.5 }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryBtn, (!selectedMethod || isSubmitting) && styles.primaryBtnDisabled]}
              onPress={handleDeclare}
              disabled={!selectedMethod || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryBtnText}>Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  shell: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 10 },
    }),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  headerIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTextCol: { flex: 1 },
  headerTitle: { fontSize: 19, fontWeight: '800', color: '#ffffff', letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    marginBottom: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  methodList: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(13,71,161,0.07)',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    gap: 14,
  },
  methodRowSelected: {
    backgroundColor: 'rgba(25,118,210,0.05)',
  },
  methodRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13,71,161,0.07)',
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  methodTextCol: { flex: 1 },
  methodLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.2,
  },
  methodLabelSelected: { color: '#1976d2' },
  methodSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#1976d2',
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#1976d2',
  },
  noteInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,71,161,0.08)',
    backgroundColor: '#ffffff',
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(25,118,210,0.25)',
  },
  cancelBtnText: { color: '#0d47a1', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: '#1976d2',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    ...Platform.select({
      ios: { shadowColor: '#1976d2', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  primaryBtnDisabled: { backgroundColor: '#94a3b8' },
  primaryBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});

export default DeclarePaymentModal;
