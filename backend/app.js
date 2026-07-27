require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const ticketRoutes = require('./routes/ticket.routes');

const app = express();

const PORT = process.env.PORT || 3000;

// Permite solicitudes desde el futuro frontend.
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

// Rutas de tickets.
app.use('/tickets', ticketRoutes);

// Ruta no encontrada.
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'La ruta solicitada no existe.'
    });
});

// Manejador general de errores.
app.use((error, req, res, next) => {
    console.error('Error interno del servidor:', error);

    res.status(500).json({
        mensaje: 'Ocurrió un error interno en el servidor.'
    });
});

/**
 * Comprueba la conexión antes de iniciar el servidor.
 */
const iniciarServidor = async () => {
    try {
        await pool.query('SELECT NOW()');

        console.log('Conexión con PostgreSQL establecida correctamente.');

        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('No se pudo conectar con PostgreSQL:', error.message);
        process.exit(1);
    }
};

iniciarServidor();