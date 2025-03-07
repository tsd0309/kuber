export function checkAuth() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }
  return false;
} 