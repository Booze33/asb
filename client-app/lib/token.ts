// Token storage module - breaks circular dependency between auth.tsx and api.ts
let _token: string | null = null;

export function getToken(): string | null {
  // Try memory first, then sessionStorage as a fallback across page refreshes
  if (_token) return _token;
  if (typeof window !== 'undefined') {
    _token = sessionStorage.getItem('admin_token');
  }
  return _token;
}

export function setToken(token: string | null): void {
  _token = token;
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('admin_token', token);
    } else {
      sessionStorage.removeItem('admin_token');
    }
  }
}