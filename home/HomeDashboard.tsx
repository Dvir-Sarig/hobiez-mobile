import React from 'react';
import {
    Text,
    View,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    Platform,
} from 'react-native';

export default function HomeDashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={[styles.title, isMobile && styles.titleMobile]}>
                👋 Welcome to Hobinet
            </Text>

            <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
                Your space for hobbies, progress, and social connections
            </Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>🎯 For Clients</Text>
                <Text style={styles.text}>
                    • Search for exciting lessons that match your interests.{'\n'}
                    • Sign up in seconds and start your hobby journey.{'\n'}
                    • Stay updated and connect with inspiring coaches.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>💪 For Coaches</Text>
                <Text style={styles.text}>
                    • Create and manage your lessons with ease.{'\n'}
                    • Track participants and manage your schedule.{'\n'}
                    • Grow your network and gain more visibility.
                </Text>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>🌟 Coming Soon</Text>
                <Text style={[styles.text, { fontSize: 14, color: '#555' }]}>
                    In the next version of Hobinet, your home screen will become your
                    personal social feed — view shared posts, updates, and lessons from
                    your connections.
                </Text>
            </View>

            <Text style={styles.footer}>Use the side menu to explore the app!</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e3f2fd',
        flexGrow: 1,
        padding: 24,
        paddingBottom: 60,
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        color: '#0d47a1',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    titleMobile: {
        fontSize: 26,
    },
    subtitle: {
        fontSize: 18,
        color: '#0d47a1',
        textAlign: 'center',
        marginBottom: 28,
        fontWeight: '500',
    },
    subtitleMobile: {
        fontSize: 15,
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: Platform.OS === 'android' ? 3 : 0,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#0d47a1',
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 16,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 12,
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        color: '#0d47a1',
        fontWeight: '500',
        fontSize: 14,
    },
});
