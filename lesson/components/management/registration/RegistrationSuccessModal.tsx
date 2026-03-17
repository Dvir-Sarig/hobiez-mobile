import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Lesson } from '../../../types/Lesson';
import { formatLessonTimeReadable, formatPrice } from '../../../../shared/services/formatService';

interface Props {
  isOpen: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onMarkAsPaid: () => void;
}

const RegistrationSuccessModal: React.FC<Props> = ({ isOpen, lesson, onClose, onMarkAsPaid }) => {
  if (!lesson) return null;

  const hoursUntil = Math.round((new Date(lesson.time).getTime() - Date.now()) / (1000 * 60 * 60));
  const isUrgent = hoursUntil <= 24 && hoursUntil > 0;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.shell}>
          {/* Header */}
          <LinearGradient colors={['#0d47a1', '#1976d2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.successIconWrap}>
              <MaterialIcons name="check-circle" size={44} color="#ffffff" />
            </View>
            <Text style={styles.headerTitle}>נרשמת בהצלחה!</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{lesson.title}</Text>
            <Text style={styles.headerTime}>{formatLessonTimeReadable(lesson.time)}</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Lesson summary chip row */}
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <MaterialIcons name="timer" size={14} color="#1976d2" />
                <Text style={styles.chipText}>{lesson.duration} דק׳</Text>
              </View>
              {lesson.price > 0 && (
                <View style={styles.chip}>
                  <MaterialIcons name="payments" size={14} color="#1976d2" />
                  <Text style={styles.chipText}>{formatPrice(lesson.price)}</Text>
                </View>
              )}
            </View>

            {/* Payment info box */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeaderRow}>
                <View style={styles.infoIconWrap}>
                  <MaterialIcons name="info" size={18} color="#1976d2" />
                </View>
                <Text style={styles.infoTitle}>מה קורה הלאה?</Text>
              </View>
              <View style={styles.stepList}>
                <View style={styles.step}>
                  <View style={styles.stepDot}><Text style={styles.stepDotText}>1</Text></View>
                  <Text style={styles.stepText}>הצהר את אמצעי התשלום שלך כדי שהמאמן ידע איך תשלם.</Text>
                </View>
                <View style={styles.stepDivider} />
                <View style={styles.step}>
                  <View style={styles.stepDot}><Text style={styles.stepDotText}>2</Text></View>
                  <Text style={styles.stepText}>המאמן יאשר את התשלום שלך כדי לאבטח את המקום שלך.</Text>
                </View>
                <View style={styles.stepDivider} />
                <View style={styles.step}>
                  <View style={[styles.stepDot, { backgroundColor: '#b45309' }]}><MaterialIcons name="warning" size={11} color="#fff" /></View>
                  <Text style={styles.stepText}>
                    המקום שלך <Text style={styles.boldText}>לא מובטח</Text> עד שהתשלום מאושר ע״י המאמן.{' '}
                    ודא שאתה מצהיר תשלום לפחות <Text style={styles.boldText}>6 שעות לפני</Text> תחילת השיעור.
                  </Text>
                </View>
              </View>
            </View>

            {/* Urgency notice */}
            {isUrgent && (
              <View style={styles.urgentBanner}>
                <MaterialIcons name="hourglass-top" size={16} color="#b45309" />
                <Text style={styles.urgentText}>
                  השיעור בעוד {hoursUntil} שעות — הצהר תשלום עכשיו כדי לאבטח את המקום שלך!
                </Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.laterBtn} onPress={onClose}>
              <Text style={styles.laterBtnText}>מאוחר יותר</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payBtn} onPress={() => { onClose(); onMarkAsPaid(); }}>
              <MaterialIcons name="payment" size={18} color="#ffffff" style={{ marginRight: 6 }} />
              <Text style={styles.payBtnText}>סמן כשולם</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', padding: 20 },
  shell: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    overflow: 'hidden',
    maxHeight: '90%',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 12 },
    }),
  },
  header: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  successIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: 0.4, marginBottom: 6, textAlign: 'left', writingDirection: 'rtl' },
  headerSubtitle: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginBottom: 4, textAlign: 'left', writingDirection: 'rtl' },
  headerTime: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.75)', textAlign: 'left', writingDirection: 'rtl' },
  content: { padding: 20 },
  chipRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f1f6fb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(25,118,210,0.15)',
  },
  chipText: { fontSize: 13, fontWeight: '700', color: '#1976d2', writingDirection: 'rtl' },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(25,118,210,0.10)',
  },
  infoHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(25,118,210,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#0d47a1', letterSpacing: 0.4, textAlign: 'left', writingDirection: 'rtl' },
  stepList: { gap: 0 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  stepDotText: { fontSize: 11, fontWeight: '800', color: '#ffffff' },
  stepText: { flex: 1, fontSize: 13, fontWeight: '500', color: '#374151', lineHeight: 19, textAlign: 'left', writingDirection: 'rtl' },
  boldText: { fontWeight: '800', color: '#0d47a1' },
  stepDivider: { height: 1, backgroundColor: 'rgba(25,118,210,0.07)', marginStart: 34, marginVertical: 4 },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(180,83,9,0.25)',
  },
  urgentText: { flex: 1, fontSize: 12.5, fontWeight: '700', color: '#b45309', lineHeight: 17, textAlign: 'left', writingDirection: 'rtl' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,71,161,0.08)',
    backgroundColor: '#ffffff',
  },
  laterBtn: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(25,118,210,0.25)',
  },
  laterBtnText: { color: '#0d47a1', fontSize: 14, fontWeight: '700', letterSpacing: 0.4 },
  payBtn: {
    flex: 1.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976d2',
    borderRadius: 18,
    paddingVertical: 14,
    ...Platform.select({
      ios: { shadowColor: '#1976d2', shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  payBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },
});

export default RegistrationSuccessModal;
