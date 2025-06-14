import { Location } from '../../profile/types/profile';

export interface Lesson {
    id: number;
    title: string;
    description: string;
    time: string; // מומלץ להשתמש ב-ISO string (Date.toISOString())
    coachId: number;
    price: number;
    capacityLimit: number;
    duration: number; // בדקות
    location: Location;
    registeredCount?: number;
}
