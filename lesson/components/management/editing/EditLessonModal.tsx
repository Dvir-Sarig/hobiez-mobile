import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Location } from '../../../../profile/types/profile';
import LocationField from '../../../../integrations/google_location/LocationField';
import dayjs from 'dayjs';
import { LinearGradient } from 'expo-linear-gradient';

interface EditLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  lessonData: {
    description: string;
    time: dayjs.Dayjs;
    capacityLimit: string; // kept as string for existing usage
    duration: number;
    location: { city: string; country: string };
  };
  setLessonData: React.Dispatch<React.SetStateAction<{
    description: string;
    time: dayjs.Dayjs;
    capacityLimit: string;
    duration: number;
    location: { city: string; country: string };
  }>>;
  isSubmitting?: boolean;
}

const EditLessonModal: React.FC<EditLessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  lessonData,
  setLessonData,
  isSubmitting = false
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const currentDate = lessonData.time ? lessonData.time.toDate() : new Date();
  const [date, setDate] = useState<Date>(currentDate);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      // On Android, after selecting date, show time picker
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        setDate(newDate);
        // Show time picker after a short delay
        setTimeout(() => setShowTimePicker(true), 100);
      }
    } else {
      // iOS handles both date and time together
      setShowDatePicker(false);
      if (selectedDate) {
        setDate(selectedDate);
        setLessonData({ ...lessonData, time: dayjs(selectedDate) });
      }
    }
  };

  const onChangeTime = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newTime = new Date(selectedTime);
      // Combine the selected date with the selected time
      const currentDate = date;
      const combinedDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        newTime.getHours(),
        newTime.getMinutes()
      );
      setDate(combinedDate);
      setLessonData({ ...lessonData, time: dayjs(combinedDate) });
    }
  };

  const handleNumberChange = (field: 'duration' | 'capacityLimit', value: string) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (field === 'capacityLimit') {
      setLessonData({ ...lessonData, capacityLimit: cleaned });
    } else {
      const parsed = cleaned === '' ? 0 : parseInt(cleaned, 10);
      setLessonData({ ...lessonData, duration: isNaN(parsed) ? 0 : parsed });
    }
  };

  // Clean up date pickers when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDatePicker(false);
      setShowTimePicker(false);
    } else {
      setDate(lessonData.time ? lessonData.time.toDate() : new Date());
    }
  }, [isOpen]);

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlayPolished}>
        <View style={styles.glassCard}>
          {/* Gradient Header */}
          <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerGradient}>
            <Text style={styles.modalTitleNew}>Edit Lesson</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeGradientBtn} accessibilityLabel="Close edit lesson modal">
              <Icon name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          <KeyboardAvoidingView behavior={Platform.OS==='ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS==='ios'? 60 : 0} style={{flex:1}}>
            <ScrollView style={{flex:1}} contentContainerStyle={styles.scrollContentNew} showsVerticalScrollIndicator={false}>
              {/* Description Section */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Description</Text>
                <View style={styles.textAreaWrapper}> 
                  <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Describe your lesson..."
                    placeholderTextColor="#5d7489"
                    value={lessonData.description}
                    onChangeText={(text) => setLessonData({ ...lessonData, description: text })}
                  />
                </View>
              </View>
              {/* Date & Time Section */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Date & Time</Text>
                <TouchableOpacity style={styles.inlinePickerBtn} onPress={()=> setShowDatePicker(true)} activeOpacity={0.85}>
                  <Icon name="calendar-today" size={18} color="#1976d2" style={{marginRight:10}} />
                  <Text style={styles.inlinePickerText}>{date.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && Platform.OS==='ios' && (
                  <DateTimePicker value={lessonData.time.toDate()} mode="datetime" display="spinner" onChange={onChangeDate} />
                )}
                {showDatePicker && Platform.OS==='android' && (
                  <DateTimePicker value={lessonData.time.toDate()} mode="date" display="default" onChange={onChangeDate} />
                )}
                {showTimePicker && Platform.OS==='android' && (
                  <DateTimePicker value={lessonData.time.toDate()} mode="time" display="default" onChange={onChangeTime} />
                )}
              </View>
              {/* Location Section */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <LocationField
                  location={lessonData.location || { city: '', country: '' }}
                  onLocationSelect={(location: Location) => {
                    setLessonData(prev => ({
                      ...prev,
                      location: {
                        city: location.city,
                        country: location.country,
                        address: location.address,
                        latitude: location.latitude,
                        longitude: location.longitude,
                      },
                    }));
                  }}
                  label="Lesson Location"
                />
              </View>
              {/* Compact Details Section */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Details</Text>
                <View style={styles.metricsRow}>
                  {/* Duration */}
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Duration</Text>
                    <View style={styles.metricInputRow}>
                      <Icon name="timer" size={16} color="#1976d2" style={styles.metricIcon} />
                      <TextInput
                        style={styles.metricNumberInput}
                        keyboardType="numeric"
                        value={lessonData.duration ? lessonData.duration.toString() : ''}
                        onChangeText={(v)=> handleNumberChange('duration', v)}
                        placeholder="min"
                        placeholderTextColor="#7a8ea2"
                      />
                    </View>
                  </View>
                  {/* Capacity */}
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Capacity</Text>
                    <View style={styles.metricInputRow}>
                      <Icon name="people" size={16} color="#1976d2" style={styles.metricIcon} />
                      <TextInput
                        style={styles.metricNumberInput}
                        keyboardType="numeric"
                        value={lessonData.capacityLimit || ''}
                        onChangeText={(v)=> handleNumberChange('capacityLimit', v)}
                        placeholder="#"
                        placeholderTextColor="#7a8ea2"
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{height:120}} />
            </ScrollView>
          </KeyboardAvoidingView>
          {/* Footer */}
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} accessibilityLabel="Cancel edit lesson" activeOpacity={0.85}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled]} disabled={isSubmitting} onPress={onSubmit} accessibilityLabel="Save lesson changes" activeOpacity={0.9}>
              {isSubmitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Overlay & Card (matching create modal styling)
  overlayPolished:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  glassCard:{ borderRadius:30, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.95)', borderWidth:1, borderColor:'rgba(255,255,255,0.75)', maxHeight:'92%', shadowColor:'#000', shadowOpacity:0.20, shadowRadius:18, shadowOffset:{width:0,height:8}, flex:1 },
  headerGradient:{ paddingVertical:18, paddingHorizontal:24, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  modalTitleNew:{ fontSize:20, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  closeGradientBtn:{ width:42, height:42, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContentNew:{ padding:22, paddingBottom:40 },
  sectionBlock:{ marginBottom:22 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, shadowColor:'#0d47a1', shadowOpacity:0.06, shadowRadius:10, shadowOffset:{width:0,height:4}, borderWidth:1, borderColor:'rgba(13,71,161,0.08)' },
  sectionLabel:{ fontSize:12.5, fontWeight:'800', letterSpacing:0.8, color:'#0d47a1', textTransform:'uppercase', marginBottom:12 },
  textAreaWrapper:{ borderWidth:1, borderColor:'rgba(25,118,210,0.18)', borderRadius:16, backgroundColor:'#f3f7fb', padding:14 },
  textArea:{ minHeight:90, fontSize:14, color:'#0f172a', fontWeight:'500' },
  inlinePickerBtn:{ flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:16, backgroundColor:'#f3f7fb', borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)' },
  inlinePickerText:{ fontSize:14, fontWeight:'600', color:'#0d47a1', flex:1 },
  // Metrics (compact row)
  metricsRow:{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', gap:12 },
  metricBlock:{ flex:1 },
  metricLabel:{ fontSize:11, fontWeight:'800', letterSpacing:0.6, color:'#0d47a1', textTransform:'uppercase', marginBottom:6 },
  metricInputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f3f7fb', borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)', paddingVertical:8, paddingHorizontal:10 },
  metricIcon:{ marginRight:6 },
  metricNumberInput:{ flex:1, fontSize:13, fontWeight:'700', color:'#0d47a1', paddingVertical:2 },
  // Footer action bar
  footerBar:{ position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', gap:14, padding:20, backgroundColor:'rgba(255,255,255,0.9)', borderTopWidth:1, borderTopColor:'rgba(25,118,210,0.15)', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:14, shadowOffset:{width:0,height:4} },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:16, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  cancelText:{ fontSize:15, fontWeight:'700', color:'#0d47a1' },
  primaryBtn:{ flex:1.4, backgroundColor:'#1976d2', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:16, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  primaryBtnDisabled:{ backgroundColor:'#90a4ae' },
  primaryBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5 },
});

export default EditLessonModal;
