import { env } from '../config/env';

/**
 * Validates and safely resolves an image URI.
 * Returns null if the URI is invalid, a placeholder file that does not exist,
 * or not a valid network / data / file URI.
 */
export function resolveValidImageUri(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Reject placeholder or invalid paths
  if (
    !trimmed ||
    trimmed === '/' ||
    trimmed.toLowerCase().includes('download (3).gif') ||
    trimmed.toLowerCase().includes('undefined') ||
    trimmed.toLowerCase().includes('null')
  ) {
    return null;
  }

  // Already a full URL or data URI
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('file://')
  ) {
    return trimmed;
  }

  // Prepend backend base URL if relative media path (e.g. /media/...)
  const baseUrl = env.API_BASE_URL || 'http://192.168.29.238:8000';
  if (trimmed.startsWith('/')) {
    return `${baseUrl}${trimmed}`;
  }

  return `${baseUrl}/${trimmed}`;
}
