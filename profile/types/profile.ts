import { LessonType } from '../../lesson/types/LessonType';

export interface Location {
    city: string;
    country: string;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

export interface Education {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
    gpa?: number | null;
    achievements?: string[] | null;
}

export interface Certification {
    name: string;
    issuingOrganization: string;
    issueDate: string;
    expiryDate?: string | null;
    credentialId?: string | null;
    credentialUrl?: string | null;
}

export interface GenericProfileInfo {
    name: string;
    email: string;
    userDescription: string;
    location: Location;
    profilePictureUrl?: string | null;
    languages: string[];
    phoneNumber?: string | null;
}

export interface CoachProfile {
    genericProfile: GenericProfileInfo;
    experience: string;
    education: Education[];
    skills: LessonType[];
    certifications?: Certification[];
}

export interface ClientProfile {
    genericProfile: GenericProfileInfo;
    hobbies: string[];
}

export type ProfileData = CoachProfile | ClientProfile;

export const SUPPORTED_LANGUAGES = [
    'English',
    'Hebrew',
    'Russian',
    'French',
    'Spanish',
    'German',
    'Arabic',
    'Chinese',
    'Japanese',
    'Italian'
] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const SUPPORTED_HOBBIES: LessonType[] = [
    LessonType.Tennis,
    LessonType.Yoga,
    LessonType.Surf,
    LessonType.Football,
    LessonType.Basketball,
    LessonType.Paddle,
    LessonType.Gym,
    LessonType.Boxing,
];
export type SupportedHobby = LessonType; 