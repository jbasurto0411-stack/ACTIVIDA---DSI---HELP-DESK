require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

const PORT = process.env.PORT || 3000;

// Permite solicitudes desde el frontend.
app.use(cors());

// Permite recibir información JSON.
app.use(express.json());

// Permite recibir datos enviados desde formularios.
app.use(express.urlencoded({ extended: true }));

// Ruta principal.
app.get('/', (req, res) => {
    res.status(200).json({
        mensaje: 'API REST del Sistema Help Desk funcionando correctamente.'
    });
});

// Ruta temporal para comprobar la conexión con Supabase.
app.get('/database-test', async (req, res, next) => {
    try {
        const resultado = await pool.query(`
            SELECT
                NOW() AS fecha_servidor,
                current_database() AS base_datos,
                current_user AS usuario
        `);

        res.status(200).json({
            mensaje: 'Conexión con Supabase establecida correctamente.',
            datos: resultado.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

// Rutas de tickets.
app.use('/tickets', ticketRoutes);

// Ruta no encontrada.
// Debe colocarse después de todas las rutas válidas.
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'La ruta solicitada no existe.'
    });
});

// Manejador general de errores.
// Debe colocarse al final.
app.use((error, req, res, next) => {
    console.error('Error interno del servidor:', error);

    res.status(500).json({
        mensaje: 'Ocurrió un error interno en el servidor.',
        error:
            process.env.NODE_ENV === 'development'
                ? error.message
                : undefined
    });
});

/**
 * Comprueba la conexión con PostgreSQL antes de iniciar el servidor.
 */
const iniciarServidor = async () => {
    try {
        const resultado = await pool.query(`
            SELECT
                NOW() AS fecha_servidor,
                current_database() AS base_datos
        `);

        console.log(
            'Conexión con PostgreSQL de Supabase establecida correctamente.'
        );

        console.log(
            `Base de datos conectada: ${resultado.rows[0].base_datos}`
        );

        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error(
            'No se pudo conectar con PostgreSQL de Supabase:',
            error.message
        );

        process.exit(1);
    }
};

iniciarServidor();