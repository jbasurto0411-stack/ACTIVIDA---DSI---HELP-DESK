import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createTicket } from '../../services/ticketService';
import { sanitizeObject } from '../../utils/sanitize';
import './IncidentForm.css';

const initialForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  prioridad: '',
};

function IncidentForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setMessage('');
    setMessageType('');
  };

  const validateForm = () => {
    const titulo = formData.titulo.trim();
    const descripcion = formData.descripcion.trim();

    const categoriasPermitidas = [
      'Hardware',
      'Software',
      'Redes',
      'Acceso',
      'Otros',
    ];

    const prioridadesPermitidas = [
      'Baja',
      'Media',
      'Alta',
      'Crítica',
    ];

    if (
      !titulo ||
      !descripcion ||
      !formData.categoria ||
      !formData.prioridad
    ) {
      return 'Complete todos los campos obligatorios.';
    }

    if (titulo.length < 5 || titulo.length > 150) {
      return 'El título debe contener entre 5 y 150 caracteres.';
    }

    if (descripcion.length < 10 || descripcion.length > 1000) {
      return 'La descripción debe contener entre 10 y 1000 caracteres.';
    }

    if (!categoriasPermitidas.includes(formData.categoria)) {
      return 'La categoría seleccionada no es válida.';
    }

    if (!prioridadesPermitidas.includes(formData.prioridad)) {
      return 'La prioridad seleccionada no es válida.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setMessage(validationError);
      setMessageType('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage('');
      setMessageType('');

      const newTicket = sanitizeObject({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        prioridad: formData.prioridad,
        estado: 'Abierto',
      });

      if (!newTicket.titulo || !newTicket.descripcion) {
        setMessage(
          'El título o la descripción contienen información no válida.',
        );
        setMessageType('error');
        return;
      }

      await createTicket(newTicket);

      setFormData(initialForm);
      setMessage('Incidente registrado correctamente.');
      setMessageType('success');

      setTimeout(() => {
        navigate('/tickets');
      }, 1000);
    } catch (error) {
      console.error('Error al crear el ticket:', error);

      setMessage(
        error.message ||
          'No fue posible registrar el incidente. Intente nuevamente.',
      );

      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setMessage('');
    setMessageType('');
  };

  return (
    <section className="page-container">
      <header className="page-header">
        <p className="form-eyebrow">NUEVA SOLICITUD</p>

        <h1>Registro de incidentes</h1>

        <p>
          Complete la información del inconveniente para generar un nuevo
          ticket de soporte.
        </p>
      </header>

      <div className="incident-layout">
        <form className="incident-form card" onSubmit={handleSubmit}>
          <div className="form-section-heading">
            <div className="form-section-number">1</div>

            <div>
              <h2>Información del incidente</h2>
              <p>Describa claramente el problema presentado.</p>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="titulo">
              Título del incidente <span>*</span>
            </label>

            <input
              id="titulo"
              name="titulo"
              type="text"
              minLength="5"
              maxLength="150"
              required
              autoComplete="off"
              placeholder="Ejemplo: No puedo acceder al sistema"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              Descripción detallada <span>*</span>
            </label>

            <textarea
              id="descripcion"
              name="descripcion"
              rows="7"
              minLength="10"
              maxLength="1000"
              required
              placeholder="Explique el problema presentado..."
              value={formData.descripcion}
              onChange={handleChange}
            />

            <small>{formData.descripcion.length}/1000 caracteres</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="categoria">
                Categoría <span>*</span>
              </label>

              <select
                id="categoria"
                name="categoria"
                required
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="">Seleccione una categoría</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Red">Red</option>
                <option value="Acceso">Acceso y credenciales</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="prioridad">
                Prioridad <span>*</span>
              </label>

              <select
                id="prioridad"
                name="prioridad"
                required
                value={formData.prioridad}
                onChange={handleChange}
              >
                <option value="">Seleccione una prioridad</option>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>

          {message && (
            <div
              role="alert"
              className={`form-message ${
                messageType === 'success'
                  ? 'success-message'
                  : 'error-message'
              }`}
            >
              {message}
            </div>
          )}

          <div className="form-actions">
            <button
              className="secondary-button"
              type="button"
              disabled={isSubmitting}
              onClick={handleReset}
            >
              Limpiar
            </button>

            <button
              className="submit-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar incidente'}
            </button>
          </div>
        </form>

        <aside className="incident-information">
          <article className="information-card card">
            <div className="information-icon">i</div>

            <h2>Antes de registrar</h2>

            <p>
              Proporcione información concreta para que el equipo de soporte
              pueda atender la incidencia.
            </p>

            <ul>
              <li>Utilice un título claro y breve.</li>
              <li>Describa detalladamente el problema.</li>
              <li>Seleccione la categoría correspondiente.</li>
              <li>Asigne la prioridad adecuada.</li>
            </ul>
          </article>
        </aside>
      </div>
    </section>
  );
}

export default IncidentForm;