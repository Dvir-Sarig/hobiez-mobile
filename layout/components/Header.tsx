import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

interface HeaderProps {
    onMobileMenuClick?: () => void;
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.leftRow}>
                {/* תפריט מובייל */}
                <TouchableOpacity onPress={onMobileMenuClick} style={styles.menuButton}>
                    <MaterialIcons name="menu" size={28} color="#1565c0" />
                </TouchableOpacity>

                {/* לוגו HOBIEZ */}
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="karate" size={26} color="#1565c0" />
                    <Text style={styles.logoText}>HOBINET</Text>
                </View>

                {/* כאן אפשר לשלב breadcrumbs מותאם בהמשך */}
            </View>

            {/* מקום ל- CustomDatePicker */}
            <TouchableOpacity onPress={() => {}} style={styles.dateButton}>
                <Text style={styles.dateText}>Select Date</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingBottom: 20,
        paddingHorizontal: 20,
        width: '100%',
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuButton: {
        marginRight: 16,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    logoText: {
        fontWeight: '700',
        fontSize: 20,
        letterSpacing: 1,
        color: '#1565c0',
    },
    dateButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#e3f2fd',
        borderRadius: 6,
    },
    dateText: {
        fontSize: 14,
        color: '#1565c0',
    },
});
