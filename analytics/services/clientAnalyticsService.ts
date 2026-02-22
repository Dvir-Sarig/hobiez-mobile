import { Lesson } from '../../lesson/types/Lesson';
import dayjs from 'dayjs';

export interface HourlyLesson {
  hour: number;
  lessonCount: number;
}

export interface LessonTypeBreakdown {
  type: string;
  count: number;
  percentage: number;
}

export interface CoachLesson {
  coachId: string;
  coachName?: string;
  lessonCount: number;
  percentage: number;
}

export interface CoachDetailedLessons {
  coachId: string;
  totalLessons: number;
  lessonsByType: LessonTypeBreakdown[];
}

export interface ClientAnalyticsData {
  totalLessons: number;
  lessonsByType: LessonTypeBreakdown[];
  hoursData: HourlyLesson[];
  mostPopularType: string | null;
  mostActiveCoach: CoachLesson | null;
  topCoaches: CoachLesson[];
  coachDetails: CoachDetailedLessons[];
}

export const calculateClientAnalytics = (lessons: Lesson[], month: number, year: number): ClientAnalyticsData => {
  // Filter lessons by month
  const monthLessons = lessons.filter((lesson) => {
    const lessonDate = dayjs(lesson.time);
    return lessonDate.month() === month && lessonDate.year() === year;
  });

  const totalLessons = monthLessons.length;

  // Calculate lessons by type
  const typeMap = new Map<string, number>();
  monthLessons.forEach((lesson) => {
    const type = lesson.title;
    typeMap.set(type, (typeMap.get(type) || 0) + 1);
  });

  const lessonsByType: LessonTypeBreakdown[] = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Get most popular lesson type
  const mostPopularType = lessonsByType.length > 0 ? lessonsByType[0].type : null;

  // Calculate hourly data
  const hoursMap = new Map<number, number>();
  monthLessons.forEach((lesson) => {
    const hour = dayjs(lesson.time).hour();
    hoursMap.set(hour, (hoursMap.get(hour) || 0) + 1);
  });

  const hoursData: HourlyLesson[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    lessonCount: hoursMap.get(i) || 0,
  }));

  // Calculate lessons by coach
  const coachMap = new Map<string, number>();
  monthLessons.forEach((lesson) => {
    coachMap.set(lesson.coachId, (coachMap.get(lesson.coachId) || 0) + 1);
  });

  const topCoaches: CoachLesson[] = Array.from(coachMap.entries())
    .map(([coachId, count]) => ({
      coachId,
      lessonCount: count,
      percentage: totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0,
    }))
    .sort((a, b) => b.lessonCount - a.lessonCount)
    .slice(0, 3);

  const mostActiveCoach = topCoaches.length > 0 ? topCoaches[0] : null;

  // Calculate detailed coach lessons with type breakdown
  const coachDetails = getCoachLessonDetails(monthLessons);

  return {
    totalLessons,
    lessonsByType,
    hoursData,
    mostPopularType,
    mostActiveCoach,
    topCoaches,
    coachDetails,
  };
};

export const getTopHoursForClient = (hoursData: HourlyLesson[], limit: number = 3): HourlyLesson[] => {
  return [...hoursData]
    .filter((h) => h.lessonCount > 0)
    .sort((a, b) => b.lessonCount - a.lessonCount)
    .slice(0, limit);
};

export const getCoachLessonDetails = (lessons: Lesson[]): CoachDetailedLessons[] => {
  const coachMap = new Map<string, Map<string, number>>();

  // Group lessons by coach and then by type
  lessons.forEach((lesson) => {
    if (!coachMap.has(lesson.coachId)) {
      coachMap.set(lesson.coachId, new Map<string, number>());
    }
    const typeMap = coachMap.get(lesson.coachId)!;
    typeMap.set(lesson.title, (typeMap.get(lesson.title) || 0) + 1);
  });

  // Convert to array and calculate percentages for each coach's lessons
  const coachDetails: CoachDetailedLessons[] = Array.from(coachMap.entries())
    .map(([coachId, typeMap]) => {
      const totalLessons = Array.from(typeMap.values()).reduce((sum, count) => sum + count, 0);
      const lessonsByType: LessonTypeBreakdown[] = Array.from(typeMap.entries())
        .map(([type, count]) => ({
          type,
          count,
          percentage: totalLessons > 0 ? Math.round((count / totalLessons) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        coachId,
        totalLessons,
        lessonsByType,
      };
    })
    .sort((a, b) => b.totalLessons - a.totalLessons);

  return coachDetails;
};

export const formatHour = (hour: number): string => {
  return `${String(hour).padStart(2, '0')}:00`;
};
