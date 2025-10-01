import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { lessonTypes, getLessonIcon } from '../../types/LessonType';
import { MaterialIcons } from '@expo/vector-icons';
import SearchLocationField from './SearchLocationField';
import { LinearGradient } from 'expo-linear-gradient';

interface SearchFormProps {
  searchQuery: {
    maxPrice: string;
    lessonType: string;
    maxParticipants: string;
    coachName: string;
    location: any;
    radiusKm?: number | null;
    day?: Date | null;
  };
  setSearchQuery: (query: SearchFormProps['searchQuery']) => void;
  onSearch: (query: any) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lessonTypeModalVisible, setLessonTypeModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const animatedAdvanced = useRef(new Animated.Value(0)).current; // 0 closed, 1 open

  const activeFilterCount = [
    searchQuery.lessonType,
    searchQuery.maxPrice,
    searchQuery.maxParticipants,
    searchQuery.day,
    searchQuery.location?.latitude && searchQuery.location?.longitude ? 'loc' : null,
  ].filter(Boolean).length;

  useEffect(()=>{
    Animated.timing(animatedAdvanced, {
      toValue: showAdvanced ? 1 : 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [showAdvanced]);

  const generateDates = () => {
    const dates = [];
    const today = new Date(currentMonth);
    // Get the first day of the current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    // Get the last day of the current month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Add dates for the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(today);
      date.setDate(i);
      dates.push(date);
    }
    return dates;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const handleSearchClick = () => {
    const requestBody: any = {
      maxPrice: parseFloat(searchQuery.maxPrice) || undefined,
      lessonType: searchQuery.lessonType || undefined,
      maxParticipants: parseInt(searchQuery.maxParticipants) || undefined,
      coachName: searchQuery.coachName || undefined,
    };

    if (searchQuery.location?.latitude && searchQuery.location?.longitude) {
      requestBody.location = {
        latitude: searchQuery.location.latitude,
        longitude: searchQuery.location.longitude,
        radiusKm: searchQuery.radiusKm,
      };
    }

    if (searchQuery.day) {
      const formattedDate = searchQuery.day.toISOString().split('T')[0];
      requestBody.day = formattedDate;
    }

    onSearch(requestBody);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Select Day';
    return date.toLocaleDateString();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const clearAllFilters = () => {
    setSearchQuery({
      ...searchQuery,
      maxPrice:'',
      lessonType:'',
      maxParticipants:'',
      coachName:'',
      location:null,
      day:null,
    });
  };

  // Removed quick lesson type pills
  const advancedHeight = animatedAdvanced.interpolate({ inputRange:[0,1], outputRange:[0, 180] });
  const advancedOpacity = animatedAdvanced.interpolate({ inputRange:[0,1], outputRange:[0,1] });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.cardGlass}> 
          <View style={styles.cardHeaderRow}> 
            <View style={styles.headerLeft}> 
              <MaterialIcons name="tune" size={20} color="#ffffff" />
              <Text style={styles.title}>Filters</Text>
              <View style={styles.badgeCount}> 
                <Text style={styles.badgeCountText}>{activeFilterCount}</Text>
              </View>
            </View>
            {activeFilterCount>0 && (
              <Pressable onPress={clearAllFilters} style={({pressed})=>[styles.clearAllFiltersBtn, pressed && {opacity:0.6}]}> 
                <MaterialIcons name="close" size={16} color="#ffffff" />
                <Text style={styles.clearAllFiltersText}>Clear</Text>
              </Pressable>
            )}
          </View>

          {/* Quick lesson type pills removed per design simplification */}

          <View style={styles.inlineRow}> 
            <TextInput
              style={[styles.input, focusedField==='coachName' && styles.inputFocused]}
              placeholder="Coach Name"
              placeholderTextColor="#90a4ae"
              value={searchQuery.coachName}
              onFocus={()=>setFocusedField('coachName')}
              onBlur={()=>setFocusedField(null)}
              onChangeText={(text) => setSearchQuery({ ...searchQuery, coachName: text })}
            />
            <Pressable
              style={[styles.input, styles.pickerInput]}
              onPress={() => setLessonTypeModalVisible(true)}
            >
              <Text style={[styles.pickerText, !searchQuery.lessonType && styles.placeholderText]}>
                {searchQuery.lessonType || 'Any Lesson'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={22} color="#1976d2" />
            </Pressable>
          </View>

          <View style={styles.locationWrapper}> 
            <SearchLocationField
              location={searchQuery.location || { city: '', country: '', address: null, latitude: null, longitude: null }}
              onLocationSelect={(loc) => setSearchQuery({ ...searchQuery, location: loc })}
              radiusKm={searchQuery.radiusKm}
              onRadiusChange={(r) => setSearchQuery({ ...searchQuery, radiusKm: r })}
            />
          </View>

          {/* Filter summary chips */}
          <View style={styles.chipsRow}>
            {!!searchQuery.lessonType && (
              <Pressable style={styles.chip} onPress={()=>setSearchQuery({...searchQuery, lessonType:''})}>
                <Text style={styles.chipText}>{searchQuery.lessonType}</Text>
                <MaterialIcons name="close" size={14} color="#0d47a1" />
              </Pressable>
            )}
            {!!searchQuery.maxPrice && (
              <Pressable style={styles.chip} onPress={()=>setSearchQuery({...searchQuery, maxPrice:''})}>
                <Text style={styles.chipText}>≤ ${searchQuery.maxPrice}</Text>
                <MaterialIcons name="close" size={14} color="#0d47a1" />
              </Pressable>
            )}
            {!!searchQuery.maxParticipants && (
              <Pressable style={styles.chip} onPress={()=>setSearchQuery({...searchQuery, maxParticipants:''})}>
                <Text style={styles.chipText}>Max {searchQuery.maxParticipants}</Text>
                <MaterialIcons name="close" size={14} color="#0d47a1" />
              </Pressable>
            )}
            {!!searchQuery.day && (
              <Pressable style={styles.chip} onPress={()=>setSearchQuery({...searchQuery, day:null})}>
                <Text style={styles.chipText}>{formatDate(searchQuery.day)}</Text>
                <MaterialIcons name="close" size={14} color="#0d47a1" />
              </Pressable>
            )}
            {!!searchQuery.location && searchQuery.location.latitude && (
              <Pressable style={styles.chip} onPress={()=>setSearchQuery({...searchQuery, location:null})}>
                <Text style={styles.chipText}>📍 {searchQuery.location.city || 'Location'}</Text>
                <MaterialIcons name="close" size={14} color="#0d47a1" />
              </Pressable>
            )}
          </View>

          {/* Animated Advanced Section */}
          <Animated.View style={[styles.advancedAnimatedContainer,{height:advancedHeight, opacity:advancedOpacity}]}> 
            {showAdvanced && (
              <View style={styles.advancedBlockInner}> 
                <Pressable
                  style={[styles.input, styles.dateInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <View style={styles.datePickerContainer}>
                    <MaterialIcons name="calendar-today" size={20} color="#1976d2" />
                    <Text style={[styles.pickerText, !searchQuery.day && styles.placeholderText]}>
                      {formatDate(searchQuery.day)}
                    </Text>
                  </View>
                </Pressable>
                {/* New compact row for price & participants */}
                <View style={styles.advancedInlineRow}> 
                  <TextInput
                    style={[styles.input, styles.inputHalf, focusedField==='maxPrice' && styles.inputFocused]}
                    placeholder="Max Price"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={searchQuery.maxPrice}
                    onFocus={()=>setFocusedField('maxPrice')}
                    onBlur={()=>setFocusedField(null)}
                    onChangeText={(text) => setSearchQuery({ ...searchQuery, maxPrice: text })}
                  />
                  <TextInput
                    style={[styles.input, styles.inputHalf, focusedField==='maxParticipants' && styles.inputFocused]}
                    placeholder="Max Participants"
                    placeholderTextColor="#ffffff"
                    keyboardType="numeric"
                    value={searchQuery.maxParticipants}
                    onFocus={()=>setFocusedField('maxParticipants')}
                    onBlur={()=>setFocusedField(null)}
                    onChangeText={(text) => setSearchQuery({ ...searchQuery, maxParticipants: text })}
                  />
                </View>
                <TouchableOpacity style={styles.clearAllBtn} onPress={()=>{
                  setSearchQuery({ ...searchQuery, maxPrice:'', maxParticipants:'', day:null });
                }}>
                  <MaterialIcons name="refresh" size={18} color="#1976d2" />
                  <Text style={styles.clearAllText}>Reset Advanced</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>

          <Pressable onPress={() => setShowAdvanced((prev) => !prev)} style={styles.advancedToggleBtn}> 
            <MaterialIcons name={showAdvanced? 'expand-less':'expand-more'} size={22} color="#ffffff" />
            <Text style={styles.advancedToggleText}>{showAdvanced ? 'Hide Advanced' : 'Advanced Filters'}</Text>
          </Pressable>

          <LinearGradient colors={['#64b5f6','#2196f3','#1976d2']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.searchButtonGradient}> 
            <TouchableOpacity style={styles.searchButtonInner} onPress={handleSearchClick} activeOpacity={0.85}>
              <MaterialIcons name="search" size={20} color="#ffffff" />
              <Text style={styles.searchButtonText}>Search Lessons</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Lesson Type Modal */}
        <Modal
          transparent
            visible={lessonTypeModalVisible}
          animationType="fade"
          onRequestClose={() => setLessonTypeModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setLessonTypeModalVisible(false)}>
            <View style={styles.modalContentGlass}>
              <Text style={styles.modalTitle}>Lesson Type</Text>
              <TouchableOpacity
                style={[styles.modalItem, styles.clearOption]}
                onPress={() => {
                  setSearchQuery({ ...searchQuery, lessonType: '' });
                  setLessonTypeModalVisible(false);
                }}
              >
                <View style={styles.modalItemContent}>
                  <MaterialIcons name="filter-list" size={22} color="#607d8b" />
                  <Text style={[styles.modalItemText, styles.clearOptionText]}>Any Lesson</Text>
                </View>
              </TouchableOpacity>
              {lessonTypes.map((type) => {
                const { IconComponent, iconName } = getLessonIcon(type);
                const selected = searchQuery.lessonType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.modalItem, selected && styles.selectedItem]}
                    onPress={() => {
                      setSearchQuery({ ...searchQuery, lessonType: type });
                      setLessonTypeModalVisible(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <IconComponent name={iconName} size={22} color={selected? '#0d47a1':'#1976d2'} />
                      <Text style={[styles.modalItemText, selected && styles.selectedItemText]}>{type}</Text>
                      {selected && <MaterialIcons name="check-circle" size={18} color="#0d47a1" style={{marginLeft:'auto'}} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
            <View style={styles.dateModalContainerGlass}>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={handlePrevMonth} style={styles.monthButton}>
                  <MaterialIcons name="chevron-left" size={26} color="#1976d2" />
                </TouchableOpacity>
                <Text style={styles.monthTitle}>
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <TouchableOpacity onPress={handleNextMonth} style={styles.monthButton}>
                  <MaterialIcons name="chevron-right" size={26} color="#1976d2" />
                </TouchableOpacity>
              </View>
              <View style={styles.calendarContainer}>
                <View style={styles.weekDaysContainer}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Text key={day} style={styles.weekDayText}>{day}</Text>
                  ))}
                </View>
                <View style={styles.datesContainer}>
                  {generateDates().map((date) => {
                    const selected = date.getDate() === searchQuery.day?.getDate() && date.getMonth() === searchQuery.day?.getMonth();
                    return (
                      <TouchableOpacity
                        key={date.toISOString()}
                        style={[styles.dateItem, selected && styles.selectedDateItem]}
                        onPress={() => {
                          setSearchQuery({ ...searchQuery, day: date });
                          setShowDatePicker(false);
                        }}
                      >
                        <Text style={[styles.dateItemText, selected && styles.selectedDateText]}>{date.getDate()}</Text>
                        <Text style={styles.dayNameText}>{getDayName(date)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <TouchableOpacity
                style={styles.clearDateButton}
                onPress={() => {
                  setSearchQuery({ ...searchQuery, day: null });
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.clearDateText}>Clear Date</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper:{ padding:0 },
  cardGlass:{ backgroundColor:'rgba(255,255,255,0.10)', borderRadius:34, padding:18, borderWidth:1, borderColor:'rgba(255,255,255,0.28)', shadowColor:'#000', shadowOpacity:0.18, shadowRadius:16, shadowOffset:{width:0,height:6} },
  title:{ fontSize:18, fontWeight:'800', color:'#ffffff', letterSpacing:0.5 },
  // Newly added header / badge styles
  cardHeaderRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  headerLeft:{ flexDirection:'row', alignItems:'center', gap:8 },
  badgeCount:{ backgroundColor:'rgba(255,255,255,0.20)', paddingHorizontal:8, paddingVertical:4, borderRadius:12 },
  badgeCountText:{ color:'#ffffff', fontSize:11, fontWeight:'800' },
  clearAllFiltersBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', paddingHorizontal:10, paddingVertical:6, borderRadius:14, gap:4, borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  clearAllFiltersText:{ color:'#ffffff', fontWeight:'700', fontSize:12 },
  quickTypeRow:{ paddingVertical:4, paddingRight:6, gap:8 },
  typePill:{ backgroundColor:'rgba(255,255,255,0.14)', paddingHorizontal:14, paddingVertical:8, borderRadius:18, borderWidth:1, borderColor:'rgba(255,255,255,0.22)' },
  typePillActive:{ backgroundColor:'#ffffff', borderColor:'#ffffff' },
  typePillText:{ color:'#ffffff', fontWeight:'700', fontSize:12, letterSpacing:0.4 },
  typePillTextActive:{ color:'#0d47a1' },
  input:{ borderWidth:1, borderColor:'rgba(255,255,255,0.30)', borderRadius:16, paddingHorizontal:14, paddingVertical:9, marginBottom:12, backgroundColor:'rgba(255,255,255,0.16)', color:'#ffffff', fontWeight:'600' },
  dateInput:{},
  inputFocused:{ borderColor:'#ffffff', backgroundColor:'rgba(255,255,255,0.25)' },
  pickerInput:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  placeholderText:{ color:'rgba(255,255,255,0.55)' },
  inlineRow:{ flexDirection:'row', gap:10 },
  locationWrapper:{ marginTop:-6, marginBottom:10 },
  pickerText:{ color:'#ffffff', fontWeight:'600' },
  datePickerContainer:{ flexDirection:'row', alignItems:'center', gap:8 },
  chipsRow:{ flexDirection:'row', flexWrap:'wrap', gap:8, marginBottom:14 },
  chip:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal:10, paddingVertical:6, borderRadius:16, gap:4, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:4, shadowOffset:{width:0,height:2}, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
  chipText:{ color:'#ffffff', fontWeight:'600', fontSize:12 },
  advancedAnimatedContainer:{ overflow:'hidden', width:'100%', marginTop:2 },
  advancedBlockInner:{ backgroundColor:'transparent', padding:0, borderRadius:0, borderWidth:0, borderColor:'transparent', flex:1 },
  advancedInlineRow:{ flexDirection:'row', gap:10, marginBottom:2 },
  inputHalf:{ flex:1, marginBottom:12 },
  clearAllBtn:{ flexDirection:'row', alignItems:'center', gap:6, alignSelf:'flex-start', backgroundColor:'rgba(255,255,255,0.16)', paddingHorizontal:12, paddingVertical:8, borderRadius:16, marginTop:2, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
  clearAllText:{ color:'#ffffff', fontWeight:'700', fontSize:12 },
  advancedToggleBtn:{ flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:2, marginBottom:6, paddingVertical:8, borderRadius:18, backgroundColor:'rgba(255,255,255,0.14)', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:5, shadowOffset:{width:0,height:3}, gap:6, borderWidth:1, borderColor:'rgba(255,255,255,0.25)' },
  advancedToggleText:{ color:'#ffffff', fontWeight:'800', fontSize:13, letterSpacing:0.5 },
  searchButtonGradient:{ borderRadius:24, padding:2, marginTop:2, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:10, shadowOffset:{width:0,height:4} },
  searchButtonInner:{ backgroundColor:'transparent', borderRadius:20, paddingVertical:12, flexDirection:'row', justifyContent:'center', alignItems:'center', gap:8 },
  searchButtonText:{ color:'#ffffff', fontWeight:'800', fontSize:15, letterSpacing:0.5 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.55)', justifyContent:'center', alignItems:'center', padding:24 },
  modalContentGlass:{ backgroundColor:'rgba(255,255,255,0.95)', borderRadius:28, padding:20, width:'90%', maxHeight:'75%', borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:16, shadowOffset:{width:0,height:8} },
  modalTitle:{ fontSize:18, fontWeight:'800', marginBottom:14, color:'#0d47a1' },
  modalItem:{ paddingVertical:14, paddingHorizontal:12, borderRadius:16, marginBottom:8, backgroundColor:'rgba(255,255,255,0.85)', borderWidth:1, borderColor:'rgba(13,71,161,0.12)' },
  selectedItem:{ backgroundColor:'#bbdefb', borderColor:'#1976d2' },
  modalItemContent:{ flexDirection:'row', alignItems:'center', gap:12 },
  modalItemText:{ fontSize:15, fontWeight:'600', color:'#0d47a1' },
  selectedItemText:{ color:'#0d47a1' },
  clearOption:{ backgroundColor:'rgba(255,255,255,0.9)' },
  clearOptionText:{ color:'#607d8b', fontWeight:'600' },
  dateModalContainerGlass:{ backgroundColor:'rgba(255,255,255,0.96)', borderRadius:28, padding:20, width:'92%', maxWidth:420, borderWidth:1, borderColor:'rgba(255,255,255,0.55)', shadowColor:'#000', shadowOpacity:0.25, shadowRadius:18, shadowOffset:{width:0,height:10} },
  calendarContainer:{ marginTop:4 },
  weekDaysContainer:{ flexDirection:'row', justifyContent:'space-around', marginBottom:6 },
  weekDayText:{ width:40, textAlign:'center', fontSize:11, color:'#0d47a1', fontWeight:'700' },
  datesContainer:{ flexDirection:'row', flexWrap:'wrap', justifyContent:'flex-start' },
  dateItem:{ width:40, height:52, justifyContent:'center', alignItems:'center', margin:3, borderRadius:14, backgroundColor:'rgba(255,255,255,0.7)', borderWidth:1, borderColor:'rgba(13,71,161,0.15)' },
  selectedDateItem:{ backgroundColor:'#1976d2', borderColor:'#1976d2' },
  dateItemText:{ fontSize:16, color:'#0d47a1', fontWeight:'700' },
  selectedDateText:{ color:'#ffffff' },
  dayNameText:{ fontSize:10, color:'#1565c0', marginTop:2, fontWeight:'600' },
  clearDateButton:{ marginTop:14, paddingVertical:12, backgroundColor:'#e3f2fd', borderRadius:18, alignItems:'center' },
  clearDateText:{ color:'#1976d2', fontSize:14, fontWeight:'700', letterSpacing:0.3 },
  monthNavigation:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:10 },
  monthButton:{ padding:6, borderRadius:14, backgroundColor:'#e3f2fd' },
  monthTitle:{ fontSize:16, fontWeight:'800', color:'#0d47a1' },
});

export default SearchForm;