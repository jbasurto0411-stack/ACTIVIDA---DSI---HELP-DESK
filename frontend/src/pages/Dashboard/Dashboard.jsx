import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { getTickets } from '../../service/ticketService';
import './Dashboard.css';

function normalizeClassName(value = '') {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

function getMostFrequentValue(items, property) {
  if (!items.length) {
    return 'Sin información';
  }

  const frequencies = items.reduce((accumulator, item) => {
    const value = item[property];

    if (!value) {
      return accumulator;
    }

    accumulator[value] = (accumulator[value] || 0) + 1;

    return accumulator;
  }, {});

  const entries = Object.entries(frequencies);

  if (!entries.length) {
    return 'Sin información';
  }

  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTickets();

      console.log('Tickets del dashboard:', data);

      setTickets(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error('Error al cargar el dashboard:', requestError);

      setError(
        requestError.message ||
          'No fue posible cargar la información del panel.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const dashboardData = useMemo(() => {
    const totalTickets = tickets.length;

    const ticketsAbiertos = tickets.filter(
      (ticket) => ticket.estado === 'Abierto',
    ).length;

    const ticketsEnProgreso = tickets.filter(
      (ticket) => ticket.estado === 'En Progreso',
    ).length;

    const ticketsCerrados = tickets.filter(
      (ticket) => ticket.estado === 'Cerrado',
    ).length;

    const porcentajeResueltos =
      totalTickets > 0
        ? Math.round((ticketsCerrados / totalTickets) * 100)
        : 0;

    const prioridadFrecuente = getMostFrequentValue(
      tickets,
      'prioridad',
    );

    const categoriaPrincipal = getMostFrequentValue(
      tickets,
      'categoria',
    );

    const ticketsRecientes = [...tickets]
      .sort((ticketA, ticketB) => {
        const fechaA = new Date(
          ticketA.fecha_creacion || ticketA.fecha || 0,
        ).getTime();

        const fechaB = new Date(
          ticketB.fecha_creacion || ticketB.fecha || 0,
        ).getTime();

        /*
         * Si no existen fechas válidas, se ordenan por ID.
         */
        if (Number.isNaN(fechaA) || Number.isNaN(fechaB)) {
          return Number(ticketB.id) - Number(ticketA.id);
        }

        return fechaB - fechaA;
      })
      .slice(0, 3);

    return {
      totalTickets,
      ticketsAbiertos,
      ticketsEnProgreso,
      ticketsCerrados,
      porcentajeResueltos,
      prioridadFrecuente,
      categoriaPrincipal,
      ticketsRecientes,
    };
  }, [tickets]);

  if (loading) {
    return (
      <section className="page-container">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Cargando información del panel...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-container">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">CENTRO DE SOPORTE</p>

          <h1>Panel de control</h1>

          <p>
            Supervisa las incidencias reportadas y consulta el estado
            general del servicio técnico.
          </p>
        </div>

        <Link className="new-ticket-button" to="/registrar-incidente">
          ＋ Nuevo incidente
        </Link>
      </header>

      {error && (
        <div className="ticket-alert ticket-alert-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={loadTickets}>
            Reintentar
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        <article className="stat-card card">
          <div className="stat-icon stat-icon-total">▤</div>

          <div>
            <p>Total de tickets</p>
            <strong>{dashboardData.totalTickets}</strong>
            <small>Registrados en el sistema</small>
          </div>
        </article>

        <article className="stat-card card">
          <div className="stat-icon stat-icon-open">!</div>

          <div>
            <p>Tickets abiertos</p>
            <strong>{dashboardData.ticketsAbiertos}</strong>
            <small>Requieren atención</small>
          </div>
        </article>

        <article className="stat-card card">
          <div className="stat-icon stat-icon-progress">↻</div>

          <div>
            <p>En progreso</p>
            <strong>{dashboardData.ticketsEnProgreso}</strong>
            <small>Atendidos actualmente</small>
          </div>
        </article>

        <article className="stat-card card">
          <div className="stat-icon stat-icon-closed">✓</div>

          <div>
            <p>Tickets cerrados</p>
            <strong>{dashboardData.ticketsCerrados}</strong>
            <small>Incidencias solucionadas</small>
          </div>
        </article>
      </div>

      <div className="dashboard-content">
        <article className="recent-tickets-card card">
          <header className="card-heading">
            <div>
              <h2>Tickets recientes</h2>
              <p>Últimas incidencias registradas</p>
            </div>

            <Link to="/tickets">Ver todos</Link>
          </header>

          <div className="recent-tickets-list">
            {dashboardData.ticketsRecientes.map((ticket) => (
              <div className="recent-ticket-item" key={ticket.id}>
                <strong className="recent-ticket-id">
                  #{ticket.id}
                </strong>

                <div className="recent-ticket-information">
                  <strong>{ticket.titulo}</strong>

                  <div className="recent-ticket-details">
                    <span>{ticket.categoria}</span>

                    <span
                      className={`priority-badge priority-${normalizeClassName(
                        ticket.prioridad,
                      )}`}
                    >
                      {ticket.prioridad}
                    </span>
                  </div>
                </div>

                <span
                  className={`status-badge status-${normalizeClassName(
                    ticket.estado,
                  )}`}
                >
                  {ticket.estado}
                </span>
              </div>
            ))}

            {dashboardData.ticketsRecientes.length === 0 && (
              <div className="dashboard-empty">
                No existen tickets registrados.
              </div>
            )}
          </div>
        </article>

        <aside className="support-summary card">
          <header className="card-heading">
            <div>
              <h2>Resumen de soporte</h2>
              <p>Información general</p>
            </div>
          </header>

          <div className="resolved-summary">
            <div className="resolved-summary-heading">
              <span>Tickets resueltos</span>

              <strong>
                {dashboardData.porcentajeResueltos}%
              </strong>
            </div>

            <div className="progress-bar">
              <div
                className="progress-bar-value"
                style={{
                  width: `${dashboardData.porcentajeResueltos}%`,
                }}
              />
            </div>
          </div>

          <div className="support-information">
            <div className="support-information-item">
              <span>Tickets registrados</span>
              <strong>{dashboardData.totalTickets}</strong>
            </div>

            <div className="support-information-item">
              <span>Prioridad más frecuente</span>
              <strong>{dashboardData.prioridadFrecuente}</strong>
            </div>

            <div className="support-information-item">
              <span>Categoría principal</span>
              <strong>{dashboardData.categoriaPrincipal}</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Dashboard;