import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import DeleteAccountModal from '../profile/components/modals/DeleteAccountModal';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../auth/AuthContext';

export default function SettingsScreen() {
  const { userType, signOut } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.item} onPress={() => setShowDeleteModal(true)}>
          <Ionicons name="trash" size={20} color="#dc3545" />
          <Text style={styles.itemText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={signOut}>
          <MaterialIcons name="logout" size={20} color="#1976d2" />
          <Text style={styles.itemText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <DeleteAccountModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onAccountDeleted={signOut}
        userType={userType as 'client' | 'coach'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eaf2fb', padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#1976d2', marginBottom: 24 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 12, textTransform: 'uppercase' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  itemText: { fontSize: 16, fontWeight: '500', color: '#333' },
});
