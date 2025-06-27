import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Modal,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { deleteAccount } from '../../../auth/services/accountDeletionService';
import SecureStorage from '../../../auth/services/SecureStorage';
import { profileCacheService } from '../../services/profileCacheService';

interface DeleteAccountModalProps {
    isVisible: boolean;
    onClose: () => void;
    onAccountDeleted: () => void;
    userType: 'client' | 'coach';
}

export default function DeleteAccountModal({ 
    isVisible, 
    onClose, 
    onAccountDeleted,
    userType 
}: DeleteAccountModalProps) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter your password');
            return;
        }

        Alert.alert(
            'Confirm Deletion',
            'This action cannot be undone. Are you sure you want to delete your account?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await deleteAccount(password);
                            
                            // Clear secure storage
                            await SecureStorage.clearAll();
                            
                            // Clear profile cache
                            const userId = await SecureStorage.getUserId();
                            if (userId) {
                                await profileCacheService.clearUserProfile(userId);
                            }
                            
                            // Notify parent component
                            onAccountDeleted();
                            
                            // Close modal
                            onClose();
                        } catch (error) {
                            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete account');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleClose = () => {
        if (!loading) {
            setPassword('');
            onClose();
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#ff6b6b', '#ee5a52']}
                        style={styles.header}
                    >
                        <View style={styles.headerContent}>
                            <Ionicons name="trash" size={24} color="white" />
                            <Text style={styles.headerTitle}>Delete Account</Text>
                        </View>
                    </LinearGradient>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.warningContainer}>
                            <Ionicons name="warning" size={24} color="#f39c12" />
                            <Text style={styles.warningTitle}>This action cannot be undone!</Text>
                            <Text style={styles.warningText}>
                                Deleting your account will permanently remove:
                            </Text>
                            <View style={styles.bulletList}>
                                <Text style={styles.bulletPoint}>• Your profile and personal information</Text>
                                <Text style={styles.bulletPoint}>• All your lesson registrations</Text>
                                <Text style={styles.bulletPoint}>• Your account credentials</Text>
                                {userType === 'coach' && (
                                    <Text style={styles.bulletPoint}>• All lessons you've created</Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>To confirm deletion, please enter your password:</Text>
                            <TextInput
                                style={styles.passwordInput}
                                placeholder="Enter your password"
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                                editable={!loading}
                            />
                        </View>
                    </ScrollView>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={handleClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton, loading && styles.disabledButton]}
                            onPress={handleDelete}
                            disabled={loading || !password.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="trash" size={16} color="white" />
                                    <Text style={styles.deleteButtonText}>Delete Account</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        maxHeight: '80%',
    },
    header: {
        padding: 20,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    warningContainer: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        borderWidth: 1,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#856404',
        marginTop: 8,
        marginBottom: 8,
    },
    warningText: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 8,
    },
    bulletList: {
        marginLeft: 8,
    },
    bulletPoint: {
        fontSize: 14,
        color: '#856404',
        marginBottom: 4,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    passwordInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f8f9fa',
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    cancelButton: {
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cancelButtonText: {
        color: '#6c757d',
        fontSize: 16,
        fontWeight: '500',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
    },
    deleteButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    disabledButton: {
        opacity: 0.6,
    },
}); 