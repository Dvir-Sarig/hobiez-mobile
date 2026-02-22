import { Lesson } from '../../lesson/types/Lesson';
import dayjs from 'dayjs';

export interface HourlyRegistration {
  hour: number;
  registrations: number;
  lessonCount: number;
  capacity: number;
}

export interface LessonTypeMetric {
  type: string;
  lessonCount: number;
  registrations: number;
  revenue: number;
  averagePrice: number;
  occupancyRate: number;
}

export interface WeeklyPerformance {
  week: number;
  lessons: number;
  registrations: number;
  revenue: number;
  dateRange: string;
}

export interface OccupancyData {
  averageOccupancy: number;
  minOccupancy: number;
  maxOccupancy: number;
  averageClassSize: number;
  mostFilledHour: number | null;
  leastFilledHour: number | null;
  mostFilledHourOccupancy: number;
  leastFilledHourOccupancy: number;
  comparedHoursCount: number;
}

export interface CoachAnalyticsData {
  totalLessons: number;
  registrationRate: number; // percentage (0-100)
  totalRevenue: number;
  registeredCount: number;
  hoursData: HourlyRegistration[];
  lessonTypeMetrics: LessonTypeMetric[];
  weeklyPerformance: WeeklyPerformance[];
  occupancyMetrics: OccupancyData;
}

export const calculateCoachAnalytics = (lessons: Lesson[], month: number, year: number): CoachAnalyticsData => {
  // Filter lessons by month
  const monthLessons = lessons.filter((lesson) => {
    const lessonDate = dayjs(lesson.time);
    return lessonDate.month() === month && lessonDate.year() === year;
  });

  // Total lessons
  const totalLessons = monthLessons.length;

  // Calculate registrations
  const totalCapacity = monthLessons.reduce((sum, lesson) => sum + lesson.capacityLimit, 0);
  const registeredCount = monthLessons.reduce((sum, lesson) => sum + (lesson.registeredCount || 0), 0);
  const registrationRate = totalCapacity > 0 ? (registeredCount / totalCapacity) * 100 : 0;

  // Calculate revenue
  const totalRevenue = monthLessons.reduce((sum, lesson) => {
    const registrations = lesson.registeredCount || 0;
    return sum + registrations * lesson.price;
  }, 0);

  // Calculate hourly data for hot hours
  const hoursMap = new Map<number, { registrations: number; lessonCount: number; capacity: number }>();
  
  monthLessons.forEach((lesson) => {
    const hour = dayjs(lesson.time).hour();
    const current = hoursMap.get(hour) || { registrations: 0, lessonCount: 0, capacity: 0 };
    hoursMap.set(hour, {
      registrations: current.registrations + (lesson.registeredCount || 0),
      lessonCount: current.lessonCount + 1,
      capacity: current.capacity + (lesson.capacityLimit || 0),
    });
  });

  // Convert to sorted array
  const hoursData: HourlyRegistration[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    registrations: hoursMap.get(i)?.registrations || 0,
    lessonCount: hoursMap.get(i)?.lessonCount || 0,
    capacity: hoursMap.get(i)?.capacity || 0,
  }));

  // Calculate lesson type metrics
  const typeMap = new Map<string, { count: number; registrations: number; revenue: number }>();
  monthLessons.forEach((lesson) => {
    const type = lesson.title;
    const current = typeMap.get(type) || { count: 0, registrations: 0, revenue: 0 };
    const registrations = lesson.registeredCount || 0;
    typeMap.set(type, {
      count: current.count + 1,
      registrations: current.registrations + registrations,
      revenue: current.revenue + registrations * lesson.price,
    });
  });

  const lessonTypeMetrics: LessonTypeMetric[] = Array.from(typeMap.entries())
    .map(([type, data]) => ({
      type,
      lessonCount: data.count,
      registrations: data.registrations,
      revenue: data.revenue,
      averagePrice: data.registrations > 0 ? Math.round(data.revenue / data.registrations) : 0,
      occupancyRate: 0, // will calculate below
    }))
    .map((metric) => {
      const lessonsOfType = monthLessons.filter((l) => l.title === metric.type);
      const totalCapacityForType = lessonsOfType.reduce((sum, l) => sum + l.capacityLimit, 0);
      const occupancy = totalCapacityForType > 0 ? (metric.registrations / totalCapacityForType) * 100 : 0;
      return { ...metric, occupancyRate: Math.round(occupancy) };
    })
    .sort((a, b) => b.revenue - a.revenue);

  // Calculate weekly performance
  const weekMap = new Map<number, { lessons: number; registrations: number; revenue: number; dates: dayjs.Dayjs[] }>();
  monthLessons.forEach((lesson) => {
    const lessonDate = dayjs(lesson.time);
    // Calculate week number based on date (week 1 = 1-7, week 2 = 8-14, etc.)
    const weekNumber = Math.ceil(lessonDate.date() / 7);
    const current = weekMap.get(weekNumber) || { lessons: 0, registrations: 0, revenue: 0, dates: [] };
    const registrations = lesson.registeredCount || 0;
    weekMap.set(weekNumber, {
      lessons: current.lessons + 1,
      registrations: current.registrations + registrations,
      revenue: current.revenue + registrations * lesson.price,
      dates: [...current.dates, lessonDate],
    });
  });

  const weeklyPerformance: WeeklyPerformance[] = Array.from(weekMap.entries())
    .map(([week, data]) => ({
      week,
      lessons: data.lessons,
      registrations: data.registrations,
      revenue: data.revenue,
      dateRange: `Week ${week}`,
    }))
    .sort((a, b) => a.week - b.week);

  // Calculate occupancy metrics
  const occupancyRates = monthLessons.map((lesson) => {
    const registered = lesson.registeredCount || 0;
    return (registered / lesson.capacityLimit) * 100;
  });

  const occupancyMetrics: OccupancyData = {
    averageOccupancy: occupancyRates.length > 0 ? Math.round(occupancyRates.reduce((a, b) => a + b, 0) / occupancyRates.length) : 0,
    minOccupancy: occupancyRates.length > 0 ? Math.round(Math.min(...occupancyRates)) : 0,
    maxOccupancy: occupancyRates.length > 0 ? Math.round(Math.max(...occupancyRates)) : 100,
    averageClassSize: totalLessons > 0 ? Math.round(registeredCount / totalLessons) : 0,
    ...getHourOccupancyInsights(hoursData),
  };

  return {
    totalLessons,
    registrationRate: Math.round(registrationRate),
    totalRevenue,
    registeredCount,
    hoursData,
    lessonTypeMetrics,
    weeklyPerformance,
    occupancyMetrics,
  };
};

