import React from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
} from 'react-native';

export default function AnalyticsDashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <ScrollView style={styles.screen}>
            <View style={[styles.container, { paddingHorizontal: isMobile ? 16 : 32 }]}>
                <Text style={[styles.title, { fontSize: isMobile ? 24 : 30 }]}>
                    📊 Training Analytics
                </Text>

                <Text style={styles.subtitle}>
                    Insights to help you grow and improve
                </Text>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>🧍‍♂️ For Clients</Text>
                    <Text style={styles.text}>
                        • View your training history and performance over time.{"\n"}
                        • Track your lesson frequency and progress.{"\n"}
                        • Understand which hobbies you engage with the most.
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>💪 For Coaches</Text>
                    <Text style={styles.text}>
                        • Analyze your coaching activity and lesson engagement.{"\n"}
                        • Track trends across different hobbies and lesson types.{"\n"}
                        • Get client-level insights to help tailor future sessions.
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.comingTitle}>🚀 Coming Soon</Text>
                    <Text style={styles.comingText}>
                        In the upcoming version of Hobinet, analytics will become even more powerful —
                        including smart summaries, client progress comparisons, and visual trends.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#e3f2fd',
        flex: 1,
    },
    container: {
        paddingVertical: 32,
    },
    title: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#0d47a1',
        marginBottom: 12,
    },
    subtitle: {
        textAlign: 'center',
        color: '#0d47a1',
        fontWeight: '500',
        marginBottom: 24,
        fontSize: 16,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 8,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitle: {
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 8,
    },
    text: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 12,
        lineHeight: 22,
        color: '#111',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginVertical: 16,
    },
    comingTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 8,
    },
    comingText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
        lineHeight: 20,
    },
});
