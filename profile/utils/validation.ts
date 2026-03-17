import { ClientProfile, CoachProfile, Education } from '../types/profile';
import { LessonType } from '../../lesson/types/LessonType';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const PHONE_REGEX = /^\+?[0-9]{7,15}$/;

const minLen = (val: string | undefined | null) => (val || '').trim().length;

const validateEducation = (education: Education[], errors: Record<string,string>) => {
  education.forEach((e, idx) => {
    if (!e.institution?.trim()) errors[`education.${idx}.institution`] = 'מוסד נדרש';
    if (!e.degree?.trim()) errors[`education.${idx}.degree`] = 'תואר נדרש';
    if (!e.fieldOfStudy?.trim()) errors[`education.${idx}.fieldOfStudy`] = 'תחום לימוד נדרש';
    if (!e.startDate?.trim()) errors[`education.${idx}.startDate`] = 'תאריך התחלה נדרש';
  });
};

export const validateClientProfile = (data: ClientProfile): ValidationResult => {
  const errors: Record<string,string> = {};
  const gp = data.genericProfile;

  if (!gp.name?.trim()) errors['genericProfile.name'] = 'שם חסר';
  if (!gp.email?.trim()) errors['genericProfile.email'] = 'אימייל חסר';
  if (gp.phoneNumber && !PHONE_REGEX.test(gp.phoneNumber.trim())) errors['genericProfile.phoneNumber'] = 'מספר טלפון לא תקין';
  if (minLen(gp.userDescription) < 10) errors['genericProfile.userDescription'] = 'תיאור קצר מדי (לפחות 10 תווים)';
  if (!gp.location?.city?.trim()) errors['genericProfile.location.city'] = 'עיר נדרשת';
  if (!gp.location?.country?.trim()) errors['genericProfile.location.country'] = 'מדינה נדרשת';
  if (!gp.languages || gp.languages.length === 0) errors['genericProfile.languages'] = 'בחר לפחות שפה אחת';
  if (!data.hobbies || data.hobbies.length === 0) errors['hobbies'] = 'בחר לפחות תחביב אחד';

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateCoachProfile = (data: CoachProfile): ValidationResult => {
  const errors: Record<string,string> = {};
  const gp = data.genericProfile;

  if (!gp.name?.trim()) errors['genericProfile.name'] = 'שם חסר';
  if (!gp.email?.trim()) errors['genericProfile.email'] = 'אימייל חסר';
  if (gp.phoneNumber && !PHONE_REGEX.test(gp.phoneNumber.trim())) errors['genericProfile.phoneNumber'] = 'מספר טלפון לא תקין';
  if (minLen(gp.userDescription) < 20) errors['genericProfile.userDescription'] = 'תיאור קצר מדי (לפחות 20 תווים)';
  if (!gp.location?.city?.trim()) errors['genericProfile.location.city'] = 'עיר נדרשת';
  if (!gp.location?.country?.trim()) errors['genericProfile.location.country'] = 'מדינה נדרשת';
  if (!gp.languages || gp.languages.length === 0) errors['genericProfile.languages'] = 'בחר לפחות שפה אחת';

  if (minLen(data.experience) < 30) errors['experience'] = 'קטע ניסיון קצר מדי (לפחות 30 תווים)';
  if (!data.skills || data.skills.length === 0) errors['skills'] = 'הוסף לפחות כישור אחד';

  if (data.education) validateEducation(data.education, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const firstError = (errors: Record<string,string>): string | null => {
  const keys = Object.keys(errors);
  return keys.length ? errors[keys[0]] : null;
};
