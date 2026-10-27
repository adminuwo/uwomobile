/**
 * Password validation and strength estimation utility for mobile app.
 * Keeps 100% parity with web frontend and backend validation.
 */

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
}

export type PasswordStrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  label: string;
  score: number; // 0 to 4
  color: string;
}

export interface PasswordEvaluation {
  criteria: PasswordCriterion[];
  strength: PasswordStrength;
  isValid: boolean;
  score: number; // 0 to 5
}

export const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/;

export function evaluatePassword(password: string = ''): PasswordEvaluation {
  const pwd = password || '';

  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = SPECIAL_CHAR_REGEX.test(pwd);

  const criteria: PasswordCriterion[] = [
    { id: 'length', label: 'At least 8 characters', met: hasLength },
    { id: 'upper', label: 'One uppercase letter (A-Z)', met: hasUpper },
    { id: 'lower', label: 'One lowercase letter (a-z)', met: hasLower },
    { id: 'number', label: 'One number (0-9)', met: hasNumber },
    { id: 'special', label: 'One special character (!@#$%^&*)', met: hasSpecial },
  ];

  const metCount = criteria.filter((c) => c.met).length;
  const isValid = metCount === 5;

  let strength: PasswordStrength;
  if (!pwd || pwd.length === 0) {
    strength = { level: 'weak', label: 'Very Weak', score: 0, color: '#ef4444' };
  } else if (metCount <= 2 || pwd.length < 8) {
    strength = { level: 'weak', label: 'Weak', score: 1, color: '#ef4444' };
  } else if (metCount === 3) {
    strength = { level: 'fair', label: 'Fair', score: 2, color: '#f59e0b' };
  } else if (metCount === 4) {
    strength = { level: 'good', label: 'Good', score: 3, color: '#3b82f6' };
  } else {
    strength = { level: 'strong', label: 'Strong', score: 4, color: '#10b981' };
  }

  return {
    criteria,
    strength,
    isValid,
    score: metCount,
  };
}
