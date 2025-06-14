import dayjs from 'dayjs';
import { Lesson } from '../../../lesson/types/Lesson';
import { CalendarEvent } from '../types/calendar.types';

export const formatLessonToEvent = (lesson: Lesson): CalendarEvent => {
  const startTime = dayjs(lesson.time);
  return {
    ...lesson,
    title: lesson.title,
    start: new Date(lesson.time),
    end: new Date(startTime.add(lesson.duration, 'minute').toISOString()),
  };
};
