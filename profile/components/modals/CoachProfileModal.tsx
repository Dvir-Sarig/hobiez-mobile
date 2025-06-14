import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';

interface CoachProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachInfo: { name: string; email: string } | null;
}

const CoachProfileModal: React.FC<CoachProfileModalProps> = ({ isOpen, onClose, coachInfo }) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {coachInfo ? (
            <>
              <Text style={styles.title}>{coachInfo.name}</Text>
              <Text style={styles.body}>Email: {coachInfo.email}</Text>
              <Pressable style={styles.button} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
              </Pressable>
            </>
          ) : (
            <Text>Loading coach info...</Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CoachProfileModal;
