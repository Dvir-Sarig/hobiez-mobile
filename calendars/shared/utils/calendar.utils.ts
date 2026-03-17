import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { Lesson } from '../../../lesson/types/Lesson';
import { CalendarEvent } from '../types/calendar.types';

// Set Hebrew locale globally for dayjs
dayjs.locale('he');

const CAL_DEBUG = true;

/** Hebrew day names (Sunday=0 … Saturday=6) */
const HE_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as const;
const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'] as const;

/** Get full Hebrew day name for a dayjs date */
export const hebrewDayName = (d: dayjs.Dayjs): string => HE_DAYS_FULL[d.day()];

/** Format a date as "D בחודש YYYY" in Hebrew */
export const hebrewDateLabel = (d: dayjs.Dayjs): string =>
  `${d.date()} ${HE_MONTHS[d.month()]} ${d.year()}`;

/** Build a Hebrew week-range string for header (e.g. "12 מרץ – 18 מרץ 2026") */
export const hebrewWeekRange = (anchor: dayjs.Dayjs): string => {
  const start = anchor.startOf('week'); // Sunday (weekStartsOn=0 with he locale)
  const end = start.add(6, 'day');      // Saturday
  if (start.month() === end.month()) {
    return `${start.date()} – ${end.date()} ${HE_MONTHS[start.month()]} ${start.year()}`;
  }
  return `${start.date()} ${HE_MONTHS[start.month()]} – ${end.date()} ${HE_MONTHS[end.month()]} ${end.year()}`;
};

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
