import express from 'express';
import Complaint from '../models/Complaint.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/complaints
// @desc    Submit a new complaint (public)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { consumer, product, complaint } = req.body;

        // Basic validation
        if (!consumer?.name || !consumer?.docType || !consumer?.docNumber ||
            !consumer?.email || !consumer?.phone || !product?.type ||
            !product?.description || !complaint?.type || !complaint?.detail ||
            !complaint?.consumerRequest) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser completados'
            });
        }

        const newComplaint = new Complaint({
            consumer,
            product,
            complaint
        });

        await newComplaint.save();

        res.status(201).json({
            success: true,
            message: 'Reclamación registrada correctamente',
            data: {
                complaintNumber: newComplaint.complaintNumber,
                createdAt: newComplaint.createdAt
            }
        });
    } catch (error) {
        console.error('Complaint creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar la reclamación',
            error: error.message
        });
    }
});

// @route   GET /api/complaints
// @desc    Get all complaints (admin only)
// @access  Private/Admin
router.get('/', [authenticate, isAdmin], async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const complaints = await Complaint.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(Number(limit));

        const total = await Complaint.countDocuments(query);

        res.json({
            success: true,
            data: complaints,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener reclamaciones',
            error: error.message
        });
    }
});

// @route   PUT /api/complaints/:id
// @desc    Update complaint status/response (admin only)
// @access  Private/Admin
router.put('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Reclamación no encontrada'
            });
        }

        if (req.body.status) complaint.status = req.body.status;
        if (req.body.response) {
            complaint.response = {
                text: req.body.response,
                respondedAt: new Date()
            };
        }

        await complaint.save();

        res.json({
            success: true,
            message: 'Reclamación actualizada correctamente',
            data: complaint
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la reclamación',
            error: error.message
        });
    }
});

export default router;
