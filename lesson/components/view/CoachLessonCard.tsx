import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Lesson } from '../../types/Lesson';
import { formatLessonTimeReadable, formatPrice } from '../../../shared/services/formatService';
import { getLessonIcon } from '../../types/LessonType';

interface LessonCardsProps {
    lessons: Lesson[];
    onEdit: (lesson: Lesson) => void;
    onEditLesson: (lesson: Lesson) => void;
    onDelete: (lesson: Lesson) => void;
    onViewClients: (lesson: Lesson) => void;
}

const getCapacityColor = (registered: number, capacity: number) => {
    const ratio = registered / capacity;
    if (ratio >= 0.9) return '#d32f2f';
    if (ratio >= 0.7) return '#f57c00';
    return '#2e7d32';
};

const LessonCards: React.FC<LessonCardsProps> = ({ lessons, onEdit, onEditLesson, onDelete, onViewClients }) => {
    const renderItem = ({ item: lesson }: { item: Lesson }) => {
        const { IconComponent, iconName } = getLessonIcon(lesson.title);
        const capacityColor = getCapacityColor(lesson.registeredCount ?? 0, lesson.capacityLimit ?? 0);

        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Avatar.Icon
                        size={40}
                        icon={() => <IconComponent name={iconName} size={24} color="#fff" />}
                        style={styles.avatar}
                    />
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>{lesson.title}</Text>
                        <Text style={styles.time}>{formatLessonTimeReadable(lesson.time)}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.viewButton]}
                            onPress={() => onEdit(lesson)}
                        >
                            <Icon name="visibility" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => onEditLesson(lesson)}
                        >
                            <Icon name="edit" size={20} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => onDelete(lesson)}
                        >
                            <Icon name="delete" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.details}>
                        <View style={styles.detail}>
                            <Icon name="people" size={18} style={styles.detailIcon} />
                            <Text style={{ color: capacityColor }}>
                                {lesson.registeredCount}/{lesson.capacityLimit} registered
                            </Text>
                        </View>
                        {lesson.location && (
                            <View style={styles.detail}>
                                <Icon name="location-on" size={18} style={styles.detailIcon} />
                                <Text>
                                    {lesson.location.address || `${lesson.location.city}, ${lesson.location.country}`}
                                </Text>
                            </View>
                        )}
                    </View>

                    <TouchableOpacity 
                        style={styles.viewClientsButton}
                        onPress={() => onViewClients(lesson)}
                    >
                        <Icon name="people" size={18} color="#fff" style={styles.buttonIcon} />
                        <Text style={styles.viewClientsText}>View Registered Clients</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={lessons
                .filter(l => l.time && !isNaN(new Date(l.time).getTime()))
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())}
          
            renderItem={renderItem}
            keyExtractor={(lesson) => lesson?.id?.toString() || Math.random().toString()}
            contentContainerStyle={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#e3f2fd',
        borderBottomWidth: 1,
        borderBottomColor: '#bbdefb',
    },
    avatar: {
        backgroundColor: '#1976d2',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1565c0',
    },
    time: {
        fontSize: 14,
        color: '#546e7a',
        marginTop: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
    },
    viewButton: {
        backgroundColor: '#1976d2',
    },
    editButton: {
        backgroundColor: '#2e7d32',
    },
    deleteButton: {
        backgroundColor: '#d32f2f',
    },
    content: {
        padding: 16,
    },
    details: {
        gap: 12,
    },
    detail: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        marginRight: 8,
        color: '#757575',
    },
    viewClientsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#90caf9',
        padding: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    buttonIcon: {
        marginRight: 8,
    },
    viewClientsText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default LessonCards;
