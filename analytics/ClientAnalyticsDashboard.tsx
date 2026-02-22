import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';
import { Lesson } from '../lesson/types/Lesson';
import { fetchClientRegisteredLessons } from '../lesson/services/lessonService';
import { fetchCoachGlobalInfo } from '../profile/services/coachService';
import {
  calculateClientAnalytics,
  getTopHoursForClient,
  formatHour,
  ClientAnalyticsData,
  HourlyLesson,
} from './services/clientAnalyticsService';

export default function ClientAnalyticsDashboard() {
  const { userId } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [analyticsData, setAnalyticsData] = useState<ClientAnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [coachInfoMap, setCoachInfoMap] = useState<Record<string, { name: string; profilePictureUrl?: string | null }>>({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        if (!userId) {
          console.error('No user ID available');
          setLoading(false);
          return;
        }

        // Fetch real client lessons data
        const lessons = await fetchClientRegisteredLessons(userId);

        // Calculate analytics for the selected month
        const data = calculateClientAnalytics(lessons, currentMonth.month(), currentMonth.year());
        setAnalyticsData(data);

        const coachIds = Array.from(new Set(lessons.map((lesson) => lesson.coachId))).filter((coachId) => !coachInfoMap[coachId]);
        if (coachIds.length > 0) {
          const coachEntries = await Promise.all(
            coachIds.map(async (coachId) => {
              try {
                const coachInfo = await fetchCoachGlobalInfo(coachId);
                return [coachId, { name: coachInfo.name, profilePictureUrl: coachInfo.profilePictureUrl }] as const;
              } catch {
                return [coachId, { name: 'Unknown Coach', profilePictureUrl: null }] as const;
              }
            })
          );

          setCoachInfoMap((prev) => ({
            ...prev,
            ...Object.fromEntries(coachEntries),
          }));
        }
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

  const topHours = analyticsData ? getTopHoursForClient(analyticsData.hoursData, 3) : [];
  const getCoachDisplayName = (coachId: string) => coachInfoMap[coachId]?.name || 'Unknown Coach';
  const getCoachProfileImage = (coachId: string) => coachInfoMap[coachId]?.profilePictureUrl || null;

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
            <Text style={styles.headerTitle}>Your Progress</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your lessons and learning journey</Text>
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
                icon="school"
                label="Total Lessons"
                value={analyticsData.totalLessons.toString()}
                bgGradient={['#1565c0', '#1e88e5']}
                iconColor="#42a5f5"
              />
              <MetricCard
                icon="sports"
                label="Favorite Hobby"
                value={analyticsData.mostPopularType || 'N/A'}
                subtext={analyticsData.lessonsByType.length > 0 ? `${analyticsData.lessonsByType[0].count} lessons` : 'No data'}
                bgGradient={['#0d47a1', '#1565c0']}
                iconColor="#64b5f6"
              />
              <MetricCard
                icon="person"
                label="Top Coach"
                value={analyticsData.mostActiveCoach ? getCoachDisplayName(analyticsData.mostActiveCoach.coachId) : 'N/A'}
                subtext={analyticsData.mostActiveCoach ? `${analyticsData.mostActiveCoach.lessonCount} lessons • ${analyticsData.mostActiveCoach.percentage}%` : 'No data'}
                bgGradient={['#1565c0', '#42a5f5']}
                iconColor="#4fc3f7"
              />
              <MetricCard
                icon="schedule"
                label="Favorite Time"
                value={topHours.length > 0 ? formatHour(topHours[0].hour) : 'N/A'}
                subtext={topHours.length > 0 ? `${topHours[0].lessonCount} lessons` : 'No data'}
                bgGradient={['#0d47a1', '#42a5f5']}
                iconColor="#81d4fa"
              />
            </View>

            {/* Lessons by Type Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="dumbbell" size={20} color="#ff6b6b" />
                <Text style={styles.sectionTitle}>Your Interests</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Breakdown of lessons by type</Text>

              {analyticsData.lessonsByType.length > 0 ? (
                <View style={styles.typesContainer}>
                  {analyticsData.lessonsByType.map((type, index) => (
                    <View key={type.type} style={styles.typeCard}>
                      <View style={styles.typeHeader}>
                        <Text style={styles.typeLabel}>{type.type}</Text>
                        <View style={[styles.percentBadge, { backgroundColor: getTypeColor(index) }]}>
                          <Text style={styles.percentText}>{type.percentage}%</Text>
                        </View>
                      </View>
                      <View style={styles.typeStats}>
                        <Text style={styles.typeStatText}>{type.count} lesson{type.count !== 1 ? 's' : ''}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${type.percentage}%`,
                              backgroundColor: getTypeColor(index),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyPlaceholder}>
                  <MaterialCommunityIcons name="dumbbell" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No lessons yet</Text>
                </View>
              )}
            </View>

            {/* Hot Hours Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="fire" size={20} color="#ff6b6b" />
                <Text style={styles.sectionTitle}>Your Peak Hours</Text>
              </View>
              <Text style={styles.sectionSubtitle}>When you typically take lessons</Text>

              {topHours.length > 0 ? (
                <View style={styles.hoursContainer}>
                  {topHours.map((hour: HourlyLesson, index: number) => (
                    <View key={hour.hour} style={styles.hourCard}>
                      <View style={styles.hourHeader}>
                        <Text style={styles.hourLabel}>{formatHour(hour.hour)}</Text>
                        <View style={[styles.rankBadge, { backgroundColor: getRankColor(index) }]}>
                          <Text style={styles.rankText}>#{index + 1}</Text>
                        </View>
                      </View>
                      <View style={styles.hourStats}>
                        <MaterialIcons name="schedule" size={16} color="#64b5f6" />
                        <Text style={styles.hourStatText}>{hour.lessonCount} lesson{hour.lessonCount !== 1 ? 's' : ''}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${Math.min((hour.lessonCount / (topHours[0]?.lessonCount || 1)) * 100, 100)}%`,
                              backgroundColor: getRankColor(index),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyPlaceholder}>
                  <MaterialCommunityIcons name="clock-outline" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No lessons scheduled yet</Text>
                </View>
              )}
            </View>

            {/* Top Coaches Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="human-greeting" size={20} color="#64b5f6" />
                <Text style={styles.sectionTitle}>Your Coaches</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Most lessons from these coaches</Text>

              {analyticsData.topCoaches.length > 0 ? (
                <View style={styles.coachesContainer}>
                  {analyticsData.topCoaches.map((coach, index) => (
                    <View key={coach.coachId} style={styles.coachCard}>
                      <View style={styles.coachHeader}>
                        <View style={[styles.coachRank, { backgroundColor: getTypeColor(index) }]}>
                          <Text style={styles.coachRankText}>#{index + 1}</Text>
                        </View>
                        <View style={styles.coachAvatarWrap}>
                          {getCoachProfileImage(coach.coachId) ? (
                            <Image source={{ uri: getCoachProfileImage(coach.coachId)! }} style={styles.coachAvatar} />
                          ) : (
                            <View style={styles.coachAvatarFallback}>
                              <MaterialIcons name="person" size={18} color="#64748b" />
                            </View>
                          )}
                        </View>
                        <View style={styles.coachInfo}>
                          <Text style={styles.coachName}>{getCoachDisplayName(coach.coachId)}</Text>
                          <Text style={styles.coachPercentage}>{coach.percentage}% of lessons</Text>
                        </View>
                      </View>
                      <View style={styles.coachStats}>
                        <MaterialIcons name="school" size={16} color="#42a5f5" />
                        <Text style={styles.coachStatText}>{coach.lessonCount} lesson{coach.lessonCount !== 1 ? 's' : ''}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyPlaceholder}>
                  <MaterialCommunityIcons name="human-greeting" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No coaches booked</Text>
                </View>
              )}
            </View>

            {/* Detailed Coach Breakdown */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="chart-pie" size={20} color="#9c27b0" />
                <Text style={styles.sectionTitle}>Lessons by Coach</Text>
              </View>
              <Text style={styles.sectionSubtitle}>Breakdown of lesson types per coach</Text>

              {analyticsData.coachDetails.length > 0 ? (
                <View style={styles.coachDetailsContainer}>
                  {analyticsData.coachDetails.map((coach) => (
                    <View key={coach.coachId} style={styles.coachDetailCard}>
                      <View style={styles.coachDetailHeader}>
                        <View style={styles.coachDetailTitle}>
                          <View style={styles.coachDetailIdentity}>
                            {getCoachProfileImage(coach.coachId) ? (
                              <Image source={{ uri: getCoachProfileImage(coach.coachId)! }} style={styles.coachDetailAvatar} />
                            ) : (
                              <View style={styles.coachDetailAvatarFallback}>
                                <MaterialIcons name="person" size={18} color="#64748b" />
                              </View>
                            )}
                            <Text style={styles.coachDetailName}>{getCoachDisplayName(coach.coachId)}</Text>
                          </View>
                          <Text style={styles.coachDetailTotal}>{coach.totalLessons} lesson{coach.totalLessons !== 1 ? 's' : ''}</Text>
                        </View>
                      </View>

                      <View style={styles.coachTypesList}>
                        {coach.lessonsByType.map((type, idx) => (
                          <View key={type.type} style={styles.coachTypeItem}>
                            <View style={styles.typeItemHeader}>
                              <Text style={styles.typeItemLabel}>{type.type}</Text>
                              <View style={[styles.typeItemBadge, { backgroundColor: getTypeColor(idx) }]}>
                                <Text style={styles.typeItemCount}>{type.count}</Text>
                              </View>
                            </View>
                            <View style={styles.typeItemRow}>
                              <View style={styles.typeItemProgress}>
                                <View
                                  style={[
                                    styles.typeItemProgressFill,
                                    {
                                      width: `${type.percentage}%`,
                                      backgroundColor: getTypeColor(idx),
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={styles.typeItemPercent}>{type.percentage}%</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyPlaceholder}>
                  <MaterialCommunityIcons name="chart-pie" size={40} color="#cbd5e1" />
                  <Text style={styles.emptyText}>No coaches yet</Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="info" size={48} color="#ffffff88" />
            <Text style={styles.emptyStateText}>No lessons taken this month</Text>
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
  const colors = ['#42a5f5', '#66bb6a', '#ffa726', '#ec407a', '#ab47bc'];
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
  typesContainer: {
    gap: 12,
  },
  typeCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d47a1',
  },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  typeStats: {
    marginBottom: 10,
  },
  typeStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
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
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hourStatText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  coachesContainer: {
    gap: 12,
  },
  coachCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachRank: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachRankText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  coachAvatarWrap: {
    marginRight: 10,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  coachAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachInfo: {
    flex: 1,
  },
  coachName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    marginBottom: 2,
  },
  coachPercentage: {
    fontSize: 11,
    color: '#7a8a99',
  },
  coachStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachStatText: {
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
  emptyPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
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
  coachDetailsContainer: {
    gap: 12,
  },
  coachDetailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coachDetailHeader: {
    marginBottom: 14,
  },
  coachDetailTitle: {
    flexDirection: 'column',
  },
  coachDetailIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coachDetailAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  coachDetailAvatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coachDetailName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0d47a1',
    flex: 1,
  },
  coachDetailTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1565c0',
  },
  coachTypesList: {
    gap: 10,
  },
  coachTypeItem: {
    backgroundColor: '#fafbfc',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f0f4f8',
  },
  typeItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
  },
  typeItemBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeItemCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  typeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeItemProgress: {
    flex: 1,
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 2.5,
    overflow: 'hidden',
  },
  typeItemProgressFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  typeItemPercent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    minWidth: 32,
    textAlign: 'right',
  },
});
