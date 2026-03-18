import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    Dimensions,
    StyleSheet,
    Pressable,
    StatusBar,
    Platform,
    Animated,
    Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import { tokens, surfaces, utils } from '../../shared/design/tokens';
import AuthLayout from '../components/AuthLayout';

const screen = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function LandingPage() {
    const navigation = useNavigation<NavigationProp>();
    const [modalVisible, setModalVisible] = useState(false);
    const [mountModal, setMountModal] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const cardTranslate = useRef(new Animated.Value(40)).current;

    const pressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: tokens.motion.press.toValue,
            useNativeDriver: true,
            speed: tokens.motion.press.speed,
            bounciness: tokens.motion.press.bounciness,
        }).start();
    };
    const pressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: tokens.motion.press.speed,
            bounciness: tokens.motion.press.bounciness,
        }).start();
    };

    const openModal = () => {
        setMountModal(true);
        requestAnimationFrame(() => {
            setModalVisible(true);
            Animated.parallel([
                Animated.timing(backdropOpacity, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(cardTranslate, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true })
            ]).start();
        });
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(backdropOpacity, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
            Animated.timing(cardTranslate, { toValue: 40, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true })
        ]).start(({ finished }) => {
            if (finished) {
                setModalVisible(false);
                setTimeout(() => setMountModal(false), 40);
            }
        });
    };

    const handleRoleSelect = (role: 'client' | 'coach') => {
        closeModal();
        navigation.navigate('SignUp', { role });
    };

    return (
        <AuthLayout scroll={false}>
            <Animated.View style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}> 
                <Pressable
                    onPressIn={pressIn}
                    onPressOut={pressOut}
                    accessibilityRole="header"
                    style={styles.heroInner}
                >
                    <Text style={styles.title}>Hobinet</Text>
                    <Text style={styles.subtitle}>הכל במקום אחד</Text>

                    <View style={styles.features}>
                        <View style={styles.featureItem}>
                            <Ionicons name="calendar-outline" size={24} color={tokens.colors.textOnDark} style={styles.featureIcon} />
                            <Text style={styles.featureText}>הזמן ונהל שיעורים</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="people-outline" size={24} color={tokens.colors.textOnDark} style={styles.featureIcon} />
                            <Text style={styles.featureText}>התחבר למאמנים ולקוחות</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Ionicons name="star-outline" size={24} color={tokens.colors.textOnDark} style={styles.featureIcon} />
                            <Text style={styles.featureText}>שפר את הכישורים שלך מהר יותר</Text>
                        </View>
                    </View>

                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.button, styles.primaryLightButton]}
                            onPress={() => navigation.navigate('SignIn')}
                            accessibilityLabel="התחבר לחשבון שלך"
                        >
                            <Text style={styles.primaryLightButtonText}>התחברות</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton]}
                            onPress={openModal}
                            accessibilityLabel="צור חשבון חדש"
                        >
                            <Text style={styles.primaryButtonText}>בואו נתחיל</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Animated.View>
            {mountModal && (
                <Modal transparent visible={modalVisible} onRequestClose={closeModal} statusBarTranslucent>
                    <Animated.View style={[styles.modalBackdrop, { opacity: backdropOpacity }]}> 
                        <Animated.View style={[styles.modalContainer, { transform: [{ translateY: cardTranslate }] }]}> 
                            <LinearGradient colors={[tokens.colors.primaryDark, tokens.colors.primary]} style={styles.modalHeaderGradient}>
                                <Text style={styles.modalTitle}>הצטרף ל-Hobinet</Text>
                                <Text style={styles.modalSubtitle}>בחר את התפקיד שלך</Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeIconBtn} accessibilityLabel="סגור בחירת תפקיד">
                                    <Ionicons name="close" size={24} color={tokens.colors.textOnDark} />
                                </TouchableOpacity>
                            </LinearGradient>

                            <View style={styles.modalContentScroll}>
                                <Pressable
                                    style={({ pressed }) => [styles.optionBox, pressed && styles.optionBoxPressed]}
                                    onPress={() => handleRoleSelect('client')}
                                    accessibilityLabel="הצטרף כלקוח"
                                >
                                    <View style={styles.optionIconContainer}>
                                        <Ionicons name="person-outline" size={26} color={tokens.colors.primary} />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionTitle}>לקוח</Text>
                                        <Text style={styles.optionText}>גלה והזמן שיעורים עם מאמנים מומחים</Text>
                                    </View>
                                    <Ionicons name="chevron-back" size={22} color={tokens.colors.primary} />
                                </Pressable>

                                <Pressable
                                    style={({ pressed }) => [styles.optionBox, pressed && styles.optionBoxPressed]}
                                    onPress={() => handleRoleSelect('coach')}
                                    accessibilityLabel="הצטרף כמאמן"
                                >
                                    <View style={styles.optionIconContainer}>
                                        <Ionicons name="school-outline" size={26} color={tokens.colors.primary} />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionTitle}>מאמן</Text>
                                        <Text style={styles.optionText}>שתף מומחיות והרחב את העסק שלך</Text>
                                    </View>
                                    <Ionicons name="chevron-back" size={22} color={tokens.colors.primary} />
                                </Pressable>

                                <TouchableOpacity onPress={closeModal} style={styles.secondaryDismissBtn} accessibilityLabel="ביטול וסגירה">
                                    <Text style={styles.secondaryDismissBtnText}>ביטול</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </Animated.View>
                </Modal>
            )}
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    bubbleContainer: { position: 'absolute', inset: 0 },
    bubble: {
        position: 'absolute',
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 400,
    },
    content: { flex: 1, paddingHorizontal: tokens.space.xl, justifyContent: 'center' },
    heroCard: {
        ...surfaces.glassCard,
        borderRadius: tokens.radius.xl,
        padding: tokens.space.xl,
        overflow: 'hidden',
        ...utils.shadowSoft,
    },
    heroInner: { alignItems: 'center' },
    title: {
        fontSize: RFValue(44),
        fontWeight: tokens.fontWeight.heavy as any,
        color: tokens.colors.textOnDark,
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
        marginBottom: tokens.space.md,
    },
    subtitle: {
        fontSize: RFValue(16),
        color: tokens.colors.textSubtle,
        fontWeight: tokens.fontWeight.medium as any,
        marginBottom: tokens.space.xl,
        textAlign: 'left',
        writingDirection: 'rtl',
    },
    features: { width: '100%', marginBottom: tokens.space.xl },
    featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.space.md },
    featureIcon: { marginEnd: tokens.space.md },
    featureText: { color: tokens.colors.textOnDark, fontSize: RFValue(15), fontWeight: tokens.fontWeight.semibold as any, textAlign: 'left', writingDirection: 'rtl' },
    buttonGroup: { flexDirection: 'row', gap: tokens.space.md },
    button: {
        flex: 1,
        paddingVertical: tokens.space.lg,
        borderRadius: tokens.radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryLightButton: { backgroundColor: tokens.colors.light },
    primaryLightButtonText: { color: tokens.colors.primary, fontSize: RFValue(15), fontWeight: tokens.fontWeight.bold as any, textAlign: 'left', writingDirection: 'rtl' },
    primaryButton: { backgroundColor: tokens.colors.primary },
    primaryButtonText: { color: tokens.colors.textOnDark, fontSize: RFValue(15), fontWeight: tokens.fontWeight.bold as any, textAlign: 'left', writingDirection: 'rtl' },
    // Modal
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', paddingHorizontal: tokens.space.md },
    modalContainer: {
        backgroundColor: tokens.colors.light,
        borderRadius: tokens.radius.xl,
        overflow: 'hidden',
        maxWidth: 520,
        alignSelf: 'center',
        width: '100%',
    },
    modalHeaderGradient: {
        paddingTop: Platform.OS === 'ios' ? 54 : 34,
        paddingBottom: tokens.space.lg,
        paddingHorizontal: tokens.space.xl,
    },
    modalTitle: { fontSize: RFValue(22), fontWeight: tokens.fontWeight.bold as any, color: tokens.colors.textOnDark, marginBottom: 4, textAlign: 'left', writingDirection: 'rtl' },
    modalSubtitle: { fontSize: RFValue(14), color: 'rgba(255,255,255,0.80)', fontWeight: tokens.fontWeight.medium as any, textAlign: 'left', writingDirection: 'rtl' },
    closeIconBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 14 : 10, end: 10, padding: 10 },
    modalContentScroll: { padding: tokens.space.xl },
    optionBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: tokens.colors.lightAlt,
        borderRadius: tokens.radius.lg,
        padding: tokens.space.lg,
        marginBottom: tokens.space.md,
        borderWidth: 1,
        borderColor: '#dbe8f5',
    },
    optionBoxPressed: { backgroundColor: '#e3f2fd' },
    optionIconContainer: {
        width: 54,
        height: 54,
        borderRadius: 28,
        backgroundColor: '#e3f2fd',
        alignItems: 'center',
        justifyContent: 'center',
        marginEnd: tokens.space.lg,
    },
    optionContent: { flex: 1 },
    optionTitle: { fontSize: RFValue(16), fontWeight: tokens.fontWeight.bold as any, color: tokens.colors.primary, marginBottom: 4, textAlign: 'left', writingDirection: 'rtl' },
    optionText: { fontSize: RFValue(13), color: '#516079', fontWeight: tokens.fontWeight.medium as any, textAlign: 'left', writingDirection: 'rtl' },
    secondaryDismissBtn: { marginTop: tokens.space.sm, paddingVertical: tokens.space.md, alignItems: 'center' },
    secondaryDismissBtnText: { color: tokens.colors.primary, fontSize: RFValue(15), fontWeight: tokens.fontWeight.bold as any, textAlign: 'left', writingDirection: 'rtl' },
});
