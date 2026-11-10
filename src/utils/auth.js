const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if (port === '5000' || port === '5173') {
      return '/api';
    }
    return `http://${hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

export function getStoredToken() {
  return localStorage.getItem('sonabel_token');
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem('sonabel_token', token);
  } else {
    localStorage.removeItem('sonabel_token');
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem('sonabel_user');
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('sonabel_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('sonabel_user');
  }
}

export async function fetchWithAuth(url, options = {}) {
  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Une erreur est survenue.');
  }
  return data;
}
