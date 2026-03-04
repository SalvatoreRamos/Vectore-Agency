import express from 'express';
import User from '../models/User.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        const total = users.length;
        const verified = users.filter(u => u.isVerified).length;
        const pending = users.filter(u => !u.isVerified).length;

        res.json({
            success: true,
            users,
            stats: { total, verified, pending }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener los usuarios' });
    }
});

// @route   PUT /api/users/:id/verify
// @desc    Toggle user verification (admin only)
// @access  Private/Admin
router.put('/:id/verify', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        user.isVerified = !user.isVerified;
        user.emailVerificationToken = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, user, message: user.isVerified ? 'Usuario verificado' : 'Verificación removida' });
    } catch (error) {
        console.error('Verify user error:', error);
        res.status(500).json({ success: false, message: 'Error al verificar usuario' });
    }
});

// @route   PUT /api/users/:id/toggle-active
// @desc    Toggle user active status (admin only)
// @access  Private/Admin
router.put('/:id/toggle-active', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        user.isActive = !user.isActive;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, user, message: user.isActive ? 'Usuario activado' : 'Usuario desactivado' });
    } catch (error) {
        console.error('Toggle active error:', error);
        res.status(500).json({ success: false, message: 'Error al cambiar estado del usuario' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'No puedes eliminar una cuenta admin' });
        }

        await user.deleteOne();
        res.json({ success: true, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
});

export default router;
