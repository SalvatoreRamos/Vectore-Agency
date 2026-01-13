import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all active testimonials (public)
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.find({ isActive: true })
            .sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener testimonios',
            error: error.message
        });
    }
});

// Get all testimonials (admin)
router.get('/all', authenticate, isAdmin, async (req, res) => {
    try {
        const testimonials = await Testimonial.find()
            .sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            data: testimonials
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener testimonios',
            error: error.message
        });
    }
});

// Create testimonial (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const testimonial = new Testimonial(req.body);
        await testimonial.save();
        res.status(201).json({
            success: true,
            message: 'Testimonio creado exitosamente',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear testimonio',
            error: error.message
        });
    }
});

// Update testimonial (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonio no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Testimonio actualizado',
            data: testimonial
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar testimonio',
            error: error.message
        });
    }
});

// Delete testimonial (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonio no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Testimonio eliminado'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar testimonio',
            error: error.message
        });
    }
});

export default router;
