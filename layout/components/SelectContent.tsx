// File: components/SelectContent.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import OptionsMenu from './OptionsMenu';

interface SelectContentProps {
    userInfo: { name: string; email: string } | null;
}

export default function SelectContent({ userInfo }: SelectContentProps) {
    return (
        <View style={styles.container}>
            <View style={styles.avatar}>
                <MaterialIcons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.userDetails}>
                <Text style={styles.name}>{userInfo?.name || 'User Name'}</Text>
                <Text style={styles.email}>{userInfo?.email || 'user@email.com'}</Text>
            </View>
            <OptionsMenu />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 10,
        borderRadius: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#fff',
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDetails: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    email: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
});
