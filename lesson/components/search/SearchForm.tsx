import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { lessonTypes, getLessonIcon, getLessonTypeDisplayName } from '../../types/LessonType';
import { MaterialIcons } from '@expo/vector-icons';
import SearchLocationField from './SearchLocationField';

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
  onSearch: (query?: SearchFormProps['searchQuery']) => void;
}

export const SearchForm: React.FC<SearchFormProps> = ({ searchQuery, setSearchQuery, onSearch }) => {
  const [lessonTypeModalVisible, setLessonTypeModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [participantsModalVisible, setParticipantsModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempPrice, setTempPrice] = useState('');
  const [tempParticipants, setTempParticipants] = useState('');

  const activeFilterCount = [
    searchQuery.lessonType,
    searchQuery.maxPrice,
    searchQuery.maxParticipants,
    searchQuery.day,
    searchQuery.location?.latitude && searchQuery.location?.longitude ? 'loc' : null,
  ].filter(Boolean).length;
  const hasCoachName = searchQuery.coachName.trim().length > 0;
  const canSubmitSearch = hasCoachName || activeFilterCount > 0;

  const generateDates = () => {
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const dates = [];
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return dates;
  };

  const getDayName = (date: Date) => date.toLocaleDateString('he-IL', { weekday: 'short' });

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  };

  const handlePrevMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const clearAllFilters = () => {
    setSearchQuery({
      ...searchQuery,
      maxPrice: '',
      lessonType: '',
      maxParticipants: '',
      coachName: '',
      location: null,
      day: null,
    });
  };

  const clearCoachName = () => {
    const nextQuery = { ...searchQuery, coachName: '' };
    setSearchQuery(nextQuery);
    onSearch(nextQuery);
  };

  return (
    <View style={styles.container}>
      {/* ── Search Bar ── */}
      <View style={styles.searchBar}>
        <View style={styles.searchIconWrap}>
          <MaterialIcons name="search" size={20} color="#90a4ae" />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="חפש מאמן..."
          placeholderTextColor="#90a4ae"
          value={searchQuery.coachName}
          onChangeText={(text) => setSearchQuery({ ...searchQuery, coachName: text })}
          returnKeyType="search"
          onSubmitEditing={handleSearchClick}
        />
        {hasCoachName ? (
          <TouchableOpacity style={styles.inlineClearBtn} onPress={clearCoachName} activeOpacity={0.8}>
            <MaterialIcons name="close" size={18} color="#607d8b" />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.searchSubmitBtn, !canSubmitSearch && styles.searchSubmitBtnDisabled]}
          onPress={handleSearchClick}
          disabled={!canSubmitSearch}
          activeOpacity={0.85}
        >
          <MaterialIcons name="search" size={16} color="#ffffff" />
          <Text style={styles.searchSubmitText}>חפש</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filter Pills ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {/* Lesson type */}
        <Pressable
          style={[styles.pill, !!searchQuery.lessonType && styles.pillActive]}
          onPress={() => setLessonTypeModalVisible(true)}
        >
          <MaterialIcons name="apps" size={15} color={searchQuery.lessonType ? '#0d47a1' : '#546e7a'} />
          <Text style={[styles.pillText, !!searchQuery.lessonType && styles.pillTextActive]} numberOfLines={1}>
            {searchQuery.lessonType ? getLessonTypeDisplayName(searchQuery.lessonType) : 'סוג שיעור'}
          </Text>
          {searchQuery.lessonType ? (
            <Pressable onPress={() => setSearchQuery({ ...searchQuery, lessonType: '' })} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#0d47a1" />
            </Pressable>
          ) : (
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#546e7a" />
          )}
        </Pressable>

        {/* Date */}
        <Pressable
          style={[styles.pill, !!searchQuery.day && styles.pillActive]}
          onPress={() => setShowDatePicker(true)}
        >
          <MaterialIcons name="event" size={15} color={searchQuery.day ? '#0d47a1' : '#546e7a'} />
          <Text style={[styles.pillText, !!searchQuery.day && styles.pillTextActive]} numberOfLines={1}>
            {searchQuery.day ? formatDate(searchQuery.day) : 'תאריך'}
          </Text>
          {searchQuery.day ? (
            <Pressable onPress={() => setSearchQuery({ ...searchQuery, day: null })} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#0d47a1" />
            </Pressable>
          ) : (
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#546e7a" />
          )}
        </Pressable>

        {/* Price */}
        <Pressable
          style={[styles.pill, !!searchQuery.maxPrice && styles.pillActive]}
          onPress={() => { setTempPrice(searchQuery.maxPrice); setPriceModalVisible(true); }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: searchQuery.maxPrice ? '#0d47a1' : '#546e7a' }}>₪</Text>
          <Text style={[styles.pillText, !!searchQuery.maxPrice && styles.pillTextActive]} numberOfLines={1}>
            {searchQuery.maxPrice ? `עד ${searchQuery.maxPrice}` : 'מחיר'}
          </Text>
          {searchQuery.maxPrice ? (
            <Pressable onPress={() => setSearchQuery({ ...searchQuery, maxPrice: '' })} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#0d47a1" />
            </Pressable>
          ) : (
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#546e7a" />
          )}
        </Pressable>

        {/* Participants */}
        <Pressable
          style={[styles.pill, !!searchQuery.maxParticipants && styles.pillActive]}
          onPress={() => { setTempParticipants(searchQuery.maxParticipants); setParticipantsModalVisible(true); }}
        >
          <MaterialIcons name="group" size={15} color={searchQuery.maxParticipants ? '#0d47a1' : '#546e7a'} />
          <Text style={[styles.pillText, !!searchQuery.maxParticipants && styles.pillTextActive]} numberOfLines={1}>
            {searchQuery.maxParticipants ? `עד ${searchQuery.maxParticipants}` : 'משתתפים'}
          </Text>
          {searchQuery.maxParticipants ? (
            <Pressable onPress={() => setSearchQuery({ ...searchQuery, maxParticipants: '' })} hitSlop={8}>
              <MaterialIcons name="close" size={14} color="#0d47a1" />
            </Pressable>
          ) : (
            <MaterialIcons name="keyboard-arrow-down" size={16} color="#546e7a" />
          )}
        </Pressable>
      </ScrollView>

      {/* ── Location ── */}
      <SearchLocationField
        location={searchQuery.location || { city: '', country: '', address: null, latitude: null, longitude: null }}
        onLocationSelect={(loc) => setSearchQuery({ ...searchQuery, location: loc })}
        onLocationClear={() => setSearchQuery({ ...searchQuery, location: null, radiusKm: null })}
        radiusKm={searchQuery.radiusKm}
        onRadiusChange={(r) => setSearchQuery({ ...searchQuery, radiusKm: r })}
      />

      {/* ── Active Filters Bar ── */}
      {activeFilterCount > 0 && (
        <View style={styles.activeBar}>
          <View style={styles.activeBarStart}>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{activeFilterCount}</Text>
            </View>
            <Text style={styles.activeBarLabel}>מסננים פעילים</Text>
          </View>
          <Pressable onPress={clearAllFilters} style={styles.clearAllBtn}>
            <MaterialIcons name="delete-sweep" size={15} color="#c62828" />
            <Text style={styles.clearAllText}>נקה הכל</Text>
          </Pressable>
        </View>
      )}

      {/* ═══ Lesson Type Modal ═══ */}
      <Modal transparent visible={lessonTypeModalVisible} animationType="fade" onRequestClose={() => setLessonTypeModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setLessonTypeModalVisible(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>סוג שיעור</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <TouchableOpacity
                style={[styles.modalOption, !searchQuery.lessonType && styles.modalOptionSelected]}
                onPress={() => { setSearchQuery({ ...searchQuery, lessonType: '' }); setLessonTypeModalVisible(false); }}
              >
                <View style={styles.modalOptionRow}>
                  <MaterialIcons name="filter-list" size={22} color="#607d8b" />
                  <Text style={[styles.modalOptionText, !searchQuery.lessonType && styles.modalOptionTextSelected]}>כל השיעורים</Text>
                </View>
                {!searchQuery.lessonType && <MaterialIcons name="check" size={18} color="#1565c0" />}
              </TouchableOpacity>
              {lessonTypes.map((type) => {
                const { IconComponent, iconName } = getLessonIcon(type);
                const selected = searchQuery.lessonType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.modalOption, selected && styles.modalOptionSelected]}
                    onPress={() => { setSearchQuery({ ...searchQuery, lessonType: type }); setLessonTypeModalVisible(false); }}
                  >
                    <View style={styles.modalOptionRow}>
                      <IconComponent name={iconName} size={22} color={selected ? '#0d47a1' : '#546e7a'} />
                      <Text style={[styles.modalOptionText, selected && styles.modalOptionTextSelected]}>{getLessonTypeDisplayName(type)}</Text>
                    </View>
                    {selected && <MaterialIcons name="check" size={18} color="#1565c0" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ Date Picker Modal ═══ */}
      <Modal transparent animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={styles.dateCard}>
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={handleNextMonth} style={styles.monthBtn}>
                <MaterialIcons name="chevron-right" size={24} color="#1565c0" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {currentMonth.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.monthBtn}>
                <MaterialIcons name="chevron-left" size={24} color="#1565c0" />
              </TouchableOpacity>
            </View>
            <View style={styles.weekRow}>
              {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((d) => (
                <Text key={d} style={styles.weekDayText}>{d}</Text>
              ))}
            </View>
            <View style={styles.datesGrid}>
              {generateDates().map((date) => {
                const sel = date.getDate() === searchQuery.day?.getDate() && date.getMonth() === searchQuery.day?.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={date.toISOString()}
                    style={[styles.dateCell, sel && styles.dateCellSelected, isToday && !sel && styles.dateCellToday]}
                    onPress={() => { setSearchQuery({ ...searchQuery, day: date }); setShowDatePicker(false); }}
                  >
                    <Text style={[styles.dateCellNum, sel && styles.dateCellNumSelected]}>{date.getDate()}</Text>
                    <Text style={[styles.dateCellDay, sel && { color: '#fff' }]}>{getDayName(date)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={styles.clearDateBtn} onPress={() => { setSearchQuery({ ...searchQuery, day: null }); setShowDatePicker(false); }}>
              <Text style={styles.clearDateText}>נקה תאריך</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ Price Modal ═══ */}
      <Modal transparent visible={priceModalVisible} animationType="fade" onRequestClose={() => setPriceModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setPriceModalVisible(false)}>
          <Pressable style={styles.miniCard}>
            <Text style={styles.miniTitle}>מחיר מקסימלי</Text>
            <View style={styles.miniInputRow}>
              <Text style={styles.currencyIcon}>₪</Text>
              <TextInput
                style={styles.miniInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#b0bec5"
                value={tempPrice}
                onChangeText={setTempPrice}
                autoFocus
              />
            </View>
            <View style={styles.miniActions}>
              <TouchableOpacity style={styles.miniCancelBtn} onPress={() => setPriceModalVisible(false)}>
                <Text style={styles.miniCancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.miniApplyBtn}
                onPress={() => { setSearchQuery({ ...searchQuery, maxPrice: tempPrice }); setPriceModalVisible(false); }}
              >
                <Text style={styles.miniApplyText}>אישור</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ═══ Participants Modal ═══ */}
      <Modal transparent visible={participantsModalVisible} animationType="fade" onRequestClose={() => setParticipantsModalVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setParticipantsModalVisible(false)}>
          <Pressable style={styles.miniCard}>
            <Text style={styles.miniTitle}>מקסימום משתתפים</Text>
            <View style={styles.miniInputRow}>
              <MaterialIcons name="group" size={20} color="#0d47a1" />
              <TextInput
                style={styles.miniInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#b0bec5"
                value={tempParticipants}
                onChangeText={setTempParticipants}
                autoFocus
              />
            </View>
            <View style={styles.miniActions}>
              <TouchableOpacity style={styles.miniCancelBtn} onPress={() => setParticipantsModalVisible(false)}>
                <Text style={styles.miniCancelText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.miniApplyBtn}
                onPress={() => { setSearchQuery({ ...searchQuery, maxParticipants: tempParticipants }); setParticipantsModalVisible(false); }}
              >
                <Text style={styles.miniApplyText}>אישור</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

/* ────────────────────────── Styles ────────────────────────── */
const styles = StyleSheet.create({
  /* Container */
  container: { gap: 12 },

  /* Search bar */
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff',
    borderRadius: 16, paddingHorizontal: 14, height: 50, gap: 10,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  searchIconWrap: { alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 15, color: '#0f172a', fontWeight: '500', paddingVertical: 0 },
  inlineClearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  searchSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#1565c0',
    shadowColor: '#1565c0',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  searchSubmitBtnDisabled: {
    backgroundColor: '#b0bec5',
    shadowOpacity: 0,
  },
  searchSubmitText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
    writingDirection: 'rtl',
  },

  /* Filter pills */
  pillsRow: { flexDirection: 'row', gap: 8, paddingVertical: 2, paddingHorizontal: 2 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, height: 38,
    borderWidth: 1, borderColor: '#dfe4ea',
  },
  pillActive: { backgroundColor: '#e3f2fd', borderColor: '#90caf9' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#546e7a', writingDirection: 'rtl' },
  pillTextActive: { color: '#0d47a1' },

  /* Active filters bar */
  activeBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  activeBarStart: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeBadge: {
    backgroundColor: '#1565c0', borderRadius: 10, width: 22, height: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  activeBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  activeBarLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: '600', writingDirection: 'rtl' },
  clearAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12 },
  clearAllText: { color: '#ffcdd2', fontSize: 12, fontWeight: '700', writingDirection: 'rtl' },

  /* ── Overlay (shared) ── */
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 24 },

  /* ── Lesson Type Modal ── */
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '92%', maxWidth: 400,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0d47a1', marginBottom: 16, textAlign: 'left', writingDirection: 'rtl' },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, marginBottom: 6,
    backgroundColor: '#f8fafc',
  },
  modalOptionSelected: { backgroundColor: '#e3f2fd' },
  modalOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalOptionText: { fontSize: 15, fontWeight: '600', color: '#37474f', writingDirection: 'rtl' },
  modalOptionTextSelected: { color: '#0d47a1', fontWeight: '700' },

  /* ── Date Modal ── */
  dateCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '92%', maxWidth: 420,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  monthBtn: { padding: 6, borderRadius: 12, backgroundColor: '#f0f7ff' },
  monthLabel: { fontSize: 16, fontWeight: '800', color: '#0d47a1', textAlign: 'left', writingDirection: 'rtl' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  weekDayText: { width: 40, textAlign: 'center', fontSize: 11, color: '#90a4ae', fontWeight: '700' },
  datesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dateCell: {
    width: 40, height: 52, justifyContent: 'center', alignItems: 'center', margin: 3,
    borderRadius: 14, backgroundColor: '#f8fafc',
  },
  dateCellSelected: { backgroundColor: '#1565c0' },
  dateCellToday: { borderWidth: 2, borderColor: '#90caf9' },
  dateCellNum: { fontSize: 16, color: '#0f172a', fontWeight: '700' },
  dateCellNumSelected: { color: '#fff' },
  dateCellDay: { fontSize: 9.5, color: '#90a4ae', marginTop: 1, fontWeight: '600' },
  clearDateBtn: { marginTop: 14, paddingVertical: 12, backgroundColor: '#f0f7ff', borderRadius: 14, alignItems: 'center' },
  clearDateText: { color: '#1565c0', fontSize: 14, fontWeight: '700' },

  /* ── Mini Modals (price / participants) ── */
  miniCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '80%', maxWidth: 320,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    alignItems: 'center',
  },
  miniTitle: { fontSize: 16, fontWeight: '800', color: '#0d47a1', marginBottom: 4, alignSelf: 'stretch', textAlign: 'left', writingDirection: 'rtl' },
  miniInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, width: '100%' },
  currencyIcon: { fontSize: 20, fontWeight: '800', color: '#0d47a1' },
  miniInput: {
    flex: 1, fontSize: 22, fontWeight: '700', color: '#0f172a', textAlign: 'center',
    borderBottomWidth: 2, borderBottomColor: '#e0e6ee', paddingVertical: 8,
  },
  miniActions: { flexDirection: 'row', gap: 12, marginTop: 24, width: '100%' },
  miniCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f0f4f8', alignItems: 'center' },
  miniCancelText: { fontSize: 14, fontWeight: '700', color: '#546e7a', writingDirection: 'rtl' },
  miniApplyBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#1565c0', alignItems: 'center' },
  miniApplyText: { fontSize: 14, fontWeight: '700', color: '#fff', writingDirection: 'rtl' },
});

export default SearchForm;