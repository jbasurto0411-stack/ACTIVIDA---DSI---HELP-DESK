import { API_ENDPOINTS } from '../config/api';

import { sanitizeObject } from '../utils/sanitize';

/**
 * Procesa las respuestas enviadas por la API.
 */
async function processResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      data?.mensaje ||
      data?.message ||
      data?.error ||
      `Error HTTP ${response.status}`;

    throw new Error(message);
  }

  return data;
}

/**
 * Listar todos los tickets.
 * GET /tickets
 */
export async function getTickets() {
  const response = await fetch(API_ENDPOINTS.tickets, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const data = await processResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  return data?.tickets || data?.data || [];
}

/**
 * Crear un ticket.
 * POST /tickets
 */
export async function createTicket(ticket) {
  const sanitizedTicket = sanitizeObject(ticket);

  const response = await fetch(API_ENDPOINTS.tickets, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(sanitizedTicket),
  });

  const data = await processResponse(response);

  return data?.ticket || data?.data || data;
}

/**
 * Actualizar los datos de un ticket.
 * PUT /tickets/:id
 */
export async function updateTicket(id, ticket) {
  const sanitizedTicket = sanitizeObject(ticket);

  const response = await fetch(`${API_ENDPOINTS.tickets}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(sanitizedTicket),
  });

  const data = await processResponse(response);

  return data?.ticket || data?.data || data;
}

/**
 * Actualizar únicamente el estado de un ticket.
 */
export async function updateTicketStatus(ticket, nuevoEstado) {
  return updateTicket(ticket.id, {
    titulo: ticket.titulo,
    descripcion: ticket.descripcion,
    categoria: ticket.categoria,
    prioridad: ticket.prioridad,
    estado: nuevoEstado,
  });
}

/**
 * Eliminar un ticket.
 * DELETE /tickets/:id
 */
export async function deleteTicket(id) {
  const response = await fetch(`${API_ENDPOINTS.tickets}/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
    },
  });

  return processResponse(response);
}