const sanitizeHtml = require('sanitize-html');

/**
 * Limpia un valor de texto eliminando etiquetas HTML
 * y atributos potencialmente peligrosos.
 */
function sanitizeText(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

/**
 * Sanitiza los campos recibidos para un ticket.
 */
function sanitizeTicket(data = {}) {
  return {
    titulo: sanitizeText(data.titulo),
    descripcion: sanitizeText(data.descripcion),
    categoria: sanitizeText(data.categoria),
    prioridad: sanitizeText(data.prioridad),
    estado: sanitizeText(data.estado),
  };
}

module.exports = {
  sanitizeText,
  sanitizeTicket,
};