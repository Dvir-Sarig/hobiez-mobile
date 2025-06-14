import React from 'react';
import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingModalProps {
  visible: boolean;
  message: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.message}>{message}</Text>
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
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    textAlign: 'center',
  },
});

export default LoadingModal; 