export const getTopHours = (hoursData: HourlyRegistration[], limit: number = 3): HourlyRegistration[] => {
  return [...hoursData]
    .filter((h) => h.registrations > 0)
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, limit);
};

export const formatHour = (hour: number): string => {
  return `${String(hour).padStart(2, '0')}:00`;
};

const getHourOccupancyInsights = (hoursData: HourlyRegistration[]) => {
  const nonEmptyHours = hoursData
    .filter((h) => h.lessonCount > 0 && h.capacity > 0)
    .map((h) => ({
      hour: h.hour,
      occupancy: Math.round(Math.min((h.registrations / h.capacity) * 100, 100)),
    }))
    .sort((a, b) => a.hour - b.hour);

  if (nonEmptyHours.length === 0) {
    return {
      mostFilledHour: null,
      leastFilledHour: null,
      mostFilledHourOccupancy: 0,
      leastFilledHourOccupancy: 0,
      comparedHoursCount: 0,
    };
  }

  const sortedByOccupancy = [...nonEmptyHours].sort((a, b) => b.occupancy - a.occupancy);
  const mostFilled = sortedByOccupancy[0];

  let leastFilled = sortedByOccupancy[sortedByOccupancy.length - 1];
  if (sortedByOccupancy.length > 1 && leastFilled.hour === mostFilled.hour) {
    leastFilled = sortedByOccupancy[1];
  }

  return {
    mostFilledHour: mostFilled.hour,
    leastFilledHour: sortedByOccupancy.length > 1 ? leastFilled.hour : null,
    mostFilledHourOccupancy: mostFilled.occupancy,
    leastFilledHourOccupancy: sortedByOccupancy.length > 1 ? leastFilled.occupancy : 0,
    comparedHoursCount: nonEmptyHours.length,
  };
};
