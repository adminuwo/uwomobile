/**
 * Utility to extract and format a user's display name cleanly.
 * Avoids displaying raw email addresses or technical placeholders (test, null, user),
 * and prioritizes the human profile name entered by the user.
 */

export function isInvalidDisplayName(name?: string | null): boolean {
  if (!name || typeof name !== 'string') return true;
  const trimmed = name.trim();
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  if (['test', 'user', 'null', 'undefined', 'n/a', 'none', 'unknown', 'default'].includes(lower)) {
    return true;
  }
  // If it's an email address, it is not a valid display name
  if (lower.includes('@')) {
    return true;
  }
  return false;
}

export function formatEmailDisplayName(email?: string | null): string {
  if (!email || typeof email !== 'string' || !email.includes('@')) return '';
  const prefix = email.split('@')[0].replace(/[._-]/g, ' ').trim();
  if (!prefix) return '';
  return prefix
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function getUserDisplayName(user?: any, fallback = 'User'): string {
  if (!user) return fallback;

  // 1. Personal full name (first_name + last_name)
  const userFullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  if (!isInvalidDisplayName(userFullName)) {
    return userFullName;
  }

  // 2. Explicit personal name (if set and not an email)
  if (!isInvalidDisplayName(user.name)) {
    return user.name.trim();
  }

  // 3. First name alone
  if (!isInvalidDisplayName(user.first_name)) {
    return user.first_name.trim();
  }

  // 4. Client / Organization business name
  if (!isInvalidDisplayName(user.client?.business_name)) {
    return user.client.business_name.trim();
  }
  if (!isInvalidDisplayName(user.client?.company_name)) {
    return user.client.company_name.trim();
  }
  if (!isInvalidDisplayName(user.client?.name)) {
    return user.client.name.trim();
  }

  // 5. Explicit company_name on user
  if (!isInvalidDisplayName(user.company_name)) {
    return user.company_name.trim();
  }

  // 6. Username (if not an email)
  if (!isInvalidDisplayName(user.username)) {
    return user.username.trim();
  }

  // 7. Clean capitalized prefix from email (e.g. connect@uwo24.com -> Connect)
  const cleanEmail = formatEmailDisplayName(user.email);
  if (cleanEmail) {
    return cleanEmail;
  }

  return fallback;
}
