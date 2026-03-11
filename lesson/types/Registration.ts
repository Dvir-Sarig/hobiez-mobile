export type RegistrationStatus = 'ACTIVE' | 'CANCELED';

export type PaymentStatus = 'NOT_SET' | 'PENDING' | 'CONFIRMED' | 'REJECTED';

export type PaymentMethod = 'BIT' | 'PAYBOX' | 'CASH' | 'OTHER';

export interface RegistrationWithPayment {
  id: number;
  lessonId: number;
  clientId: string;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentNote?: string;
}
