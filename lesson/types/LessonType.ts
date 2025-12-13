import {
    MaterialIcons,
    FontAwesome5,
    MaterialCommunityIcons,
} from '@expo/vector-icons';
import { ComponentType } from 'react';

// Returns image source for lesson type title bar backgrounds
export const getLessonBackground = (type: string): any => {
    switch (type) {
        case LessonType.Tennis:
            return require('../../assets/tennis-court.jpg');
        case LessonType.Yoga:
            return require('../../assets/yoga-bg.jpg');
        case LessonType.Surf:
            return require('../../assets/surf.jpg');
        case LessonType.Football:
            return require('../../assets/football-court.jpg');
        case LessonType.Basketball:
            return require('../../assets/basketball-court.jpg');
        case LessonType.Paddle:
            return require('../../assets/paddel-court.jpg');
        case LessonType.Gym:
            return require('../../assets/gym.jpg');
        case LessonType.Boxing:
            return require('../../assets/boxing.jpg');
        default:
            return null; // fallback to solid color
    }
};

export enum LessonType {
    Tennis = 'Tennis',
    Yoga = 'Yoga',
    Surf = 'Surf',
    Football = 'Football',
    Basketball = 'Basketball',
    Paddle = 'Paddle',
    Gym = 'Gym',
    Boxing = 'Boxing',
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
        case LessonType.Gym:
            return { IconComponent: MaterialCommunityIcons, iconName: 'dumbbell' };
        case LessonType.Boxing:
            return { IconComponent: MaterialCommunityIcons, iconName: 'boxing-glove' };
        default:
            return { IconComponent: MaterialIcons, iconName: 'calendar-today' };
    }
};
