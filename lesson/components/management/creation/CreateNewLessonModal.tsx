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
  Pressable,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Location } from '../../../../profile/types/profile';
import LocationField from '../../../../integrations/google_location/LocationField';
import { LessonType, lessonTypes, getLessonIcon } from '../../../types/LessonType';
import { LinearGradient } from 'expo-linear-gradient';

interface CoachLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  newLesson: {
    title: string;
    description: string;
    time: string;
    price: number;
    capacityLimit: number;
    duration: number;
    location: {
      city: string;
      country: string;
    };
  };
  setNewLesson: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    time: string;
    price: number;
    capacityLimit: number;
    duration: number;
    location: {
      city: string;
      country: string;
    };
  }>>;
  isSubmitting?: boolean;
}

const CoachLessonModal: React.FC<CoachLessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  newLesson,
  setNewLesson,
  isSubmitting = false,
}) => {
  // Replace original number handler to avoid string '' assignment
  const handleNumberChange = (field: string, value: string, isFloat = false) => {
    const cleaned = value.replace(/[^0-9.]/g,'');
    const parsed = cleaned === '' ? 0 : (isFloat ? parseFloat(cleaned) : parseInt(cleaned,10));
    setNewLesson(prev => ({ ...prev, [field]: isNaN(parsed) ? 0 : parsed }));
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

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
        const newDate = new Date(selectedDate);
        setDate(newDate);
        const year = newDate.getFullYear();
        const month = newDate.getMonth();
        const day = newDate.getDate();
        const hours = newDate.getHours();
        const minutes = newDate.getMinutes();
        const exactDate = new Date(year, month, day, hours, minutes);
        setNewLesson((prev: typeof newLesson) => ({ ...prev, time: exactDate.toISOString() }));
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
      setNewLesson((prev: typeof newLesson) => ({ ...prev, time: combinedDate.toISOString() }));
    }
  };

  // Initialize date when modal opens
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setDate(now);
      if (!newLesson.time) {
        setNewLesson(prev => ({ ...prev, time: now.toISOString() }));
      }
    } else {
      setShowDatePicker(false);
      setShowTimePicker(false);
    }
  }, [isOpen]);

  // UPDATED: horizontal scroll chips for compact selection
  const renderLessonTypeChips = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.typeChipScroll}
      contentContainerStyle={styles.typeChipRow}
    >
      {lessonTypes.map(type => { 
        const active = newLesson.title === type; 
        const { IconComponent, iconName } = getLessonIcon(type); 
        return (
          <TouchableOpacity
            key={type}
            style={[styles.typeChip, active && styles.typeChipActive]}
            onPress={()=> setNewLesson(prev=>({...prev,title:type}))}
            activeOpacity={0.85}
            accessibilityLabel={`Select lesson type ${type}`}
            accessibilityState={{ selected: active }}
          >
            <IconComponent name={iconName} size={16} color={active? '#fff':'#1976d2'} />
            <Text style={[styles.typeChipText, active && styles.typeChipTextActive]} numberOfLines={1}>{type}</Text>
          </TouchableOpacity>
        ); 
      })}
    </ScrollView>
  );

  const disabledSubmit = !newLesson.title || isSubmitting;

  return (
    <Modal visible={isOpen} animationType="fade" transparent>
      <View style={styles.overlayPolished}>
        <View style={styles.glassCard}>
          {/* Header */}
          <LinearGradient colors={['#0d47a1','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.headerGradient}> 
            <Text style={styles.modalTitleNew}>Create Lesson</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeGradientBtn} accessibilityLabel="Close create lesson modal">
              <Icon name="close" size={22} color="#ffffff" />
            </TouchableOpacity>
          </LinearGradient>

          <KeyboardAvoidingView behavior={Platform.OS==='ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS==='ios'? 60 : 0} style={{flex:1}}>
            <ScrollView style={{flex:1}} contentContainerStyle={styles.scrollContentNew} showsVerticalScrollIndicator={false}>
              {/* Lesson Type */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Lesson Type</Text>
                {renderLessonTypeChips()}
                {!newLesson.title && (<Text style={styles.helperWarning}>Select a lesson type to enable creation.</Text>)}
              </View>
              {/* Description */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Description</Text>
                <View style={styles.textAreaWrapper}> 
                  <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Describe your lesson..."
                    placeholderTextColor="#5d7489"
                    value={newLesson.description}
                    onChangeText={text=> setNewLesson(prev=>({...prev, description:text}))}
                  />
                </View>
              </View>
              {/* Date & Time */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <Text style={styles.sectionLabel}>Date & Time</Text>
                <TouchableOpacity style={styles.inlinePickerBtn} onPress={()=> setShowDatePicker(true)} activeOpacity={0.85}>
                  <Icon name="calendar-today" size={18} color="#1976d2" style={{marginRight:10}} />
                  <Text style={styles.inlinePickerText}>{date.toLocaleString()}</Text>
                </TouchableOpacity>
                {showDatePicker && Platform.OS==='ios' && (
                  <DateTimePicker value={date} mode="datetime" display="spinner" onChange={onChangeDate} />
                )}
                {showDatePicker && Platform.OS==='android' && (
                  <DateTimePicker value={date} mode="date" display="default" onChange={onChangeDate} />
                )}
                {showTimePicker && Platform.OS==='android' && (
                  <DateTimePicker value={date} mode="time" display="default" onChange={onChangeTime} />
                )}
              </View>
              {/* Location */}
              <View style={[styles.sectionBlock, styles.sectionCard]}> 
                <LocationField
                  location={newLesson.location || { city:'', country:'' }}
                  onLocationSelect={(location: Location)=> {
                    setNewLesson(prev=> ({...prev, location:{ city:location.city, country:location.country, address:location.address, latitude:location.latitude, longitude:location.longitude }}));
                  }}
                  label="Location"
                />
              </View>
              {/* NEW Compact Metrics (Duration, Capacity, Price) */}
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
                        value={newLesson.duration ? newLesson.duration.toString() : ''}
                        onChangeText={v=> handleNumberChange('duration', v)}
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
                        value={newLesson.capacityLimit ? newLesson.capacityLimit.toString() : ''}
                        onChangeText={v=> handleNumberChange('capacityLimit', v)}
                        placeholder="#"
                        placeholderTextColor="#7a8ea2"
                      />
                    </View>
                  </View>
                  {/* Price */}
                  <View style={styles.metricBlock}>
                    <Text style={styles.metricLabel}>Price</Text>
                    <View style={styles.metricInputRow}>
                      <Icon name="attach-money" size={16} color="#1976d2" style={styles.metricIcon} />
                      <TextInput
                        style={styles.metricNumberInput}
                        keyboardType="numeric"
                        value={newLesson.price ? newLesson.price.toString() : ''}
                        onChangeText={v=> handleNumberChange('price', v, true)}
                        placeholder="$"
                        placeholderTextColor="#7a8ea2"
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View style={{height:120}} />
            </ScrollView>
          </KeyboardAvoidingView>
          {/* Footer Action Bar */}
          <View style={styles.footerBar}> 
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} accessibilityLabel="Cancel lesson creation" activeOpacity={0.85}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryBtn, disabledSubmit && styles.primaryBtnDisabled]} disabled={disabledSubmit} onPress={onSubmit} accessibilityLabel="Submit new lesson" activeOpacity={0.9}>
              {isSubmitting ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.primaryBtnText}>{newLesson.title? 'Create Lesson':'Select Type'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Base overlay & card
  overlayPolished:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', padding:20 },
  glassCard:{ borderRadius:30, overflow:'hidden', backgroundColor:'rgba(255,255,255,0.94)', borderWidth:1, borderColor:'rgba(255,255,255,0.75)', maxHeight:'92%', shadowColor:'#000', shadowOpacity:0.20, shadowRadius:18, shadowOffset:{width:0,height:8}, flex:1 },
  headerGradient:{ paddingVertical:18, paddingHorizontal:24, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  modalTitleNew:{ fontSize:20, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  closeGradientBtn:{ width:42, height:42, borderRadius:16, backgroundColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.4)' },
  scrollContentNew:{ padding:22, paddingBottom:40 },
  sectionBlock:{ marginBottom:22 },
  sectionCard:{ backgroundColor:'#ffffff', borderRadius:22, padding:18, shadowColor:'#0d47a1', shadowOpacity:0.06, shadowRadius:10, shadowOffset:{width:0,height:4}, borderWidth:1, borderColor:'rgba(13,71,161,0.08)' },
  sectionLabel:{ fontSize:12.5, fontWeight:'800', letterSpacing:0.8, color:'#0d47a1', textTransform:'uppercase', marginBottom:12 },
  // NEW horizontal scroll styles
  typeChipScroll:{ marginHorizontal:-4 },
  typeChipRow:{ flexDirection:'row', alignItems:'center', paddingHorizontal:4, gap:8 },
  chipWrap:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  typeChip:{ flexDirection:'row', alignItems:'center', paddingVertical:8, paddingHorizontal:12, backgroundColor:'#f1f6fa', borderRadius:16, borderWidth:1, borderColor:'rgba(25,118,210,0.20)', gap:6 },
  typeChipActive:{ backgroundColor:'#1976d2', borderColor:'#1976d2', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:5, shadowOffset:{width:0,height:3} },
  typeChipText:{ fontSize:12.5, fontWeight:'700', color:'#1976d2' },
  typeChipTextActive:{ color:'#ffffff' },
  helperWarning:{ marginTop:8, fontSize:11, fontWeight:'600', color:'#d32f2f' },
  textAreaWrapper:{ borderWidth:1, borderColor:'rgba(25,118,210,0.18)', borderRadius:16, backgroundColor:'#f3f7fb', padding:14 },
  textArea:{ minHeight:90, fontSize:14, color:'#0f172a', fontWeight:'500' },
  inlinePickerBtn:{ flexDirection:'row', alignItems:'center', paddingVertical:12, paddingHorizontal:16, backgroundColor:'#f3f7fb', borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)', shadowColor:'transparent' },
  inlinePickerText:{ fontSize:14, fontWeight:'600', color:'#0d47a1', flex:1 },
  inlineInputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f3f7fb', borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)', paddingVertical:10, paddingHorizontal:14, marginBottom:12 },
  inlineIcon:{ marginRight:10 },
  inlineNumberInput:{ flex:1, fontSize:14, fontWeight:'600', color:'#0d47a1' },
  // Removed quick preset chip styles.
  metricsRow:{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', gap:12 },
  metricBlock:{ flex:1 },
  metricLabel:{ fontSize:11, fontWeight:'800', letterSpacing:0.6, color:'#0d47a1', textTransform:'uppercase', marginBottom:6 },
  metricInputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'#f3f7fb', borderRadius:14, borderWidth:1, borderColor:'rgba(25,118,210,0.18)', paddingVertical:8, paddingHorizontal:10 },
  metricIcon:{ marginRight:6 },
  metricNumberInput:{ flex:1, fontSize:13, fontWeight:'700', color:'#0d47a1', paddingVertical:2 },
  footerBar:{ position:'absolute', left:0, right:0, bottom:0, flexDirection:'row', gap:14, padding:20, backgroundColor:'rgba(255,255,255,0.9)', borderTopWidth:1, borderTopColor:'rgba(25,118,210,0.15)', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:14, shadowOffset:{width:0,height:4} },
  cancelBtn:{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:16, borderWidth:1.5, borderColor:'rgba(25,118,210,0.25)' },
  cancelText:{ fontSize:15, fontWeight:'700', color:'#0d47a1' },
  primaryBtn:{ flex:1.4, backgroundColor:'#1976d2', borderRadius:18, alignItems:'center', justifyContent:'center', paddingVertical:16, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  primaryBtnDisabled:{ backgroundColor:'#90a4ae' },
  primaryBtnText:{ color:'#ffffff', fontSize:15, fontWeight:'800', letterSpacing:0.5 },
});

export default CoachLessonModal;