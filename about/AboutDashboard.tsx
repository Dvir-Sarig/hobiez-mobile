import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, useWindowDimensions } from 'react-native';

export default function AboutDashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 600;

    const sections = [
        {
            title: "What is Hobinet?",
            icon: "🎯",
            content: (
                <Text style={styles.text}>
                    <Text style={{ fontWeight: 'bold' }}>Hobinet</Text> is a modern platform designed to connect people through hobbies and personalized lessons. Whether you're a client exploring new interests or a coach looking to grow your reach — Hobinet is built to simplify and enrich your experience.
                </Text>
            )
        },
        {
            title: "What you can do today",
            icon: "✅",
            content: (
                <>
                    <Text style={styles.bullet}>• Clients can easily discover new coaches, explore a variety of lessons that match their interests — and register in just a few clicks.</Text>
                    <Text style={styles.bullet}>• Coaches get a dedicated system to create, edit, and manage their lessons, including real-time updates on new signups.</Text>
                    <Text style={styles.bullet}>• Both clients and coaches can manage their schedules effortlessly and stay on top of upcoming sessions.</Text>
                    <Text style={styles.bullet}>• Coaches can keep track of their clients, monitor attendance, and maintain an organized training flow.</Text>
                </>
            )
        },
        {
            title: "Coming Soon",
            icon: "🚀",
            content: (
                <>
                    <Text style={styles.bullet}>• Build a personal network: follow other users, create connections, and grow your exposure.</Text>
                    <Text style={styles.bullet}>• Social feed: share posts, publish promotions, or recommend lessons — all in one vibrant space.</Text>
                    <Text style={styles.bullet}>• Clients will be able to share reviews, ask for recommendations, and engage in the community.</Text>
                    <Text style={styles.bullet}>• Coaches will be able to post announcements, deals, competitions, and more.</Text>
                    <Text style={styles.bullet}>• A full analytics system for tracking your growth — number of clients, lessons, and engagement over time.</Text>
                </>
            )
        },
        {
            title: "Contact Us",
            icon: "📬",
            content: (
                <>
                    <Text style={[styles.text, { marginBottom: 12 }]}>
                        Have questions, found a bug, or just want to share feedback? We're here for you.
                    </Text>
                    <Text style={styles.text} onPress={() => Linking.openURL("mailto:dvirsarig1@gmail.com")}>
                        📧 Email: dvirsarig1@gmail.com
                    </Text>
                    <Text style={styles.text} onPress={() => Linking.openURL("tel:+972526660845")}>
                        📞 Phone: 052-6660845
                    </Text>
                </>
            )
        }
    ];

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={[styles.title, { fontSize: isMobile ? 24 : 30 }]}>About Hobinet</Text>
            {sections.map((section, idx) => (
                <View key={idx} style={styles.card}>
                    <Text style={styles.cardTitle}>{section.icon} {section.title}</Text>
                    {section.content}
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#e3f2fd',
    },
    title: {
        fontWeight: 'bold',
        color: '#0d47a1',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 8,
        marginBottom: 20,
        elevation: 4, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    cardTitle: {
        fontWeight: '600',
        fontSize: 18,
        marginBottom: 10,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        color: '#111',
    },
    bullet: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 8,
        color: '#111',
    },
});
