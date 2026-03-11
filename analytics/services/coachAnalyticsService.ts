import { Lesson } from '../../lesson/types/Lesson';
import { RegistrationWithPayment, PaymentMethod } from '../../lesson/types/Registration';
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

export interface PaymentEntry {
  clientId: string;
  clientName: string;
  lessonTitle: string;
  lessonTime: string;
  amount: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  revenue: number;
  percentage: number;
  entries: PaymentEntry[];
}

export interface PaymentAnalytics {
  confirmedRevenue: number;
  pendingRevenue: number;
  paymentConfirmedCount: number;
  paymentPendingCount: number;
  paymentRejectedCount: number;
  paymentNotSetCount: number;
  collectionRate: number;
  revenueByMethod: PaymentMethodBreakdown[];
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
  paymentAnalytics: PaymentAnalytics | null;
}

export const calculateCoachAnalytics = (
  lessons: Lesson[],
  month: number,
  year: number,
  registrationsMap?: Record<number, RegistrationWithPayment[]>
): CoachAnalyticsData => {
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

  // Calculate estimated revenue (overridden by confirmed payments when registration data is available)
  let totalRevenue = monthLessons.reduce((sum, lesson) => {
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

  // Calculate payment analytics when registration data is available
  let paymentAnalytics: PaymentAnalytics | null = null;
  if (registrationsMap) {
    const allRegs = monthLessons.flatMap(
      l => (registrationsMap[l.id] ?? []).filter(r => r.registrationStatus === 'ACTIVE')
    );
    const lessonById: Record<number, Lesson> = Object.fromEntries(monthLessons.map(l => [l.id, l]));
    const lessonPriceById: Record<number, number> = Object.fromEntries(
      monthLessons.map(l => [l.id, l.price])
    );
    const confirmed = allRegs.filter(r => r.paymentStatus === 'CONFIRMED');
    const pending = allRegs.filter(r => r.paymentStatus === 'PENDING');
    const rejected = allRegs.filter(r => r.paymentStatus === 'REJECTED');
    const notSet = allRegs.filter(r => r.paymentStatus === 'NOT_SET');

    const confirmedRevenue = confirmed.reduce((sum, r) => sum + (lessonPriceById[r.lessonId] ?? 0), 0);
    const pendingRevenue = pending.reduce((sum, r) => sum + (lessonPriceById[r.lessonId] ?? 0), 0);
    const collectionRate = allRegs.length > 0
      ? Math.round((confirmed.length / allRegs.length) * 100) : 0;

    const methodAccum = new Map<PaymentMethod, { count: number; revenue: number; entries: PaymentEntry[] }>();
    confirmed.forEach(r => {
      if (r.paymentMethod) {
        const cur = methodAccum.get(r.paymentMethod) ?? { count: 0, revenue: 0, entries: [] };
        const lesson = lessonById[r.lessonId];
        methodAccum.set(r.paymentMethod, {
          count: cur.count + 1,
          revenue: cur.revenue + (lessonPriceById[r.lessonId] ?? 0),
          entries: [...cur.entries, {
            clientId: r.clientId,
            clientName: '',
            lessonTitle: lesson?.title ?? `Lesson #${r.lessonId}`,
            lessonTime: lesson?.time ?? '',
            amount: lessonPriceById[r.lessonId] ?? 0,
          }],
        });
      }
    });

    const revenueByMethod: PaymentMethodBreakdown[] = Array.from(methodAccum.entries())
      .map(([method, data]) => ({
        method,
        count: data.count,
        revenue: data.revenue,
        percentage: confirmedRevenue > 0 ? Math.round((data.revenue / confirmedRevenue) * 100) : 0,
        entries: data.entries,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    paymentAnalytics = {
      confirmedRevenue,
      pendingRevenue,
      paymentConfirmedCount: confirmed.length,
      paymentPendingCount: pending.length,
      paymentRejectedCount: rejected.length,
      paymentNotSetCount: notSet.length,
      collectionRate,
      revenueByMethod,
    };
    // Use actual confirmed payments as the authoritative revenue figure
    totalRevenue = confirmedRevenue;
  }

  return {
    totalLessons,
    registrationRate: Math.round(registrationRate),
    totalRevenue,
    registeredCount,
    hoursData,
    lessonTypeMetrics,
    weeklyPerformance,
    occupancyMetrics,
    paymentAnalytics,
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
