const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function getFullUrl(path?: string): string {
  if (!path) return '';

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${BACKEND_URL}${cleanPath}`;
}