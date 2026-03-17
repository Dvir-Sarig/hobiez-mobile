import API_BASE_URL from '../../shared/config';
import SecureStorage from '../../auth/services/SecureStorage';
import { RegistrationWithPayment, PaymentMethod } from '../types/Registration';

const normalizeRegistration = (raw: any): RegistrationWithPayment => ({
  id: raw.id ?? raw.registrationId,
  lessonId: raw.lessonId,
  clientId: raw.clientId,
  registrationStatus: raw.registrationStatus ?? raw.status,
  paymentStatus: raw.paymentStatus ?? raw.payment?.status ?? 'NOT_SET',
  paymentMethod: raw.paymentMethod ?? raw.payment?.method ?? undefined,
  paymentNote: raw.paymentNote ?? raw.payment?.note ?? undefined,
});

const getAuthHeaders = async () => {
  const token = await SecureStorage.getToken();
  if (!token) throw new Error('לא נמצא אסימון אימות');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const registerToLessonWithPayment = async (
  lessonId: number
): Promise<RegistrationWithPayment> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/register`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return normalizeRegistration(data);
};

export const declarePayment = async (
  registrationId: number,
  method: PaymentMethod,
  note?: string
): Promise<RegistrationWithPayment> => {
  const headers = await getAuthHeaders();
  const body: { method: PaymentMethod; note?: string } = { method };
  if (note) body.note = note;
  const response = await fetch(
    `${API_BASE_URL}/registrations/${registrationId}/payment/declare`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    }
  );
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return normalizeRegistration(data);
};

export const cancelRegistration = async (
  registrationId: number
): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/registrations/${registrationId}/cancel`,
    {
      method: 'POST',
      headers,
    }
  );
  if (!response.ok) throw new Error(await response.text());
};

export const confirmPayment = async (
  registrationId: number
): Promise<RegistrationWithPayment> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/registrations/${registrationId}/payment/confirm`,
    {
      method: 'POST',
      headers,
    }
  );
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return normalizeRegistration(data);
};

export const rejectPayment = async (
  registrationId: number
): Promise<RegistrationWithPayment> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/registrations/${registrationId}/payment/reject`,
    {
      method: 'POST',
      headers,
    }
  );
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  return normalizeRegistration(data);
};

export const fetchLessonRegistrations = async (
  lessonId: number
): Promise<RegistrationWithPayment[]> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/registrations`,
    { headers }
  );
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return data.map(normalizeRegistration);
};

export const fetchClientRegistration = async (
  lessonId: number,
  clientId: string
): Promise<RegistrationWithPayment | null> => {
  const headers = await getAuthHeaders();
  const response = await fetch(
    `${API_BASE_URL}/lessons/${lessonId}/registrations`,
    { headers }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const registrations: RegistrationWithPayment[] = Array.isArray(data)
    ? data.map(normalizeRegistration)
    : [];
  return registrations.find(r => r.clientId === clientId && r.registrationStatus === 'ACTIVE') ?? null;
};
