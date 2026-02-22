import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';
import { Lesson } from '../lesson/types/Lesson';
import { fetchCoachLessons } from '../lesson/services/lessonService';
import {
  calculateCoachAnalytics,
  getTopHours,
  formatHour,
  CoachAnalyticsData,
  HourlyRegistration,
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

export default function CoachAnalyticsDashboard() {
  const { userId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [analyticsData, setAnalyticsData] = useState<CoachAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        if (!userId) {
          console.error('No user ID available');
          setLoading(false);
          return;
        }
        
        // Fetch real coach lessons data
        const lessons = await fetchCoachLessons(userId);
        
        // Calculate analytics for the selected month
        const data = calculateCoachAnalytics(lessons, currentMonth.month(), currentMonth.year());
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [currentMonth, userId]);

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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerIconBadge}>
              <MaterialIcons name="analytics" size={24} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Analytics</Text>
          </View>
          <Text style={styles.headerSubtitle}>Your coaching performance at a glance</Text>
        </View>

        {/* Month Navigation */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
            <MaterialIcons name="chevron-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.monthDisplay}>
            <Text style={styles.monthText}>{currentMonth.format('MMMM YYYY')}</Text>
          </View>
          <TouchableOpacity
            onPress={handleNextMonth}
            disabled={currentMonth.isAfter(dayjs())}
            style={[styles.monthNavBtn, currentMonth.isAfter(dayjs()) && styles.monthNavBtnDisabled]}
          >
            <MaterialIcons name="chevron-right" size={24} color={currentMonth.isAfter(dayjs()) ? '#ffffff66' : '#fff'} />
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
                label="Total Lessons"
                value={analyticsData.totalLessons.toString()}
                bgGradient={['#1565c0', '#1e88e5']}
                iconColor="#42a5f5"
              />
              <MetricCard
                icon="people"
                label="Registration Rate"
                value={`${analyticsData.registrationRate}%`}
                subtext={`${analyticsData.registeredCount} registrations`}
                bgGradient={['#0d47a1', '#1565c0']}
                iconColor="#64b5f6"
              />
              <MetricCard
                icon="attach-money"
                label="Revenue"
                value={`$${analyticsData.totalRevenue.toLocaleString()}`}
                subtext={`${analyticsData.registeredCount} registrations`}
                bgGradient={['#1565c0', '#42a5f5']}
                iconColor="#4fc3f7"
              />
              <MetricCard
                icon="schedule"
                label="Most Popular"
                value={topHours.length > 0 ? formatHour(topHours[0].hour) : 'N/A'}
                subtext={topHours.length > 0 ? `${topHours[0].registrations} registrations` : 'No data'}
                bgGradient={['#0d47a1', '#42a5f5']}
                iconColor="#81d4fa"
              />
            </View>

            {/* Hot Hours Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="fire" size={20} color="#ff6b6b" />
                <Text style={styles.sectionTitle}>Hot Hours</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Your most popular lesson times</Text>

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
                          <Text style={styles.hourStatText}>{hour.registrations} registrations</Text>
                        </View>
                        <View style={styles.hourStat}>
                          <MaterialCommunityIcons name="calendar-month" size={16} color="#81d4fa" />
                          <Text style={styles.hourStatText}>{hour.lessonCount} lesson{hour.lessonCount !== 1 ? 's' : ''}</Text>
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
                  <Text style={styles.emptyHoursText}>No lessons scheduled yet</Text>
                </View>
              )}
            </View>

            {/* Revenue Breakdown */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="pie-chart" size={20} color="#4fc3f7" />
                <Text style={styles.sectionTitle}>Revenue Breakdown</Text>
              </View>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <View style={styles.breakdownDot} />
                    <Text style={styles.breakdownText}>Total Registrations</Text>
                  </View>
                  <Text style={styles.breakdownValue}>{analyticsData.registeredCount}</Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <View style={[styles.breakdownDot, { backgroundColor: '#42a5f5' }]} />
                    <Text style={styles.breakdownText}>Total Revenue</Text>
                  </View>
                  <Text style={[styles.breakdownValue, styles.revenueHighlight]}>
                    ${analyticsData.totalRevenue.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.breakdownDivider} />
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabel}>
                    <View style={[styles.breakdownDot, { backgroundColor: '#81d4fa' }]} />
                    <Text style={styles.breakdownText}>Avg. per Registration</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    ${analyticsData.registeredCount > 0 ? (analyticsData.totalRevenue / analyticsData.registeredCount).toFixed(2) : '0'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Occupancy Metrics Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="trending-up" size={20} color="#66bb6a" />
                <Text style={styles.sectionTitle}>Capacity Insights</Text>
              </View>
              <Text style={styles.sectionSubtitle}>How full your lessons are (registrations vs total capacity)</Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricBoxLabel}>Avg. Occupancy</Text>
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
                  <Text style={styles.metricBoxLabel}>Avg. Class Size</Text>
                  <Text style={styles.metricBoxValue}>{analyticsData.occupancyMetrics.averageClassSize}</Text>
                  <Text style={styles.metricBoxSubtext}>students per lesson</Text>
                </View>
              </View>

              <View style={styles.occupancyDetails}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="arrow-upward" size={16} color="#66bb6a" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Best Occupancy Hour</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {analyticsData.occupancyMetrics.mostFilledHour !== null
                        ? `${formatHour(analyticsData.occupancyMetrics.mostFilledHour)} • ${analyticsData.occupancyMetrics.mostFilledHourOccupancy}%`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailDivider} />

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <MaterialIcons name="arrow-downward" size={16} color="#ff7043" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Lowest Occupancy Hour</Text>
                    <Text style={styles.detailValue} numberOfLines={1}>
                      {analyticsData.occupancyMetrics.leastFilledHour !== null
                        ? `${formatHour(analyticsData.occupancyMetrics.leastFilledHour)} • ${analyticsData.occupancyMetrics.leastFilledHourOccupancy}%`
                        : 'Need 2+ different hours'}
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
                  <Text style={styles.sectionTitle}>Lesson Performance</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Revenue & demand by lesson type</Text>

                <View style={styles.typeList}>
                  {analyticsData.lessonTypeMetrics.map((metric, index) => (
                    <View key={metric.type} style={styles.typeItemCard}>
                      <View style={styles.typeItemHeader}>
                        <Text style={styles.typeItemName}>{metric.type}</Text>
                        <View style={[styles.typeItemBadge, { backgroundColor: getTypeColor(index) }]}>
                          <Text style={styles.typeItemRevenue}>${metric.revenue}</Text>
                        </View>
                      </View>

                      <View style={styles.typeItemStats}>
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>Registrations</Text>
                          <Text style={styles.typeStatValue}>{metric.registrations}</Text>
                        </View>
                        <View style={styles.typeStatDivider} />
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>Lessons</Text>
                          <Text style={styles.typeStatValue}>{metric.lessonCount}</Text>
                        </View>
                        <View style={styles.typeStatDivider} />
                        <View style={styles.typeStat}>
                          <Text style={styles.typeStatLabel}>Occupancy</Text>
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
                  <Text style={styles.sectionTitle}>Weekly Trend</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Performance across weeks</Text>

                <View style={styles.weeklyList}>
                  {analyticsData.weeklyPerformance.map((week) => (
                    <View key={week.week} style={styles.weeklyCard}>
                      <View style={styles.weeklyHeader}>
                        <Text style={styles.weeklyLabel}>{week.dateRange}</Text>
                        <View style={styles.weeklyRevenueBadge}>
                          <Text style={styles.weeklyRevenueText}>${week.revenue}</Text>
                        </View>
                      </View>

                      <View style={styles.weeklyStats}>
                        <View style={styles.weeklyStat}>
                          <MaterialIcons name="calendar-month" size={14} color="#1e88e5" />
                          <Text style={styles.weeklyStatText}>{week.lessons} lessons</Text>
                        </View>
                        <View style={styles.weeklyStatDivider} />
                        <View style={styles.weeklyStat}>
                          <MaterialIcons name="people" size={14} color="#42a5f5" />
                          <Text style={styles.weeklyStatText}>{week.registrations} registrations</Text>
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
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="info" size={48} color="#ffffff88" />
            <Text style={styles.emptyStateText}>No lessons scheduled for this month</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  },
  headerIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
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
  },
  metricIconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  metricSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
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
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0d47a1',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7a8a99',
    marginBottom: 16,
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
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
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
  },
  metricBoxValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0d47a1',
    marginBottom: 6,
  },
  metricBoxSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
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
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    marginTop: 2,
    flexShrink: 1,
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
  },
  typeStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
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
});
