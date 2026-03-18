import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getLessonTypeDisplayName } from '../lesson/types/LessonType';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';
import { Lesson } from '../lesson/types/Lesson';
import { fetchCoachLessons } from '../lesson/services/lessonService';
import { fetchLessonRegistrations } from '../lesson/services/registrationService';
import { fetchClientGlobalInfo } from '../profile/services/clientService';
import {
  calculateCoachAnalytics,
  getTopHours,
  formatHour,
  CoachAnalyticsData,
  HourlyRegistration,
  PaymentAnalytics,
  PaymentMethodBreakdown,
  PaymentEntry,
} from './services/coachAnalyticsService';

// Mock data for testing (remove after confirming backend works)
const mockLessons: Lesson[] = [
  {
    id: 1,
    title: 'Tennis Basics',
    description: 'Learn tennis fundamentals',
    time: dayjs().date(5).hour(9).minute(0).toISOString(),
    coachId: '123',
    price: 50,
    capacityLimit: 5,
    duration: 60,
    location: { city: 'NYC', country: 'USA' },
    registeredCount: 4,
  },
  {
    id: 2,
    title: 'Tennis Intermediate',
    description: 'Improve your technique',
    time: dayjs().date(7).hour(14).minute(0).toISOString(),
    coachId: '123',
    price: 60,
    capacityLimit: 6,
    duration: 60,
    location: { city: 'NYC', country: 'USA' },
    registeredCount: 5,
  },
  {
    id: 3,
    title: 'Tennis Advanced',
    description: 'Advanced strategies',
    time: dayjs().date(12).hour(16).minute(0).toISOString(),
    coachId: '123',
    price: 75,
    capacityLimit: 4,
    duration: 90,
    location: { city: 'NYC', country: 'USA' },
    registeredCount: 3,
  },
  {
    id: 4,
    title: 'Morning Lesson',
    description: 'Early start lesson',
    time: dayjs().date(15).hour(7).minute(0).toISOString(),
    coachId: '123',
    price: 55,
    capacityLimit: 5,
    duration: 60,
    location: { city: 'NYC', country: 'USA' },
    registeredCount: 2,
  },
  {
    id: 5,
    title: 'Evening Lesson',
    description: 'After work lesson',
    time: dayjs().date(20).hour(18).minute(0).toISOString(),
    coachId: '123',
    price: 65,
    capacityLimit: 5,
    duration: 60,
    location: { city: 'NYC', country: 'USA' },
    registeredCount: 5,
  },
];

// Set to true to use mock data for testing (set to false for production)
const USE_MOCK_DATA = false;

