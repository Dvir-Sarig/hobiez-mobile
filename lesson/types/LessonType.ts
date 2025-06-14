import {
    MaterialIcons,
    FontAwesome5,
    Ionicons,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import { ComponentType } from 'react';

export enum LessonType {
    Tennis = 'Tennis',
    Yoga = 'Yoga',
    Surf = 'Surf',
    Football = 'Football',
    Basketball = 'Basketball',
    Paddle = 'Paddle',
}

export const lessonTypes = Object.values(LessonType);

export const getLessonIcon = (
    type: string
): { IconComponent: ComponentType<any>; iconName: string } => {
    switch (type) {
        case LessonType.Tennis:
            return { IconComponent: MaterialCommunityIcons, iconName: 'tennis' };

        case LessonType.Paddle:
            return { IconComponent: FontAwesome5, iconName: 'table-tennis' };

        case LessonType.Yoga:
            return { IconComponent: MaterialCommunityIcons, iconName: 'yoga' };

        case LessonType.Football:
            return { IconComponent: MaterialIcons, iconName: 'sports-soccer' };

        case LessonType.Basketball:
            return { IconComponent: MaterialIcons, iconName: 'sports-basketball' };

        case LessonType.Surf:
            return { IconComponent: MaterialIcons, iconName: 'waves' };

        default:
            return { IconComponent: MaterialIcons, iconName: 'calendar-today' };
    }
};
