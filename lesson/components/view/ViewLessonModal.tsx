import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable } from '../../../shared/services/formatService';
import { formatPrice } from '../../../shared/services/formatService';

interface ViewLessonModalProps {
    lesson: Lesson | null;
    isOpen: boolean;
    onClose: () => void;
    onEditClick: (lesson: Lesson) => void;
    onViewClients: (lesson: Lesson) => void;
    onDelete: (lesson: Lesson) => void;
}

const getCapacityColor = (registered: number, limit: number) => {
    const ratio = registered / limit;
    if (ratio >= 0.9) return '#d32f2f';
    if (ratio >= 0.5) return '#ed6c02';
    return '#2e7d32';
};

const ViewLessonModal: React.FC<ViewLessonModalProps> = ({ 
    lesson, 
    isOpen, 
    onClose, 
    onEditClick, 
    onViewClients,
    onDelete 
}) => {
    if (!lesson) return null;

    return (
        <Modal visible={isOpen} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{lesson.title}</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        <InfoCard icon="description" label="Description" value={lesson.description} />
                        <InfoCard icon="calendar-today" label="Time" value={formatLessonTimeReadable(lesson.time)} />
                        {lesson.location && (
                            <InfoCard
                                icon="location-on"
                                label="Location"
                                value={lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                            />
                        )}
                        <View style={styles.row}>
                            <InfoCard 
                                icon="timer" 
                                label="Duration" 
                                value={`${lesson.duration} min`}
                                style={styles.halfCard}
                            />
                            <InfoCard 
                                icon="attach-money" 
                                label="Price" 
                                value={formatPrice(lesson.price)}
                                style={styles.halfCard}
                            />
                        </View>
                        <InfoCard
                            icon="people-alt"
                            label="Participants"
                            value={`${lesson.registeredCount ?? 0} / ${lesson.capacityLimit ?? 0}`}
                            valueColor={getCapacityColor(lesson.registeredCount ?? 0, lesson.capacityLimit ?? 0)}
                        />

                        <View style={styles.buttonContainer}>
                            <TouchableOpacity 
                                style={styles.viewClientsButton} 
                                onPress={() => onViewClients(lesson)}
                            >
                                <Icon name="people" size={20} color="#1976d2" style={styles.buttonIcon} />
                                <Text style={styles.viewClientsButtonText}>View Registered</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.editButton} 
                                onPress={() => onEditClick(lesson)}
                            >
                                <Icon name="edit" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.editButtonText}>Edit Lesson</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.deleteButton} 
                                onPress={() => onDelete(lesson)}
                            >
                                <Icon name="delete" size={20} color="#fff" style={styles.buttonIcon} />
                                <Text style={styles.deleteButtonText}>Delete Lesson</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const InfoCard = ({ 
    icon, 
    label, 
    value, 
    valueColor,
    style 
}: { 
    icon: string; 
    label: string; 
    value: string; 
    valueColor?: string;
    style?: any;
}) => (
    <View style={[styles.card, style]}>
        <Icon name={icon} size={22} color="#1976d2" style={styles.cardIcon} />
        <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={[styles.cardValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        maxHeight: '90%',
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1976d2',
        flex: 1,
        marginRight: 10,
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfCard: {
        flex: 1,
    },
    cardIcon: {
        marginRight: 12,
    },
    cardTextContainer: {
        flex: 1,
    },
    cardLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 2,
    },
    cardValue: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    buttonContainer: {
        gap: 12,
        marginTop: 16,
    },
    viewClientsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1976d2',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#1976d2',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#d32f2f',
    },
    buttonIcon: {
        marginRight: 8,
    },
    viewClientsButtonText: {
        color: '#1976d2',
        fontSize: 15,
        fontWeight: '500',
    },
    editButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '500',
    },
});

export default ViewLessonModal;
