import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from "dayjs";

export default function CustomDatePicker() {
    const [currentDate, setCurrentDate] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDate(dayjs());
        }, 60000); // עדכון כל דקה

        return () => clearInterval(timer);
    }, []);

    return (
        <View style={styles.container}>
            <MaterialIcons name="calendar-today" size={16} color="#1976d2" />
            <Text style={styles.text}>
                {currentDate.format('MMMM D, YYYY')}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 10,
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(25, 118, 210, 0.12)',
        position: 'absolute',
        top: 10,
        right: 20,
        zIndex: 1000,
    },
    text: {
        color: '#1976d2',
        fontWeight: '600',
        letterSpacing: 0.3,
        fontSize: 14,
    }
});
