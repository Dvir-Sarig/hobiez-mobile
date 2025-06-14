// File: components/OptionsMenu.tsx

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {RootStackParamList} from "../../types";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function OptionsMenu() {
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation<NavigationProp>();

    const handleLogout = async () => {
        try {
            setModalVisible(false);

            await AsyncStorage.multiRemove(['token', 'userId', 'userType', 'userInfo']);

            navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.menuButton}>
                <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>

            <Modal
                transparent
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.menuItem}>
                            <Text style={styles.menuText}>Settings</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
                            <Text style={[styles.menuText, { color: 'red' }]}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    menuButton: {
        padding: 6,
    },
    menuIcon: {
        fontSize: 24,
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    menuItem: {
        paddingVertical: 12,
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginVertical: 8,
    },
});