const formatShekel = (amount: number, fractionDigits: number = 0): string => {
  return `₪${amount.toLocaleString('he-IL', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
};

export default function CoachAnalyticsDashboard() {
  const { userId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [analyticsData, setAnalyticsData] = useState<CoachAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodBreakdown | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const isRefreshRef = useRef(false);

  const onRefresh = useCallback(() => {
    isRefreshRef.current = true;
    setRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isRefreshRef.current) setLoading(true);
      isRefreshRef.current = false;
      try {
        if (!userId) {
          console.error('No user ID available');
          setLoading(false);
          return;
        }
        
        // Fetch real coach lessons data
        const lessons = await fetchCoachLessons(userId);

        // Fetch registrations for each lesson in the selected month (payment analytics)
        const monthLessons = lessons.filter(l => {
          const d = dayjs(l.time);
          return d.month() === currentMonth.month() && d.year() === currentMonth.year();
        });
        const registrationsMap: Record<number, Awaited<ReturnType<typeof fetchLessonRegistrations>>> = {};
        await Promise.all(
          monthLessons.map(async l => {
            try {
              registrationsMap[l.id] = await fetchLessonRegistrations(l.id);
            } catch {
              registrationsMap[l.id] = [];
            }
          })
        );

        // Calculate analytics for the selected month
        const data = calculateCoachAnalytics(lessons, currentMonth.month(), currentMonth.year(), registrationsMap);

        // Fetch client names for payment entries
        const allEntries = data.paymentAnalytics?.revenueByMethod.flatMap(m => m.entries) ?? [];
        const uniqueClientIds = Array.from(new Set(allEntries.map(e => e.clientId)));
        const clientNameMap: Record<string, string> = {};
        await Promise.all(
          uniqueClientIds.map(async (clientId) => {
            try {
              const info = await fetchClientGlobalInfo(clientId);
              clientNameMap[clientId] = info.name;
            } catch {
              clientNameMap[clientId] = `לקוח ${clientId}`;
            }
          })
        );
        data.paymentAnalytics?.revenueByMethod.forEach(m =>
          m.entries.forEach(e => { e.clientName = clientNameMap[e.clientId] ?? `לקוח ${e.clientId}`; })
        );

        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchAnalytics();
  }, [currentMonth, userId, refreshTrigger]);

  const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

  const topHours = analyticsData ? getTopHours(analyticsData.hoursData, 3) : [];

  const MetricCard = ({
    icon,
    label,
    value,
    subtext,
    bgGradient,
    iconColor,
  }: {
    icon: string;
    label: string;
    value: string;
    subtext?: string;
    bgGradient: [string, string];
    iconColor: string;
  }) => (
    <LinearGradient colors={bgGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.metricCard}>
      <View style={styles.metricCardContent}>
        <View style={[styles.metricIconBox, { backgroundColor: `${iconColor}22` }]}>
          <MaterialIcons name={icon as any} size={28} color={iconColor} />
        </View>
        <View style={styles.metricTextBox}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{value}</Text>
          {subtext && <Text style={styles.metricSubtext}>{subtext}</Text>}
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <LinearGradient
      colors={['#0d47a1', '#1565c0', '#1e88e5']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerIconBadge}>
              <MaterialIcons name="analytics" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>אנליטיקות</Text>
          </View>
          <Text style={styles.headerSubtitle}>ביצועי האימון שלך במבט אחד</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity
            onPress={handleNextMonth}
            disabled={currentMonth.isAfter(dayjs())}
            style={[styles.monthNavBtn, currentMonth.isAfter(dayjs()) && styles.monthNavBtnDisabled]}
          >
            <MaterialIcons name="chevron-right" size={24} color={currentMonth.isAfter(dayjs()) ? '#ffffff66' : '#fff'} />
          </TouchableOpacity>
          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
          </View>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
            <MaterialIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : analyticsData ? (
          <>
            {/* Key Metrics Grid */}
            <View style={styles.metricsGrid}>
              <MetricCard
                icon="calendar-today"
                label="סה״כ שיעורים"
                value={analyticsData.totalLessons.toString()}
                bgGradient={['#1565c0', '#1e88e5']}
                iconColor="#42a5f5"
              />
              <MetricCard
                icon="people"
                label="שיעור רישום"
                value={`${analyticsData.registrationRate}%`}
                subtext={`${analyticsData.registeredCount} רישומים`}
                bgGradient={['#0d47a1', '#1565c0']}
                iconColor="#64b5f6"
              />
              <MetricCard
                icon="attach-money"
                label="הכנסה מאושרת"
                value={formatShekel(analyticsData.totalRevenue)}
                subtext={
                  analyticsData.paymentAnalytics
                    ? `${analyticsData.paymentAnalytics.paymentConfirmedCount} תשלומ${analyticsData.paymentAnalytics.paymentConfirmedCount !== 1 ? 'ים' : ''} מאושרים`
                    : `${analyticsData.registeredCount} רישומים (הערכה)`
                }
                bgGradient={['#1565c0', '#42a5f5']}
                iconColor="#4fc3f7"
              />
              <MetricCard
                icon="schedule"
                label="הכי פופולרי"
                value={topHours.length > 0 ? formatHour(topHours[0].hour) : 'אין'}
                subtext={topHours.length > 0 ? `${topHours[0].registrations} רישומים` : 'אין נתונים'}
                bgGradient={['#0d47a1', '#42a5f5']}
                iconColor="#81d4fa"
              />
            </View>

            {/* Payment Insights */}
            {analyticsData.paymentAnalytics && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="account-balance-wallet" size={20} color="#1e88e5" />
                  <Text style={styles.sectionTitle}>תובנות תשלום</Text>
                </View>
                <Text style={styles.sectionSubtitle}>הכנסה מתשלומים מאושרים ופילוח לפי אמצעי תשלום</Text>

                {/* Confirmed Revenue + Collection Rate */}
                <View style={styles.metricsRow}>
                  <View style={[styles.metricBox, styles.confirmedBox]}>
                    <Text style={styles.metricBoxLabel}>הכנסה מאושרת</Text>
                    <Text style={[styles.metricBoxValue, { color: '#15803d' }]}>
                      {formatShekel(analyticsData.paymentAnalytics.confirmedRevenue)}
                    </Text>
                    <Text style={styles.metricBoxSubtext}>
                      {analyticsData.paymentAnalytics.paymentConfirmedCount} תשלומ{analyticsData.paymentAnalytics.paymentConfirmedCount !== 1 ? 'ים' : ''}
                    </Text>
                  </View>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricBoxLabel}>אחוז הכנסה מאושרת מנרשמים</Text>
                    <Text style={[styles.metricBoxValue, {
                      color: analyticsData.paymentAnalytics.collectionRate >= 80 ? '#15803d'
                        : analyticsData.paymentAnalytics.collectionRate >= 50 ? '#b45309' : '#dc2626',
                    }]}>
                      {analyticsData.paymentAnalytics.collectionRate}%
                    </Text>
                    <View style={styles.occupancyBar}>
                      <View style={[styles.occupancyFill, {
                        width: `${analyticsData.paymentAnalytics.collectionRate}%`,
                        backgroundColor: analyticsData.paymentAnalytics.collectionRate >= 80 ? '#16a34a' : '#ffa726',
                      }]} />
                    </View>
                  </View>
                </View>

                {/* Pending Revenue Banner */}
                {analyticsData.paymentAnalytics.pendingRevenue > 0 && (
                  <View style={styles.pendingBanner}>
                    <MaterialIcons name="hourglass-top" size={16} color="#b45309" />
                    <View style={styles.pendingBannerBody}>
                      <Text style={styles.pendingBannerTitle}>
                        {formatShekel(analyticsData.paymentAnalytics.pendingRevenue)} בהמתנה
                      </Text>
                      <Text style={styles.pendingBannerSub}>
                        {analyticsData.paymentAnalytics.paymentPendingCount} תשלומ{analyticsData.paymentAnalytics.paymentPendingCount !== 1 ? 'ים' : ''} ממתינים לאישורך
                      </Text>
                    </View>
                  </View>
                )}

                {/* Payment Status Chips */}
                <View style={styles.statusDistribution}>
                  {([
                    { label: 'מאושר', count: analyticsData.paymentAnalytics.paymentConfirmedCount, color: '#16a34a' },
                    { label: 'בהמתנה', count: analyticsData.paymentAnalytics.paymentPendingCount, color: '#d97706' },
                    { label: 'לא מוגדר', count: analyticsData.paymentAnalytics.paymentNotSetCount, color: '#94a3b8' },
                    { label: 'נדחה', count: analyticsData.paymentAnalytics.paymentRejectedCount, color: '#dc2626' },
                  ] as const).filter(s => s.count > 0).map(status => (
                    <View key={status.label} style={styles.statusItem}>
                      <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                      <Text style={styles.statusCount}>{status.count}</Text>
                      <Text style={styles.statusLabel}>{status.label}</Text>
                    </View>
                  ))}
                </View>

                {/* Revenue by Method — tappable rows */}
                {analyticsData.paymentAnalytics.revenueByMethod.length > 0 && (
                  <>
                    <Text style={styles.methodsTitle}>הכנסה לפי אמצעי תשלום</Text>
                    <View style={styles.methodList}>
                      {analyticsData.paymentAnalytics.revenueByMethod.map(item => (
                        <TouchableOpacity
                          key={item.method}
                          style={styles.methodRow}
                          onPress={() => setSelectedMethod(item)}
                          activeOpacity={0.75}
                        >
                          <View style={[styles.methodIconBubble, { backgroundColor: getMethodColor(item.method) + '22' }]}>
                            {item.method === 'BIT' ? (
                              <Image source={require('../assets/bit-logo.png')} style={styles.methodLogoImg} />
                            ) : item.method === 'PAYBOX' ? (
                              <Image source={require('../assets/paybox-logo.png')} style={styles.methodLogoImg} />
                            ) : (
                              <MaterialIcons
                                name={item.method === 'CASH' ? 'account-balance-wallet' : 'swap-horiz'}
                                size={18}
                                color={getMethodColor(item.method)}
                              />
                            )}
                          </View>
                          <View style={styles.methodInfo}>
                            <Text style={styles.methodName}>{METHOD_LABELS[item.method] ?? item.method}</Text>
                            <Text style={styles.methodCount}>{item.count} תשלומ{item.count !== 1 ? 'ים' : ''}</Text>
                          </View>
                          <View style={styles.methodAmounts}>
                            <Text style={styles.methodRevenue}>{formatShekel(item.revenue)}</Text>
                            <Text style={styles.methodPct}>{item.percentage}%</Text>
                          </View>
                          <MaterialIcons name="chevron-left" size={18} color="#94a3b8" style={{ marginStart: 4 }} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </View>
            )}

            {/* Revenue Breakdown */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="pie-chart" size={20} color="#4fc3f7" />
                <Text style={styles.sectionTitle}>פירוט הכנסה</Text>
              </View>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <View style={styles.breakdownDot} />
                    <Text style={styles.breakdownText}>סה״כ רישומים</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{analyticsData.registeredCount}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                {/* When payment data is available show potential vs confirmed; otherwise show estimate */}
                {analyticsData.paymentAnalytics ? (
                  <>
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: '#94a3b8' }]} />
                        <View>
                          <Text style={styles.breakdownText}>סה״כ כסף מרישומים</Text>
                          <Text style={styles.breakdownNote}>פוטנציאל אם כולם משלמים</Text>
                        </View>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {formatShekel(analyticsData.registeredCount * (
                          analyticsData.registeredCount > 0
                            ? (analyticsData.paymentAnalytics.confirmedRevenue + analyticsData.paymentAnalytics.pendingRevenue) /
                              Math.max(analyticsData.paymentAnalytics.paymentConfirmedCount + analyticsData.paymentAnalytics.paymentPendingCount, 1)
                            : 0
                        ))}
                      </Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: '#42a5f5' }]} />
                        <View>
                          <Text style={styles.breakdownText}>הכנסה מאושרת</Text>
                          <Text style={styles.breakdownNote}>תשלומים מאושרים בלבד</Text>
                        </View>
                      </View>
                      <Text style={[styles.breakdownValue, styles.revenueHighlight]}>
                        {formatShekel(analyticsData.paymentAnalytics.confirmedRevenue)}
                      </Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: '#81d4fa' }]} />
                        <View>
                          <Text style={styles.breakdownText}>ממוצע לתשלום מאושר</Text>
                          <Text style={styles.breakdownNote}>
                            {analyticsData.paymentAnalytics.paymentConfirmedCount} תשלומ{analyticsData.paymentAnalytics.paymentConfirmedCount !== 1 ? 'ים' : ''} מאושרים
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {formatShekel(
                          analyticsData.paymentAnalytics.paymentConfirmedCount > 0
                            ? analyticsData.paymentAnalytics.confirmedRevenue / analyticsData.paymentAnalytics.paymentConfirmedCount
                            : 0,
                          2,
                        )}
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: '#42a5f5' }]} />
                        <Text style={styles.breakdownText}>סה״כ הכנסה (הערכה)</Text>
                      </View>
                      <Text style={[styles.breakdownValue, styles.revenueHighlight]}>
                        {formatShekel(analyticsData.totalRevenue)}
                      </Text>
                    </View>
                    <View style={styles.breakdownDivider} />
                    <View style={styles.breakdownRow}>
                      <View style={styles.breakdownLabel}>
                        <View style={[styles.breakdownDot, { backgroundColor: '#81d4fa' }]} />
                        <Text style={styles.breakdownText}>ממוצע לרישום</Text>
                      </View>
                      <Text style={styles.breakdownValue}>
                        {formatShekel(
                          analyticsData.registeredCount > 0 ? analyticsData.totalRevenue / analyticsData.registeredCount : 0,
                          2,
                        )}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Occupancy Metrics Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="trending-up" size={20} color="#66bb6a" />
                <Text style={styles.sectionTitle}>תובנות תפוסה</Text>
              </View>
              <Text style={styles.sectionSubtitle}>עד כמה השיעורים שלך מלאים (רישומים לעומת תפוסה כוללת)</Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>תפוסה ממוצעת</Text>
                  <Text style={styles.metricBoxValue}>{analyticsData.occupancyMetrics.averageOccupancy}%</Text>
                  <View style={styles.occupancyBar}>
                    <View
                      style={[
                        styles.occupancyFill,
                        {
                          width: `${analyticsData.occupancyMetrics.averageOccupancy}%`,
                          backgroundColor: analyticsData.occupancyMetrics.averageOccupancy > 80 ? '#66bb6a' : '#ffa726',
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>גודל שיעור ממוצע</Text>
                  <Text style={styles.metricBoxValue}>{analyticsData.occupancyMetrics.averageClassSize}</Text>
                  <Text style={styles.metricBoxSubtext}>תלמידים לשיעור</Text>
                </View>
              </View>

              <View style={styles.occupancyDetails}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="arrow-upward" size={16} color="#66bb6a" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>שעת תפוסה גבוהה ביותר</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {analyticsData.occupancyMetrics.mostFilledHour !== null
                        ? `${formatHour(analyticsData.occupancyMetrics.mostFilledHour)} • ${analyticsData.occupancyMetrics.mostFilledHourOccupancy}%`
                        : 'אין'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="arrow-downward" size={16} color="#ff7043" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>שעת תפוסה נמוכה ביותר</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {analyticsData.occupancyMetrics.leastFilledHour !== null
                        ? `${formatHour(analyticsData.occupancyMetrics.leastFilledHour)} • ${analyticsData.occupancyMetrics.leastFilledHourOccupancy}%`
                        : 'נדרשות 2+ שעות שונות'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Lesson Type Performance */}
            {analyticsData.lessonTypeMetrics.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="school" size={20} color="#1e88e5" />
                  <Text style={styles.sectionTitle}>ביצועי שיעורים</Text>
                </View>
                <Text style={styles.sectionSubtitle}>הכנסה וביקוש לפי סוג שיעור</Text>

                <View style={styles.typeList}>
                  {analyticsData.lessonTypeMetrics.map((metric, index) => (
                    <View key={metric.type} style={styles.typeItemCard}>
                      <View style={styles.typeItemHeader}>
                        <Text style={styles.typeItemName}>{getLessonTypeDisplayName(metric.type)}</Text>
                        <View style={[styles.typeItemBadge, { backgroundColor: getTypeColor(index) }]}>
                          <Text style={styles.typeItemRevenue}>{formatShekel(metric.revenue)}</Text>
                        </View>
                      </View>

                      <View style={styles.typeItemStats}>
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>רישומים</Text>
                          <Text style={styles.typeStatValue}>{metric.registrations}</Text>
                        </View>
                        <View style={styles.typeStatDivider} />
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>שיעורים</Text>
                          <Text style={styles.typeStatValue}>{metric.lessonCount}</Text>
                        </View>
                        <View style={styles.typeStatDivider} />
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>תפוסה</Text>
                          <Text style={styles.typeStatValue}>{metric.occupancyRate}%</Text>
                        </View>
                      </View>

                      <View style={styles.occupancyBar}>
                        <View
                          style={[
                            styles.occupancyFill,
                            {
                              width: `${metric.occupancyRate}%`,
                              backgroundColor: metric.occupancyRate > 80 ? '#66bb6a' : '#ffa726',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Weekly Performance */}
            {analyticsData.weeklyPerformance.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialIcons name="calendar-today" size={20} color="#ec407a" />
                  <Text style={styles.sectionTitle}>מגמה שבועית</Text>
                </View>
                <Text style={styles.sectionSubtitle}>ביצועים לאורך השבועות</Text>

                <View style={styles.weeklyList}>
                  {analyticsData.weeklyPerformance.map((week) => (
                    <View key={week.week} style={styles.weeklyCard}>
                      <View style={styles.weeklyHeader}>
                        <Text style={styles.weeklyLabel}>{week.dateRange}</Text>
                        <View style={styles.weeklyRevenueBadge}>
                          <Text style={styles.weeklyRevenueText}>{formatShekel(week.revenue)}</Text>
                        </View>
                      </View>

                      <View style={styles.weeklyStats}>
                        <View style={styles.weeklyStat}>
                          <MaterialIcons name="calendar-month" size={14} color="#1e88e5" />
                          <Text style={styles.weeklyStatText}>{week.lessons} שיעורים</Text>
                        </View>
                        <View style={styles.weeklyStatDivider} />
                        <View style={styles.weeklyStat}>
                          <MaterialIcons name="people" size={14} color="#42a5f5" />
                          <Text style={styles.weeklyStatText}>{week.registrations} רישומים</Text>
                        </View>
                      </View>

                      <View style={styles.weeklyBar}>
                        <View
                          style={[
                            styles.weeklyBarFill,
                            {
                              width: `${Math.min((week.revenue / Math.max(...analyticsData.weeklyPerformance.map((w) => w.revenue), 1)) * 100, 100)}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Hot Hours — moved to bottom */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="fire" size={20} color="#ff6b6b" />
                <Text style={styles.sectionTitle}>שעות חמות</Text>
              </View>
              <Text style={styles.sectionSubtitle}>זמני השיעורים הפופולריים ביותר שלך</Text>

              {topHours.length > 0 ? (
                <View style={styles.hoursContainer}>
                  {topHours.map((hour: HourlyRegistration, index: number) => (
                    <View key={hour.hour} style={styles.hourCard}>
                      <View style={styles.hourHeader}>
                        <Text style={styles.hourLabel}>{formatHour(hour.hour)}</Text>
                        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                      </View>
                      <View style={styles.hourStats}>
                        <View style={styles.hourStat}>
                          <MaterialCommunityIcons name="account-multiple" size={16} color="#64b5f6" />
                          <Text style={styles.hourStatText}>{hour.registrations} רישומים</Text>
                        </View>
                        <View style={styles.hourStat}>
                          <MaterialCommunityIcons name="calendar-month" size={16} color="#81d4fa" />
                          <Text style={styles.hourStatText}>{hour.lessonCount} {hour.lessonCount !== 1 ? 'שיעורים' : 'שיעור'}</Text>
                        </View>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min((hour.registrations / (topHours[0]?.registrations || 1)) * 100, 100)}%`,
                              backgroundColor: getRankColor(index),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyHoursPlaceholder}>
                  <MaterialCommunityIcons name="clock-outline" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyHoursText}>עדיין אין שיעורים מתוכננים</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="info" size={48} color="#ffffff88" />
            <Text style={styles.emptyStateText}>אין שיעורים מתוכננים לחודש זה</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Payment Method Client List Modal */}
      <Modal
        visible={!!selectedMethod}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMethod(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalMethodBubble, { backgroundColor: getMethodColor(selectedMethod?.method ?? '') + '22' }]}>
                  {selectedMethod?.method === 'BIT' ? (
                    <Image source={require('../assets/bit-logo.png')} style={styles.methodLogoImg} />
                  ) : selectedMethod?.method === 'PAYBOX' ? (
                    <Image source={require('../assets/paybox-logo.png')} style={styles.methodLogoImg} />
                  ) : (
                    <MaterialIcons
                      name={selectedMethod?.method === 'CASH' ? 'account-balance-wallet' : 'swap-horiz'}
                      size={20}
                      color={getMethodColor(selectedMethod?.method ?? '')}
                    />
                  )}
                </View>
                <View>
                  <Text style={styles.modalTitle}>
                    {METHOD_LABELS[selectedMethod?.method ?? ''] ?? selectedMethod?.method}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedMethod?.count} תשלומ{selectedMethod?.count !== 1 ? 'ים' : ''} · {formatShekel(selectedMethod?.revenue ?? 0)}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedMethod(null)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <FlatList
              data={selectedMethod?.entries ?? []}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={styles.modalList}
              renderItem={({ item, index }) => (
                <View style={styles.modalEntry}>
                  <View style={styles.modalEntryLeft}>
                    <View style={styles.modalEntryAvatar}>
                      <Text style={styles.modalEntryAvatarText}>{index + 1}</Text>
                    </View>
                    <View style={styles.modalEntryBody}>
                      <Text style={styles.modalEntryClientName} numberOfLines={1}>{item.clientName}</Text>
                      <View style={styles.modalEntryRow}>
                        <Text style={styles.modalEntryLesson} numberOfLines={1}>{item.lessonTitle}</Text>
                        <Text style={styles.modalEntryDate}>
                          {item.lessonTime ? dayjs(item.lessonTime).format('ddd, MMM D · HH:mm') : '—'}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.modalEntryAmount}>{formatShekel(item.amount)}</Text>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalEntrySep} />}
            />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const getRankColor = (index: number): string => {
  const colors = ['#ff6b6b', '#ffa94d', '#ffd93d'];
  return colors[index] || '#90caf9';
};

const getTypeColor = (index: number): string => {
  const colors = ['#42a5f5', '#66bb6a', '#ffa726', '#ec407a', '#ab47bc', '#78909c'];
  return colors[index % colors.length];
};

const METHOD_LABELS: Record<string, string> = {
  BIT: 'ביט',
  PAYBOX: 'פייבוקס',
  CASH: 'מזומן',
  OTHER: 'אחר',
};

const getMethodColor = (method: string): string => {
  const colors: Record<string, string> = {
    BIT: '#0b2f35',
    PAYBOX: '#0891b2',
    CASH: '#16a34a',
    OTHER: '#64748b',
  };
  return colors[method] ?? '#64748b';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  headerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  headerSubtitle: {
    width: '100%',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  monthNavBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthNavBtnDisabled: {
    opacity: 0.4,
  },
  monthDisplay: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  metricsGrid: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  metricCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metricIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricTextBox: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  metricSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  sectionSubtitle: {
    width: '100%',
    fontSize: 13,
    color: '#7a8a99',
    marginBottom: 16,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  hoursContainer: {
    gap: 12,
  },
  hourCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hourLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  rankBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  hourStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  hourStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hourStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4fc3f7',
  },
  breakdownText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  breakdownNote: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  emptyHoursPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyHoursText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  revenueHighlight: {
    color: '#42a5f5',
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 16,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7a8a99',
    marginBottom: 8,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  metricBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d47a1',
    marginBottom: 6,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  metricBoxSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  occupancyBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  occupancyFill: {
    height: '100%',
    borderRadius: 3,
  },
  occupancyDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  detailContent: {
    flex: 1,
    minWidth: 0,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f4f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#7a8a99',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    marginTop: 2,
    flexShrink: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  detailDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  typeList: {
    gap: 12,
  },
  typeItemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  typeItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeItemRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  typeItemStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  typeStat: {
    flex: 1,
    alignItems: 'center',
  },
  typeStatLabel: {
    fontSize: 10,
    color: '#7a8a99',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  typeStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  typeStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  weeklyList: {
    gap: 12,
  },
  weeklyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  weeklyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  weeklyRevenueBadge: {
    backgroundColor: '#1e88e5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  weeklyRevenueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  weeklyStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  weeklyStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weeklyStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  weeklyStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e2e8f0',
  },
  weeklyBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  weeklyBarFill: {
    height: '100%',
    backgroundColor: '#ec407a',
    borderRadius: 3,
  },
  confirmedBox: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(180,83,9,0.25)',
    gap: 10,
  },
  pendingBannerBody: {
    flex: 1,
  },
  pendingBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b45309',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  pendingBannerSub: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 2,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  statusDistribution: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusCount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  statusLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  methodsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  methodList: {
    gap: 8,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  methodIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLogoImg: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  methodCount: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  methodAmounts: {
    alignItems: 'flex-end',
  },
  methodRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  methodPct: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalMethodBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0d47a1',
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  modalList: {
    padding: 16,
  },
  modalEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalEntryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  modalEntryAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEntryAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  modalEntryBody: {
    flex: 1,
  },
  modalEntryClientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1d4ed8',
    marginBottom: 1,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalEntryLesson: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    flexShrink: 1,
    marginStart: 6,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalEntryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    marginTop: 1,
  },
  modalEntryDate: {
    fontSize: 11,
    color: '#94a3b8',
    flexShrink: 0,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalEntryAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803d',
    marginStart: 8,
    textAlign: 'left',
    writingDirection: 'rtl',
  },
  modalEntrySep: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 8,
  },
});
