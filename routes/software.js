import express from 'express';
import { authenticate, isAdmin } from '../middleware/auth.js';
import SoftwareAsset from '../models/SoftwareAsset.js';

const router = express.Router();

// @route   GET /api/software
// @desc    Get all software assets
// @access  Public
router.get('/', async (req, res) => {
    try {
        const assets = await SoftwareAsset.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: assets
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching assets',
            error: error.message
        });
    }
});

// @route   POST /api/software
// @desc    Create a new software asset
// @access  Private (Admin)
router.post('/', [authenticate, isAdmin], async (req, res) => {
    try {
        const { title, url, description, section } = req.body;

        const asset = new SoftwareAsset({
            title,
            url,
            description,
            section
        });

        await asset.save();
        res.status(201).json({
            success: true,
            data: asset,
            message: 'Asset created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating asset',
            error: error.message
        });
    }
});

// @route   DELETE /api/software/:id
// @desc    Delete a software asset
// @access  Private (Admin)
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const asset = await SoftwareAsset.findById(req.params.id);
        if (!asset) {
            return res.status(404).json({
                success: false,
                message: 'Asset not found'
            });
        }

        await asset.deleteOne();
        res.json({
            success: true,
            message: 'Asset deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting asset',
            error: error.message
        });
    }
});

export default router;
