import React from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function AnalyticsDashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <LinearGradient colors={['#0d47a1', '#1565c0', '#1e88e5']} style={styles.gradientBg}>
            {/* Decorative bubbles */}
            <View pointerEvents='none' style={styles.decorBubbleOne} />
            <View pointerEvents='none' style={styles.decorBubbleTwo} />
            <View pointerEvents='none' style={styles.decorBubbleThree} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header / Hero */}
                <View style={styles.heroWrap}>
                    <View style={styles.heroIconBadge}>
                        <MaterialIcons name='insights' size={20} color='#ffffff' />
                    </View>
                    <Text style={[styles.heroTitle, isMobile && styles.heroTitleMobile]}>Training Analytics</Text>
                    <Text style={styles.heroSubtitle}>Insight layers to help you improve performance & engagement</Text>
                    <View style={styles.metricRow}>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>📈</Text>
                            <Text style={styles.metricLabel}>Progress</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>🗓️</Text>
                            <Text style={styles.metricLabel}>Frequency</Text>
                        </View>
                        <View style={styles.metricCard}>
                            <Text style={styles.metricValue}>👥</Text>
                            <Text style={styles.metricLabel}>Engagement</Text>
                        </View>
                    </View>
                </View>

                {/* Clients Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name='person-outline' size={20} color='#ffffff' />
                        <Text style={styles.sectionTitle}>Clients</Text>
                    </View>
                    <Text style={styles.bodyText}>• View historical participation & lesson streaks.{"\n"}• Track frequency & session distribution across hobbies.{"\n"}• Identify where you invest the most time.</Text>
                </View>

                {/* Coaches Section */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name='sports-handball' size={20} color='#ffffff' />
                        <Text style={styles.sectionTitle}>Coaches</Text>
                    </View>
                    <Text style={styles.bodyText}>• Monitor lesson fill rate & attendance reliability.{"\n"}• Discover demand trends per lesson type.{"\n"}• Optimize scheduling & spot allocation.</Text>
                </View>

                {/* Coming Soon Roadmap */}
                <View style={[styles.sectionCard, styles.roadmapCard]}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name='auto-graph' size={20} color='#ffffff' />
                        <Text style={styles.sectionTitle}>Coming Soon</Text>
                    </View>
                    <View style={styles.roadmapItemRow}>
                        <View style={styles.dot} />
                        <Text style={styles.roadmapText}>Smart summaries & performance deltas</Text>
                    </View>
                    <View style={styles.roadmapItemRow}>
                        <View style={styles.dot} />
                        <Text style={styles.roadmapText}>Client progress comparison layers</Text>
                    </View>
                    <View style={styles.roadmapItemRow}>
                        <View style={styles.dot} />
                        <Text style={styles.roadmapText}>Trend visualizations & peak hours</Text>
                    </View>
                    <View style={styles.roadmapItemRow}>
                        <View style={styles.dot} />
                        <Text style={styles.roadmapText}>Lesson retention & churn signals</Text>
                    </View>
                    <Text style={styles.footerNote}>Iterating fast — your usage helps shape priorities.</Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradientBg: { flex: 1 },
    scrollContent: { paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 60 },
    heroWrap: { paddingHorizontal: 22, marginBottom: 10 },
    heroIconBadge: {
        width: 46,
        height: 46,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.18)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',
        marginBottom: 14
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.5,
        marginBottom: 8
    },
    heroTitleMobile: { fontSize: 26 },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.82)',
        lineHeight: 20,
        marginBottom: 24
    },
    metricRow: { flexDirection: 'row', gap: 14 },
    metricCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.14)',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.28)',
        shadowColor: '#000',
        shadowOpacity: 0.18,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 }
    },
    metricValue: { fontSize: 20 },
    metricLabel: {
        marginTop: 6,
        fontSize: 11,
        fontWeight: '700',
        color: '#ffffff',
        letterSpacing: 0.5
    },

    sectionCard: {
        marginTop: 34,
        marginHorizontal: 18,
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: 26,
        padding: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.30)',
        shadowColor: '#000',
        shadowOpacity: 0.20,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 }
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#ffffff',
        letterSpacing: 0.5
    },
    bodyText: {
        fontSize: 13.5,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.90)',
        lineHeight: 20
    },

    roadmapCard: { backgroundColor: 'rgba(255,255,255,0.18)' },
    roadmapItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
        marginTop: 4
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#64b5f6',
        marginTop: 5
    },
    roadmapText: {
        flex: 1,
        fontSize: 13.5,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.92)',
        lineHeight: 19
    },
    footerNote: {
        marginTop: 8,
        fontSize: 11.5,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: 0.4
    },

    decorBubbleOne: {
        position: 'absolute',
        top: -70,
        left: -50,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.07)'
    },
    decorBubbleTwo: {
        position: 'absolute',
        top: 260,
        right: -60,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(255,255,255,0.05)'
    },
    decorBubbleThree: {
        position: 'absolute',
        bottom: -90,
        left: -40,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.06)'
    },
});
