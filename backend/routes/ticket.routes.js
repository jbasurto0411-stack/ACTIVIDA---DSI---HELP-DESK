const express = require('express');

const {
    obtenerTickets,
    obtenerTicketPorId,
    crearTicket,
    actualizarTicket,
    eliminarTicket
} = require('../controllers/ticket.controller');

const router = express.Router();

// GET /tickets
router.get('/', obtenerTickets);

// GET /tickets/:id
router.get('/:id', obtenerTicketPorId);

// POST /tickets
router.post('/', crearTicket);

// PUT /tickets/:id
router.put('/:id', actualizarTicket);

// DELETE /tickets/:id
router.delete('/:id', eliminarTicket);

module.exports = router;