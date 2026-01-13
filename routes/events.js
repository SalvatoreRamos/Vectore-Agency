import express from 'express';
import Event from '../models/Event.js';
import Participant from '../models/Participant.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper para generar Ticket ID: VEC-XXX
const generateTicketId = () => {
    const random = Math.floor(100 + Math.random() * 900); // 3 dígitos
    return `VEC-${random}`;
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get Active Event
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const event = await Event.findOne({
            isActive: true,
            // startDate: { $lte: now }, // Opcional: si quieres que se active solo en la fecha
            // endDate: { $gte: now } 
        }).select('-winner'); // No mostramos ganador por aquí aún

        if (!event) {
            return res.json({ success: true, active: false });
        }

        // Check if expired
        if (new Date(event.endDate) < now) {
            // Podríamos auto-desactivarlo aquí, pero mejor solo informar
            return res.json({ success: true, active: false, code: 'EXPIRED' });
        }

        res.json({ success: true, active: true, data: event });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Join Event
router.post('/:id/join', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const eventId = req.params.id;
        const ip = req.ip || req.connection.remoteAddress;

        // 1. Validar evento
        const event = await Event.findById(eventId);
        if (!event || !event.isActive) {
            return res.status(404).json({ success: false, message: 'Evento no disponible' });
        }

        if (new Date(event.endDate) < new Date()) {
            return res.status(400).json({ success: false, message: 'El evento ha finalizado' });
        }

        // 2. Check if already registered (by phone)
        const existing = await Participant.findOne({ event: eventId, phone });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás participando',
                ticketId: existing.ticketId
            });
        }

        // 3. Simple Anti-Spam (IP check - max 3 per IP)
        const ipCount = await Participant.countDocuments({ event: eventId, ipAddress: ip });
        if (ipCount >= 3) {
            return res.status(400).json({ success: false, message: 'Límite de registros alcanzado para esta conexión' });
        }

        // 4. Generate Ticket & Save
        // Loop simple para asegurar unicidad de ticket en el evento (aunque es improbable colisión masiva)
        let ticketId = generateTicketId();
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 5) {
            const check = await Participant.findOne({ event: eventId, ticketId });
            if (!check) isUnique = true;
            else {
                ticketId = generateTicketId();
                attempts++;
            }
        }

        const participant = new Participant({
            event: eventId,
            name,
            phone,
            ticketId,
            ipAddress: ip
        });

        await participant.save();

        res.status(201).json({
            success: true,
            message: 'Registro exitoso',
            ticketId: participant.ticketId
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al registrarse', error: error.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get All Events
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const events = await Event.find().sort('-createdAt');
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create Event
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        // Si activamos este, desactivar los otros
        if (req.body.isActive) {
            await Event.updateMany({}, { isActive: false });
        }

        const event = new Event(req.body);
        await event.save();
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update Event
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        if (req.body.isActive) {
            await Event.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
        }

        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// Get Stats/Participants
router.get('/:id/stats', authenticate, isAdmin, async (req, res) => {
    try {
        const count = await Participant.countDocuments({ event: req.params.id });
        const participants = await Participant.find({ event: req.params.id })
            .sort('-createdAt')
            .limit(50); // Solo los últimos 50 para preview

        res.json({ success: true, total: count, recent: participants });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Draw Winner (Sorteo)
router.post('/:id/draw', authenticate, isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Evento no encontrado' });

        // Get random participant
        const count = await Participant.countDocuments({ event: req.params.id });
        if (count === 0) return res.status(400).json({ success: false, message: 'No hay participantes' });

        const random = Math.floor(Math.random() * count);
        const winner = await Participant.findOne({ event: req.params.id }).skip(random);

        // Update event
        event.winner = winner._id;
        event.isActive = false; // Close event automatically
        await event.save();

        res.json({
            success: true,
            winner: {
                name: winner.name,
                ticketId: winner.ticketId,
                phoneMasked: winner.phone.slice(-3).padStart(winner.phone.length, '*') // ***456
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
