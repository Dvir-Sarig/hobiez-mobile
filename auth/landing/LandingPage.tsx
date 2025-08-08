import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
    Pressable,
    StatusBar,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from "react-native-responsive-fontsize";

const screen = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function LandingPage() {
    const navigation = useNavigation<NavigationProp>();
    const [modalVisible, setModalVisible] = useState(false);

    const handleRoleSelect = (role: 'client' | 'coach') => {
        setModalVisible(false);
        navigation.navigate('SignUp', { role });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#1565c0', '#0d47a1']}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Hobinet</Text>
                        <Text style={styles.subtitle}>Turn your hobby into a habit</Text>
                    </View>

                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <Ionicons name="calendar-outline" size={24} color="#fff" style={styles.featureIcon} />
                            <Text style={styles.featureText}>Book and manage lessons anytime</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="people-outline" size={24} color="#fff" style={styles.featureIcon} />
                            <Text style={styles.featureText}>Connect with coaches and new clients</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="star-outline" size={24} color="#fff" style={styles.featureIcon} />
                            <Text style={styles.featureText}>Grow your skills</Text>
                        </View>
                    </View>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.button, styles.signInButton]}
                            onPress={() => navigation.navigate('SignIn')}
                        >
                            <Text style={[styles.buttonText, { color: '#1976d2' }]}>Sign In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.signUpButton]}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={[styles.buttonText, { color: 'white' }]}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>

            <Modal
                transparent
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Join Hobinet</Text>
                            <Text style={styles.modalSubtitle}>Choose your role</Text>
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.optionBox,
                                pressed && styles.optionBoxPressed
                            ]}
                            onPress={() => handleRoleSelect('client')}
                        >
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="person-outline" size={24} color="#1976d2" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Join as Client</Text>
                                <Text style={styles.optionText}>Find and book lessons with professional coaches</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#1976d2" />
                        </Pressable>

                        <Pressable
                            style={({ pressed }) => [
                                styles.optionBox,
                                pressed && styles.optionBoxPressed
                            ]}
                            onPress={() => handleRoleSelect('coach')}
                        >
                            <View style={styles.optionIconContainer}>
                                <Ionicons name="school-outline" size={24} color="#1976d2" />
                            </View>
                            <View style={styles.optionContent}>
                                <Text style={styles.optionTitle}>Join as Coach</Text>
                                <Text style={styles.optionText}>Share your expertise and grow your business</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color="#1976d2" />
                        </Pressable>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center', // 🟢 במקום space-between
        alignItems: 'center',     // 🟢 למרכז אופקית
    },
    header: {
        alignItems: 'center',
        marginTop: Platform.OS === 'ios' ? 60 : 40,
    },
    title: {
        fontSize: RFValue(48),
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: RFValue(18),
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 32,
    },
    features: {
        marginVertical: 40,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, 
        paddingHorizontal: 12,
    },
    featureIcon: {
        marginRight: 16,
    },
    featureText: {
        color: 'white',
        fontSize: RFValue(16),
        fontWeight: '500',
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    button: {
        flex: 1,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    signInButton: {
        backgroundColor: 'white',
    },
    signUpButton: {
        borderWidth: 2,
        borderColor: 'white',
    },
    buttonText: {
        fontSize: RFValue(16),
        fontWeight: '600',
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: screen.width * 0.9,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: RFValue(24),
        fontWeight: '700',
        color: '#1976d2',
        marginBottom: 8,
    },
    modalSubtitle: {
        color: '#666',
        fontSize: 16,
    },
    optionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    optionBoxPressed: {
        backgroundColor: '#e3f2fd',
    },
    optionIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontWeight: '600',
        fontSize: RFValue(16),
        color: '#1976d2',
        marginBottom: 4,
    },
    optionText: {
        color: '#666',
        fontSize: RFValue(14),
    },
    closeButton: {
        marginTop: 8,
        padding: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#1976d2',
        fontWeight: '600',
        fontSize: RFValue(16),
    },
});
