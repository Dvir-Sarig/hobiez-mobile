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
    if (!date) return 'Date';
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

  // Advanced filters animation (opacity only to let height wrap content)
  const advancedOpacity = animatedAdvanced.interpolate({ inputRange:[0,1], outputRange:[0,1] });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.wrapper} keyboardShouldPersistTaps="handled">
        <View style={styles.compactContainer}>
          {/* Compact Row */}
          <View style={styles.compactRow}> 
            <TextInput
              style={[styles.compactInput, focusedField==='coachName' && styles.compactInputFocused]}
              placeholder="Coach"
              placeholderTextColor="#78909c"
              value={searchQuery.coachName}
              onFocus={()=>setFocusedField('coachName')}
              onBlur={()=>setFocusedField(null)}
              onChangeText={(text) => setSearchQuery({ ...searchQuery, coachName: text })}
              returnKeyType="search"
              onSubmitEditing={handleSearchClick}
            />
            <Pressable style={styles.typeSelector} onPress={()=> setLessonTypeModalVisible(true)}>
              <MaterialIcons name="apps" size={18} color="#1565c0" />
              <Text style={[styles.typeSelectorText, !searchQuery.lessonType && styles.typeSelectorPlaceholder]} numberOfLines={1}>
                {searchQuery.lessonType || 'Any'}
              </Text>
              <MaterialIcons name="expand-more" size={18} color="#1565c0" />
            </Pressable>
            <TouchableOpacity style={styles.searchBtn} onPress={handleSearchClick} activeOpacity={0.85}>
              <MaterialIcons name="search" size={20} color="#fff" />
            </TouchableOpacity>
            <Pressable onPress={()=> setShowAdvanced(p=>!p)} style={styles.moreBtn} accessibilityLabel={showAdvanced? 'Hide advanced filters':'Show advanced filters'}>
              <MaterialIcons name={showAdvanced? 'expand-less':'tune'} size={20} color="#1565c0" />
              {activeFilterCount>0 && <View style={styles.countBubble}><Text style={styles.countBubbleText}>{activeFilterCount}</Text></View>}
            </Pressable>
          </View>

          {/* (Chips moved to bottom) */}
          {!showAdvanced && activeFilterCount>0 && (
            <View style={styles.collapsedChipsBar}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collapsedChipsRow}>
                {!!searchQuery.lessonType && (
                  <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, lessonType:''})}>
                    <Text style={styles.compactChipText}>{searchQuery.lessonType}</Text>
                    <MaterialIcons name="close" size={14} color="#0d47a1" />
                  </Pressable>
                )}
                {!!searchQuery.maxPrice && (
                  <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, maxPrice:''})}>
                    <Text style={styles.compactChipText}>≤ ${searchQuery.maxPrice}</Text>
                    <MaterialIcons name="close" size={14} color="#0d47a1" />
                  </Pressable>
                )}
                {!!searchQuery.maxParticipants && (
                  <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, maxParticipants:''})}>
                    <Text style={styles.compactChipText}>Max {searchQuery.maxParticipants}</Text>
                    <MaterialIcons name="close" size={14} color="#0d47a1" />
                  </Pressable>
                )}
                {!!searchQuery.day && (
                  <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, day:null})}>
                    <Text style={styles.compactChipText}>{formatDate(searchQuery.day)}</Text>
                    <MaterialIcons name="close" size={14} color="#0d47a1" />
                  </Pressable>
                )}
                {!!searchQuery.location && searchQuery.location.latitude && (
                  <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, location:null, radiusKm: null})}>
                    <Text style={styles.compactChipText}>📍 {searchQuery.location.city || 'Location'}{typeof searchQuery.radiusKm==='number' ? ` • ${searchQuery.radiusKm}km` : ''}</Text>
                    <MaterialIcons name="close" size={14} color="#0d47a1" />
                  </Pressable>
                )}
              </ScrollView>
              <Pressable onPress={clearAllFilters} style={styles.clearCollapsedBtn}>
                <MaterialIcons name="delete-sweep" size={16} color="#1565c0" />
              </Pressable>
            </View>
          )}

          {/* Advanced Section */}
          {showAdvanced && (
            <Animated.View style={[styles.advancedAnimatedContainer,{ opacity:advancedOpacity }]}> 
              <View style={styles.advancedBlockInner}> 
                <View style={styles.advancedRowWrap}>
                  <Pressable style={[styles.compactInput, styles.dateTrigger]} onPress={()=> setShowDatePicker(true)}>
                    <MaterialIcons name="calendar-today" size={18} color="#1565c0" />
                    <Text style={[styles.typeSelectorText, !searchQuery.day && styles.typeSelectorPlaceholder]}>
                      {formatDate(searchQuery.day)}
                    </Text>
                  </Pressable>
                  <TextInput
                    style={[styles.compactInput, focusedField==='maxPrice' && styles.compactInputFocused]}
                    placeholder="Max Price"
                    placeholderTextColor="#78909c"
                    keyboardType="numeric"
                    value={searchQuery.maxPrice}
                    onFocus={()=>setFocusedField('maxPrice')}
                    onBlur={()=>setFocusedField(null)}
                    onChangeText={(text) => setSearchQuery({ ...searchQuery, maxPrice: text })}
                  />
                  <TextInput
                    style={[styles.compactInput, focusedField==='maxParticipants' && styles.compactInputFocused]}
                    placeholder="Max People"
                    placeholderTextColor="#78909c"
                    keyboardType="numeric"
                    value={searchQuery.maxParticipants}
                    onFocus={()=>setFocusedField('maxParticipants')}
                    onBlur={()=>setFocusedField(null)}
                    onChangeText={(text) => setSearchQuery({ ...searchQuery, maxParticipants: text })}
                  />
                </View>
                <View style={styles.locationWrapperCompact}> 
                  <SearchLocationField
                    location={searchQuery.location || { city: '', country: '', address: null, latitude: null, longitude: null }}
                    onLocationSelect={(loc) => setSearchQuery({ ...searchQuery, location: loc })}
                    radiusKm={searchQuery.radiusKm}
                    onRadiusChange={(r) => setSearchQuery({ ...searchQuery, radiusKm: r })}
                  />
                </View>
                <View style={styles.bottomChipsWrap}> 
                  {activeFilterCount===0 && (
                    <Text style={styles.noFiltersText}>No filters selected</Text>
                  )}
                  <View style={styles.chipsRowCompact}>
                    {!!searchQuery.lessonType && (
                      <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, lessonType:''})}>
                        <Text style={styles.compactChipText}>{searchQuery.lessonType}</Text>
                        <MaterialIcons name="close" size={14} color="#0d47a1" />
                      </Pressable>
                    )}
                    {!!searchQuery.maxPrice && (
                      <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, maxPrice:''})}>
                        <Text style={styles.compactChipText}>≤ ${searchQuery.maxPrice}</Text>
                        <MaterialIcons name="close" size={14} color="#0d47a1" />
                      </Pressable>
                    )}
                    {!!searchQuery.maxParticipants && (
                      <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, maxParticipants:''})}>
                        <Text style={styles.compactChipText}>Max {searchQuery.maxParticipants}</Text>
                        <MaterialIcons name="close" size={14} color="#0d47a1" />
                      </Pressable>
                    )}
                    {!!searchQuery.day && (
                      <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, day:null})}>
                        <Text style={styles.compactChipText}>{formatDate(searchQuery.day)}</Text>
                        <MaterialIcons name="close" size={14} color="#0d47a1" />
                      </Pressable>
                    )}
                    {!!searchQuery.location && searchQuery.location.latitude && (
                      <Pressable style={styles.compactChip} onPress={()=>setSearchQuery({...searchQuery, location:null, radiusKm:null})}>
                        <Text style={styles.compactChipText}>📍 {searchQuery.location.city || 'Location'}{typeof searchQuery.radiusKm==='number' ? ` • ${searchQuery.radiusKm}km` : ''}</Text>
                        <MaterialIcons name="close" size={14} color="#0d47a1" />
                      </Pressable>
                    )}
                    {activeFilterCount>0 && (
                      <Pressable onPress={clearAllFilters} style={[styles.clearInlineBtn, styles.clearInlineBtnRight]}>
                        <MaterialIcons name="delete-sweep" size={14} color="#1565c0" />
                        <Text style={styles.clearInlineText}>Clear All</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
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
  wrapper:{ paddingHorizontal:0 },
  compactContainer:{ backgroundColor:'rgba(255,255,255,0.08)', borderRadius:22, padding:12, borderWidth:1, borderColor:'rgba(255,255,255,0.18)' },
  compactRow:{ flexDirection:'row', alignItems:'stretch', gap:8 },
  compactInput:{ flex:1, backgroundColor:'#ffffff', borderRadius:14, paddingHorizontal:14, paddingVertical:10, borderWidth:1, borderColor:'#d5dde5', fontSize:14, color:'#0f172a', fontWeight:'500', height:46 },
  compactInputFocused:{ borderColor:'#1565c0', shadowColor:'#1565c0', shadowOpacity:0.18, shadowRadius:5, shadowOffset:{width:0,height:2} },
  typeSelector:{ flexDirection:'row', alignItems:'center', backgroundColor:'#ffffff', borderRadius:14, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:'#d5dde5', maxWidth:104, flexShrink:1, gap:6, height:46 },
  typeSelectorText:{ fontSize:13.5, fontWeight:'600', color:'#0f172a', flexShrink:1 },
  typeSelectorPlaceholder:{ color:'#78909c', fontWeight:'500' },
  searchBtn:{ backgroundColor:'#1565c0', borderRadius:14, paddingHorizontal:14, paddingVertical:10, alignItems:'center', justifyContent:'center', height:46, minWidth:46 },
  moreBtn:{ backgroundColor:'#ffffff', borderRadius:14, paddingHorizontal:12, paddingVertical:10, flexDirection:'row', alignItems:'center', position:'relative', height:46 },
  countBubble:{ position:'absolute', top:-6, right:-6, backgroundColor:'#1565c0', borderRadius:10, paddingHorizontal:5, paddingVertical:2 },
  countBubbleText:{ color:'#ffffff', fontSize:10, fontWeight:'700' },
  chipsRowCompact:{ flexDirection:'row', flexWrap:'wrap', gap:6, marginTop:10 },
  compactChip:{ flexDirection:'row', alignItems:'center', backgroundColor:'#e3f2fd', paddingHorizontal:10, paddingVertical:6, borderRadius:14, gap:4, borderWidth:1, borderColor:'#bbdefb' },
  compactChipText:{ color:'#0d47a1', fontSize:11.5, fontWeight:'700' },
  collapsedChipsBar:{ marginTop:10, flexDirection:'row', alignItems:'center', gap:8 },
  collapsedChipsRow:{ flexDirection:'row', alignItems:'center', gap:6, paddingRight:4 },
  clearCollapsedBtn:{ backgroundColor:'#ffffff', borderRadius:14, padding:8, borderWidth:1, borderColor:'#d5dde5', alignItems:'center', justifyContent:'center' },
  bottomChipsWrap:{ marginTop:16, borderTopWidth:1, borderTopColor:'#e2e8f0', paddingTop:12 },
  clearInlineBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#ffffff', paddingHorizontal:8, paddingVertical:4, borderRadius:12, gap:2, borderWidth:1, borderColor:'#e0e6eb' },
  clearInlineBtnRight:{ marginLeft:'auto' },
  clearInlineText:{ fontSize:11, fontWeight:'700', color:'#1565c0' },
  noFiltersText:{ fontSize:11, color:'#607d8b', fontWeight:'600' },
  advancedRowWrap:{ flexDirection:'row', gap:8, marginTop:12, flexWrap:'wrap' },
  dateTrigger:{ flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'#ffffff', borderRadius:14, paddingHorizontal:12, paddingVertical:10, borderWidth:1, borderColor:'#d5dde5', flex:1, height:46 },
  locationWrapperCompact:{ marginTop:12 },
  title:{ fontSize:18, fontWeight:'800', color:'#0d47a1', letterSpacing:0.5 },
  // Newly added header / badge styles
  cardHeaderRow:{ display:'none' },
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
  input:{},
  dateInput:{},
  inputFocused:{ borderColor:'#ffffff', backgroundColor:'rgba(255,255,255,0.25)' },
  pickerInput:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  placeholderText:{ color:'rgba(255,255,255,0.55)' },
  inlineRow:{ flexDirection:'row', gap:10 },
  locationWrapper:{ marginTop:-6, marginBottom:10 },
  pickerText:{ color:'#ffffff', fontWeight:'600' },
  datePickerContainer:{ flexDirection:'row', alignItems:'center', gap:8 },
  chipsRow:{},
  chip:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal:10, paddingVertical:6, borderRadius:16, gap:4, shadowColor:'#000', shadowOpacity:0.10, shadowRadius:4, shadowOffset:{width:0,height:2}, borderWidth:1, borderColor:'rgba(255,255,255,0.28)' },
  chipText:{ color:'#ffffff', fontWeight:'600', fontSize:12 },
  advancedAnimatedContainer:{ overflow:'visible', width:'100%', marginTop:2, zIndex:80 },
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