import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-big-calendar';
import dayjs from 'dayjs';
import { CalendarWrapperProps, CalendarEvent } from '../types/calendar.types';
import { getLessonTypeDisplayName } from '../../../lesson/types/LessonType';
import { hebrewDateLabel } from '../utils/calendar.utils';

const CalendarWrapper: React.FC<CalendarWrapperProps> = ({ events, onSelectEvent }) => {
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);

  const handleSelectSlot = (date: Date) => {
    const selectedDay = dayjs(date).startOf('day');
    const filtered = events.filter((event) =>
      dayjs(event.start).isSame(selectedDay, 'day')
    );
    setSelectedDateEvents(filtered);
  };

  return (
    <View style={styles.container}>
      <Calendar
        events={events}
        height={500}
        mode="month"
        weekStartsOn={0}
        locale="he"
        swipeEnabled
        showTime={false}
        onPressEvent={onSelectEvent}
        onPressCell={(date) => handleSelectSlot(date)}
        eventCellStyle={{ backgroundColor: '#1976d2', borderRadius: 6 }}
      />

      {selectedDateEvents.length > 0 && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            שיעורים בתאריך {hebrewDateLabel(dayjs(selectedDateEvents[0].start))}
          </Text>

          <FlatList
            data={selectedDateEvents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelectEvent(item)}
                style={styles.listItem}
              >
                <Text style={styles.itemTitle}>{getLessonTypeDisplayName(item.title)}</Text>
                <Text style={styles.itemSubtitle}>משך: {item.duration} דק׳</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
          />
        </View>
      )}
    </View>
  );
};

export default CalendarWrapper;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  listContainer: {
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  listItem: {
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 4
  }
});
