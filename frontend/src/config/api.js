const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error(
    'La variable de entorno VITE_API_URL no está configurada.'
  );
}

// Elimina una barra final en caso de que exista.
const BASE_URL = API_URL.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  tickets: `${BASE_URL}/tickets`,
};