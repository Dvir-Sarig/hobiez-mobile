import API_BASE_URL from '../../shared/config';
import { Lesson } from '../types/Lesson';

const defaultHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
});

export const fetchLessons = async (token: string): Promise<Lesson[]> => {
    const response = await fetch(`${API_BASE_URL}/available-lessons`, {
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch lessons');
    return await response.json();
};

export const registerToLesson = async (
    clientId: number,
    lessonId: number,
    token: string
): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/register-client-to-lesson`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ clientId, lessonId }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
};

export const deleteClientFromLesson = async (
    clientId: number,
    lessonId: number,
    token: string
): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/delete-client-from-lesson`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ clientId, lessonId }),
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
};

export const deleteLesson = async (lessonId: number, token: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/delete-lesson/${lessonId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text);
    return text;
};

export const fetchClientRegisteredLessons = async (
    clientId: string,
    token: string
): Promise<Lesson[]> => {
    const response = await fetch(`${API_BASE_URL}/client-lessons/${clientId}`, {
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch registered lessons');
    return await response.json();
};

export const searchLessons = async (
    searchRequest: any,
    token: string
): Promise<Lesson[]> => {
    const response = await fetch(`${API_BASE_URL}/search-lessons`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify(searchRequest),
    });
    if (!response.ok) throw new Error('Failed to search lessons');
    return await response.json();
};

export const fetchLessonRegistrationCount = async (
    lessonId: number,
    token: string
): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/get-registers-number/${lessonId}`, {
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error(`Failed to fetch registration count for lesson ${lessonId}`);
    return await response.json();
};

export const fetchRegisteredClients = async (
    lessonId: number,
    token: string
): Promise<number[]> => {
    const response = await fetch(`${API_BASE_URL}/get-registered-clients/${lessonId}`, {
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error(`Failed to fetch registered clients for lesson ${lessonId}`);
    return await response.json();
};

export const fetchCoachLessons = async (
    coachId: string,
    token: string
): Promise<Lesson[]> => {
    const response = await fetch(`${API_BASE_URL}/coach-lessons/${coachId}`, {
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch lessons');

    const lessons = await response.json();
    return await Promise.all(
        lessons.map(async (lesson: Lesson) => {
            const registeredCount = await fetchLessonRegistrationCount(lesson.id, token);
            return { ...lesson, registeredCount };
        })
    );
};

export const createLesson = async (
    newLesson: any,
    coachId: number,
    token: string
): Promise<Lesson> => {
    const response = await fetch(`${API_BASE_URL}/create-lesson`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({
            ...newLesson,
            coachId,
            price: parseFloat(newLesson.price),
            capacityLimit: parseInt(newLesson.capacityLimit, 10),
            duration: parseInt(newLesson.duration, 10),
            location: newLesson.location,
        }),
    });
    if (!response.ok) throw new Error(await response.text());
    return await response.json();
};

export const editLesson = async (
    lessonId: number,
    editData: any,
    token: string
): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/edit-lesson/${lessonId}`, {
        method: 'POST',
        headers: defaultHeaders(token),
        body: JSON.stringify({ ...editData, location: editData.location }),
    });
    const message = await response.text();
    if (!response.ok) throw new Error(`Failed to edit lesson: ${message}`);
    return message;
};

export const fetchLessonsWithRegistrationCounts = async (
    lessons: Lesson[],
    token: string
): Promise<Lesson[]> => {
    return await Promise.all(
        lessons.map(async (lesson: Lesson) => {
            try {
                const registeredCount = await fetchLessonRegistrationCount(lesson.id, token);
                return { ...lesson, registeredCount };
            } catch {
                return { ...lesson, registeredCount: 0 };
            }
        })
    );
};

export const fetchSingleLesson = async (
    lessonId: number,
    token: string
): Promise<Lesson> => {
    const response = await fetch(`${API_BASE_URL}/get-single-lesson/${lessonId}`, {
        method: 'POST',
        headers: defaultHeaders(token),
    });
    if (!response.ok) throw new Error(await response.text());
    const lesson = await response.json();
    const registeredCount = await fetchLessonRegistrationCount(lessonId, token);
    return { ...lesson, registeredCount };
};
