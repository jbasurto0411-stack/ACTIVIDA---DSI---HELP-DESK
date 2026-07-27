import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  deleteTicket,
  getTickets,
  updateTicketStatus,
} from '../../service/ticketService';
import './TicketList.css';

function normalizeClassName(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTickets();

      console.log('Tickets recibidos:', data);

      setTickets(data);
    } catch (requestError) {
      console.error('Error al obtener los tickets:', requestError);

      setError(
        requestError.message ||
          'No fue posible obtener los tickets desde el servidor.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleStatusChange = async (ticket, nuevoEstado) => {
    const estadoAnterior = ticket.estado;

    try {
      setProcessingId(ticket.id);
      setMessage('');
      setError('');

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === ticket.id
            ? {
                ...currentTicket,
                estado: nuevoEstado,
              }
            : currentTicket,
        ),
      );

      await updateTicketStatus(ticket, nuevoEstado);

      setMessage(
        `El estado del ticket #${ticket.id} fue actualizado correctamente.`,
      );
    } catch (requestError) {
      console.error('Error al actualizar el estado:', requestError);

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === ticket.id
            ? {
                ...currentTicket,
                estado: estadoAnterior,
              }
            : currentTicket,
        ),
      );

      setError(
        requestError.message ||
          'No fue posible actualizar el estado del ticket.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (ticket) => {
    const confirmed = window.confirm(
      `¿Está seguro de eliminar el ticket #${ticket.id}: "${ticket.titulo}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(ticket.id);
      setMessage('');
      setError('');

      await deleteTicket(ticket.id);

      setTickets((currentTickets) =>
        currentTickets.filter(
          (currentTicket) => currentTicket.id !== ticket.id,
        ),
      );

      setMessage(`El ticket #${ticket.id} fue eliminado correctamente.`);
    } catch (requestError) {
      console.error('Error al eliminar el ticket:', requestError);

      setError(
        requestError.message ||
          'No fue posible eliminar la incidencia.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      ticket.id?.toString().includes(searchValue) ||
      ticket.titulo?.toLowerCase().includes(searchValue) ||
      ticket.descripcion?.toLowerCase().includes(searchValue) ||
      ticket.categoria?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === '' || ticket.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="page-container">
      <header className="ticket-list-header">
        <div className="page-header">
          <p className="tickets-eyebrow">GESTIÓN DE SOPORTE</p>

          <h1>Listado de tickets</h1>

          <p>
            Consulte, filtre, actualice y elimine las incidencias registradas.
          </p>
        </div>

        <Link className="new-ticket-button" to="/registrar-incidente">
          ＋ Nuevo ticket
        </Link>
      </header>

      {message && (
        <div className="ticket-alert ticket-alert-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="ticket-alert ticket-alert-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={loadTickets}>
            Reintentar
          </button>
        </div>
      )}

      <article className="ticket-list-card card">
        <div className="ticket-toolbar">
          <div className="search-control">
            <span>⌕</span>

            <input
              type="search"
              aria-label="Buscar tickets"
              placeholder="Buscar por ID, título o categoría..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="status-filter"
            aria-label="Filtrar por estado"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Todos los estados</option>
            <option value="Abierto">Abiertos</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Cerrado">Cerrados</option>
          </select>
        </div>

        {loading ? (
          <div className="tickets-state">
            <div className="loading-spinner" />

            <p>Cargando tickets desde la base de datos...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="tickets-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Incidente</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => {
                  const isProcessing = processingId === ticket.id;

                  return (
                    <tr key={ticket.id}>
                      <td data-label="ID">
                        <strong>#{ticket.id}</strong>
                      </td>

                      <td data-label="Incidente">
                        <div className="ticket-title-cell">
                          <span className="ticket-table-icon">▤</span>

                          <div>
                            <strong>{ticket.titulo}</strong>

                            <small>
                              {ticket.descripcion || 'Sin descripción'}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td data-label="Categoría">
                        {ticket.categoria}
                      </td>

                      <td data-label="Prioridad">
                        <span
                          className={`table-badge priority-${normalizeClassName(
                            ticket.prioridad,
                          )}`}
                        >
                          {ticket.prioridad}
                        </span>
                      </td>

                      <td data-label="Estado">
                        <select
                          className={`ticket-status-select status-${normalizeClassName(
                            ticket.estado,
                          )}`}
                          value={ticket.estado}
                          disabled={isProcessing}
                          onChange={(event) =>
                            handleStatusChange(ticket, event.target.value)
                          }
                        >
                          <option value="Abierto">Abierto</option>
                          <option value="En Progreso">En Progreso</option>
                          <option value="Cerrado">Cerrado</option>
                        </select>
                      </td>

                      <td data-label="Fecha">
                        {ticket.fecha_creacion
                          ? new Date(
                              ticket.fecha_creacion,
                            ).toLocaleDateString('es-EC')
                          : 'Sin fecha'}
                      </td>

                      <td data-label="Acciones">
                        <div className="table-actions">
                          <button
                            className="delete-button"
                            type="button"
                            title="Eliminar incidencia"
                            aria-label={`Eliminar ticket ${ticket.id}`}
                            disabled={isProcessing}
                            onClick={() => handleDelete(ticket)}
                          >
                            {isProcessing ? '…' : '×'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredTickets.length === 0 && (
                  <tr>
                    <td className="empty-table" colSpan="7">
                      {tickets.length === 0
                        ? 'No existen tickets registrados.'
                        : 'No se encontraron tickets con los filtros utilizados.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <footer className="table-footer">
          Mostrando {filteredTickets.length} de {tickets.length} tickets
        </footer>
      </article>
    </section>
  );
}

export default TicketList;