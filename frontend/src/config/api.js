const API_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3000';

export const API_ENDPOINTS = {
  tickets: `${API_URL}/tickets`,
};

export default API_URL;