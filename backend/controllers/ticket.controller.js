const pool = require('../config/database');

const CATEGORIAS_PERMITIDAS = ['Red', 'Hardware', 'Software'];
const PRIORIDADES_PERMITIDAS = ['Alta', 'Media', 'Baja'];
const ESTADOS_PERMITIDOS = ['Abierto', 'En Progreso', 'Cerrado'];

/**
 * Comprueba que el ID recibido sea un número entero positivo.
 */
const validarId = (id) => {
    const idNumero = Number(id);

    if (!Number.isInteger(idNumero) || idNumero <= 0) {
        return null;
    }

    return idNumero;
};

/**
 * GET /tickets
 * Lista todos los tickets registrados.
 */
const obtenerTickets = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT
                id,
                titulo,
                descripcion,
                categoria,
                prioridad,
                estado
            FROM tickets
            ORDER BY id ASC
        `);

        return res.status(200).json({
            mensaje: 'Tickets obtenidos correctamente.',
            cantidad: resultado.rowCount,
            tickets: resultado.rows
        });
    } catch (error) {
        console.error('Error al obtener los tickets:', error);

        return res.status(500).json({
            mensaje: 'Ocurrió un error al obtener los tickets.'
        });
    }
};

/**
 * GET /tickets/:id
 * Busca un ticket específico mediante su ID.
 */
const obtenerTicketPorId = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            mensaje: 'El ID del ticket debe ser un número entero positivo.'
        });
    }

    try {
        const resultado = await pool.query(
            `
                SELECT
                    id,
                    titulo,
                    descripcion,
                    categoria,
                    prioridad,
                    estado
                FROM tickets
                WHERE id = $1
            `,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensaje: `No existe un ticket con el ID ${id}.`
            });
        }

        return res.status(200).json({
            mensaje: 'Ticket encontrado correctamente.',
            ticket: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al buscar el ticket:', error);

        return res.status(500).json({
            mensaje: 'Ocurrió un error al buscar el ticket.'
        });
    }
};

/**
 * POST /tickets
 * Registra un nuevo ticket.
 */
const crearTicket = async (req, res) => {
    const {
        titulo,
        descripcion,
        categoria,
        prioridad,
        estado = 'Abierto'
    } = req.body;

    if (
        typeof titulo !== 'string' ||
        typeof descripcion !== 'string' ||
        typeof categoria !== 'string' ||
        typeof prioridad !== 'string' ||
        typeof estado !== 'string'
    ) {
        return res.status(400).json({
            mensaje: 'Todos los campos deben contener valores válidos.'
        });
    }

    if (!titulo.trim() || !descripcion.trim()) {
        return res.status(400).json({
            mensaje: 'El título y la descripción son obligatorios.'
        });
    }

    if (titulo.trim().length > 100) {
        return res.status(400).json({
            mensaje: 'El título no puede superar los 100 caracteres.'
        });
    }

    if (!CATEGORIAS_PERMITIDAS.includes(categoria)) {
        return res.status(400).json({
            mensaje: 'La categoría debe ser Red, Hardware o Software.'
        });
    }

    if (!PRIORIDADES_PERMITIDAS.includes(prioridad)) {
        return res.status(400).json({
            mensaje: 'La prioridad debe ser Alta, Media o Baja.'
        });
    }

    if (!ESTADOS_PERMITIDOS.includes(estado)) {
        return res.status(400).json({
            mensaje: 'El estado debe ser Abierto, En Progreso o Cerrado.'
        });
    }

    try {
        const resultado = await pool.query(
            `
                INSERT INTO tickets (
                    titulo,
                    descripcion,
                    categoria,
                    prioridad,
                    estado
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    id,
                    titulo,
                    descripcion,
                    categoria,
                    prioridad,
                    estado
            `,
            [
                titulo.trim(),
                descripcion.trim(),
                categoria,
                prioridad,
                estado
            ]
        );

        return res.status(201).json({
            mensaje: 'Ticket registrado correctamente.',
            ticket: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al crear el ticket:', error);

        return res.status(500).json({
            mensaje: 'Ocurrió un error al registrar el ticket.'
        });
    }
};

/**
 * PUT /tickets/:id
 * Actualiza los datos de un ticket existente.
 */
const actualizarTicket = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            mensaje: 'El ID del ticket debe ser un número entero positivo.'
        });
    }

    const {
        titulo,
        descripcion,
        categoria,
        prioridad,
        estado
    } = req.body;

    if (
        titulo === undefined &&
        descripcion === undefined &&
        categoria === undefined &&
        prioridad === undefined &&
        estado === undefined
    ) {
        return res.status(400).json({
            mensaje: 'Debe enviar al menos un campo para actualizar.'
        });
    }

    if (
        titulo !== undefined &&
        (typeof titulo !== 'string' || !titulo.trim())
    ) {
        return res.status(400).json({
            mensaje: 'El título debe contener un valor válido.'
        });
    }

    if (titulo !== undefined && titulo.trim().length > 100) {
        return res.status(400).json({
            mensaje: 'El título no puede superar los 100 caracteres.'
        });
    }

    if (
        descripcion !== undefined &&
        (typeof descripcion !== 'string' || !descripcion.trim())
    ) {
        return res.status(400).json({
            mensaje: 'La descripción debe contener un valor válido.'
        });
    }

    if (
        categoria !== undefined &&
        !CATEGORIAS_PERMITIDAS.includes(categoria)
    ) {
        return res.status(400).json({
            mensaje: 'La categoría debe ser Red, Hardware o Software.'
        });
    }

    if (
        prioridad !== undefined &&
        !PRIORIDADES_PERMITIDAS.includes(prioridad)
    ) {
        return res.status(400).json({
            mensaje: 'La prioridad debe ser Alta, Media o Baja.'
        });
    }

    if (
        estado !== undefined &&
        !ESTADOS_PERMITIDOS.includes(estado)
    ) {
        return res.status(400).json({
            mensaje: 'El estado debe ser Abierto, En Progreso o Cerrado.'
        });
    }

    try {
        const ticketExistente = await pool.query(
            'SELECT * FROM tickets WHERE id = $1',
            [id]
        );

        if (ticketExistente.rowCount === 0) {
            return res.status(404).json({
                mensaje: `No existe un ticket con el ID ${id}.`
            });
        }

        const ticketActual = ticketExistente.rows[0];

        const datosActualizados = {
            titulo:
                titulo !== undefined
                    ? titulo.trim()
                    : ticketActual.titulo,

            descripcion:
                descripcion !== undefined
                    ? descripcion.trim()
                    : ticketActual.descripcion,

            categoria:
                categoria !== undefined
                    ? categoria
                    : ticketActual.categoria,

            prioridad:
                prioridad !== undefined
                    ? prioridad
                    : ticketActual.prioridad,

            estado:
                estado !== undefined
                    ? estado
                    : ticketActual.estado
        };

        const resultado = await pool.query(
            `
                UPDATE tickets
                SET
                    titulo = $1,
                    descripcion = $2,
                    categoria = $3,
                    prioridad = $4,
                    estado = $5
                WHERE id = $6
                RETURNING
                    id,
                    titulo,
                    descripcion,
                    categoria,
                    prioridad,
                    estado
            `,
            [
                datosActualizados.titulo,
                datosActualizados.descripcion,
                datosActualizados.categoria,
                datosActualizados.prioridad,
                datosActualizados.estado,
                id
            ]
        );

        return res.status(200).json({
            mensaje: 'Ticket actualizado correctamente.',
            ticket: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar el ticket:', error);

        return res.status(500).json({
            mensaje: 'Ocurrió un error al actualizar el ticket.'
        });
    }
};

/**
 * DELETE /tickets/:id
 * Elimina un ticket mediante su ID.
 */
const eliminarTicket = async (req, res) => {
    const id = validarId(req.params.id);

    if (!id) {
        return res.status(400).json({
            mensaje: 'El ID del ticket debe ser un número entero positivo.'
        });
    }

    try {
        const resultado = await pool.query(
            `
                DELETE FROM tickets
                WHERE id = $1
                RETURNING
                    id,
                    titulo,
                    descripcion,
                    categoria,
                    prioridad,
                    estado
            `,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                mensaje: `No existe un ticket con el ID ${id}.`
            });
        }

        return res.status(200).json({
            mensaje: 'Ticket eliminado correctamente.',
            ticketEliminado: resultado.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar el ticket:', error);

        return res.status(500).json({
            mensaje: 'Ocurrió un error al eliminar el ticket.'
        });
    }
};

module.exports = {
    obtenerTickets,
    obtenerTicketPorId,
    crearTicket,
    actualizarTicket,
    eliminarTicket
};