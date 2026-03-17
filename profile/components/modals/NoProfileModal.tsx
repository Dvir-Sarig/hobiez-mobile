import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface NoProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userType?: 'coach' | 'client';
}

const NoProfileModal: React.FC<NoProfileModalProps> = ({ isOpen, onClose, userType = 'coach' }) => {
    const noun = userType === 'coach' ? 'המאמן' : 'הלקוח';
    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <MaterialIcons name="person-off" size={48} color="#1976d2" />
                    <Text style={styles.title}>הפרופיל אינו זמין</Text>
                    <Text style={styles.message}>
                        {noun} עדיין לא יצר פרופיל. אנא בדוק שוב מאוחר יותר.
                    </Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>סגור</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'left',
        writingDirection: 'rtl',
    },
    message: {
        fontSize: 16,
        color: '#555',
        textAlign: 'left',
        writingDirection: 'rtl',
        marginVertical: 12,
    },
    closeButton: {
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        writingDirection: 'rtl',
    },
});

export default NoProfileModal;
