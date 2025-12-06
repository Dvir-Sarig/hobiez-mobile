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
    if (!e.institution?.trim()) errors[`education.${idx}.institution`] = 'Institution is required';
    if (!e.degree?.trim()) errors[`education.${idx}.degree`] = 'Degree is required';
    if (!e.fieldOfStudy?.trim()) errors[`education.${idx}.fieldOfStudy`] = 'Field of study is required';
    if (!e.startDate?.trim()) errors[`education.${idx}.startDate`] = 'Start date is required';
  });
};

export const validateClientProfile = (data: ClientProfile): ValidationResult => {
  const errors: Record<string,string> = {};
  const gp = data.genericProfile;

  if (!gp.name?.trim()) errors['genericProfile.name'] = 'Name missing';
  if (!gp.email?.trim()) errors['genericProfile.email'] = 'Email missing';
  if (gp.phoneNumber && !PHONE_REGEX.test(gp.phoneNumber.trim())) errors['genericProfile.phoneNumber'] = 'Invalid phone number';
  if (minLen(gp.userDescription) < 10) errors['genericProfile.userDescription'] = 'Description too short (min 10 chars)';
  if (!gp.location?.city?.trim()) errors['genericProfile.location.city'] = 'City required';
  if (!gp.location?.country?.trim()) errors['genericProfile.location.country'] = 'Country required';
  if (!gp.languages || gp.languages.length === 0) errors['genericProfile.languages'] = 'Select at least one language';
  if (!data.hobbies || data.hobbies.length === 0) errors['hobbies'] = 'Select at least one hobby';

  return { valid: Object.keys(errors).length === 0, errors };
};

export const validateCoachProfile = (data: CoachProfile): ValidationResult => {
  const errors: Record<string,string> = {};
  const gp = data.genericProfile;

  if (!gp.name?.trim()) errors['genericProfile.name'] = 'Name missing';
  if (!gp.email?.trim()) errors['genericProfile.email'] = 'Email missing';
  if (gp.phoneNumber && !PHONE_REGEX.test(gp.phoneNumber.trim())) errors['genericProfile.phoneNumber'] = 'Invalid phone number';
  if (minLen(gp.userDescription) < 20) errors['genericProfile.userDescription'] = 'Description too short (min 20 chars)';
  if (!gp.location?.city?.trim()) errors['genericProfile.location.city'] = 'City required';
  if (!gp.location?.country?.trim()) errors['genericProfile.location.country'] = 'Country required';
  if (!gp.languages || gp.languages.length === 0) errors['genericProfile.languages'] = 'Select at least one language';

  if (minLen(data.experience) < 30) errors['experience'] = 'Experience section too short (min 30 chars)';
  if (!data.skills || data.skills.length === 0) errors['skills'] = 'Add at least one Skill';

  if (data.education) validateEducation(data.education, errors);

  return { valid: Object.keys(errors).length === 0, errors };
};

export const firstError = (errors: Record<string,string>): string | null => {
  const keys = Object.keys(errors);
  return keys.length ? errors[keys[0]] : null;
};
