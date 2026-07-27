import DOMPurify from 'dompurify';

/**
 * Elimina etiquetas HTML y contenido potencialmente peligroso.
 */
export function sanitizeText(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}

/**
 * Desinfecta todas las propiedades de texto de un objeto.
 */
export function sanitizeObject(object) {
  return Object.entries(object).reduce((sanitizedObject, [key, value]) => {
    sanitizedObject[key] =
      typeof value === 'string' ? sanitizeText(value) : value;

    return sanitizedObject;
  }, {});
}