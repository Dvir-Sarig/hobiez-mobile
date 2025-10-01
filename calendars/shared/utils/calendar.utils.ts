import dayjs from 'dayjs';
import { Lesson } from '../../../lesson/types/Lesson';
import { CalendarEvent } from '../types/calendar.types';

const CAL_DEBUG = true;

// Parse a naive local datetime string (YYYY-MM-DDTHH:mm[:ss]) without applying timezone shifts.
const parseNaiveLocal = (raw: string): Date => {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) {
    const [, y, mo, d, h, mi, s] = m;
    return new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(h),
      Number(mi),
      Number(s || '0'),
      0
    );
  }
  // Fallback to dayjs normal parsing (already local) if format differs
  return dayjs(raw).toDate();
};

export const formatLessonToEvent = (lesson: Lesson): CalendarEvent => {
  const raw = lesson.time;
  const startLocal = parseNaiveLocal(raw); // keep exact wall-clock components

  // Ensure duration positive
  const duration = (lesson.duration && lesson.duration > 0) ? lesson.duration : 30;
  const endLocal = new Date(startLocal.getTime() + duration * 60000);
  if (endLocal.getTime() <= startLocal.getTime()) {
    endLocal.setTime(startLocal.getTime() + 60000); // minimum 1 minute
  }

  const event: CalendarEvent & { allDay?: boolean } = {
    ...lesson,
    title: lesson.title,
    start: startLocal,
    end: endLocal,
    // @ts-ignore
    allDay: false,
  };

  if (CAL_DEBUG) {
    try {
      console.log('CALDBG formatLessonToEvent A', {
        lessonId: lesson.id,
        rawTime: raw,
        manualParse: true,
        startLocal: `${startLocal.getFullYear()}-${String(startLocal.getMonth()+1).padStart(2,'0')}-${String(startLocal.getDate()).padStart(2,'0')} ${String(startLocal.getHours()).padStart(2,'0')}:${String(startLocal.getMinutes()).padStart(2,'0')}:${String(startLocal.getSeconds()).padStart(2,'0')}`,
        endLocal: `${endLocal.getFullYear()}-${String(endLocal.getMonth()+1).padStart(2,'0')}-${String(endLocal.getDate()).padStart(2,'0')} ${String(endLocal.getHours()).padStart(2,'0')}:${String(endLocal.getMinutes()).padStart(2,'0')}:${String(endLocal.getSeconds()).padStart(2,'0')}`,
        startDateObj: startLocal,
        endDateObj: endLocal,
        startTS: startLocal.getTime(),
        endTS: endLocal.getTime(),
        durationRequested: lesson.duration,
        durationUsed: duration,
        diffMinutes: (endLocal.getTime() - startLocal.getTime()) / 60000,
        tzOffsetMinutes: startLocal.getTimezoneOffset(),
        allDay: (event as any).allDay,
      });
    } catch {}
  }

  return event;
};
