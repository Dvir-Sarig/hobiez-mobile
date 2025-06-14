import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import { fetchClientGlobalInfo, ClientGlobalInfo } from '../../../../profile/services/clientService';
import { useNavigation } from '@react-navigation/native';

interface RegisteredClientsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonId: number;
    registeredClients: { id: number; name: string }[];
    isLoading: boolean;
}

const RegisteredClientsModal: React.FC<RegisteredClientsModalProps> = ({
    isOpen,
    onClose,
    lessonId,
    registeredClients,
    isLoading
}) => {
    const [clientInfos, setClientInfos] = useState<{ [key: number]: ClientGlobalInfo }>({});
    const [hasLoaded, setHasLoaded] = useState(false);
    const navigation = useNavigation<any>();

    useEffect(() => {
        const fetchClientInfos = async () => {
            if (!isOpen) return;

            setHasLoaded(false);
            const newClientInfos: { [key: number]: ClientGlobalInfo } = {};

            try {
                for (const client of registeredClients) {
                    const info = await fetchClientGlobalInfo(client.id);
                    newClientInfos[client.id] = info;
                }
                setClientInfos(newClientInfos);
            } catch (error) {
                console.error('Error fetching client infos:', error);
            } finally {
                setHasLoaded(true);
            }
        };

        fetchClientInfos();
    }, [isOpen, registeredClients]);

    const handleClientClick = (clientId: number) => {
        onClose();
        navigation.navigate('ClientProfilePage', { clientId });
    };

    return (
        <Modal visible={isOpen} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.title}>Registered Clients</Text>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 20 }} />
                    ) : !hasLoaded ? (
                        <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 20 }} />
                    ) : registeredClients.length === 0 ? (
                        <Text style={styles.noClients}>No clients registered yet</Text>
                    ) : (
                        <FlatList
                            data={registeredClients}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => {
                                const info = clientInfos[item.id];
                                return (
                                    <TouchableOpacity onPress={() => handleClientClick(item.id)} style={styles.clientItem}>
                                        <Avatar.Text
                                            label={info?.name?.charAt(0).toUpperCase() || 'C'}
                                            size={40}
                                            style={{ backgroundColor: '#1565c0', marginRight: 12 }}
                                        />
                                        <View>
                                            <Text style={styles.clientName}>{info?.name || `Client ${item.id}`}</Text>
                                            <Text style={styles.clientEmail}>{info?.email || ''}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={{ color: '#555' }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        maxHeight: '80%',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1565c0',
        textAlign: 'center',
        marginBottom: 16,
    },
    noClients: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
    },
    clientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
    },
    clientName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1565c0',
    },
    clientEmail: {
        fontSize: 14,
        color: '#777',
    },
    closeButton: {
        marginTop: 20,
        alignItems: 'center',
    },
});
export default RegisteredClientsModal;

