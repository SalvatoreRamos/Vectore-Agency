import express from 'express';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticate, isAdmin, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const notifications = await Notification.find({
            isActive: true,
            $or: [
                { target: 'all' },
                { targetUsers: req.user._id }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        // Add read status for current user
        const result = notifications.map(n => ({
            ...n,
            isRead: n.readBy.some(id => id.toString() === req.user._id.toString())
        }));

        const unreadCount = result.filter(n => !n.isRead).length;

        res.json({ success: true, notifications: result, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Error al obtener notificaciones' });
    }
});

// @route   POST /api/notifications
// @desc    Create a new notification (admin only)
// @access  Admin
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const { title, message, type, target, targetEmail } = req.body;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Título y mensaje son requeridos' });
        }

        const notifData = { title, message, type: type || 'general', target: target || 'all' };

        // If targeting specific user (e.g. winner), find by email
        if (target === 'specific' && targetEmail) {
            const targetUser = await User.findOne({ email: targetEmail });
            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado con ese correo' });
            }
            notifData.targetUsers = [targetUser._id];
        }

        const notification = new Notification(notifData);
        await notification.save();

        res.status(201).json({ success: true, notification });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Error al crear notificación' });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticate, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, {
            $addToSet: { readBy: req.user._id }
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al marcar como leída' });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', authenticate, async (req, res) => {
    try {
        await Notification.updateMany(
            {
                isActive: true,
                $or: [{ target: 'all' }, { targetUsers: req.user._id }]
            },
            { $addToSet: { readBy: req.user._id } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al marcar todas como leídas' });
    }
});

// @route   GET /api/notifications/admin
// @desc    Get all notifications (admin view)
// @access  Admin
router.get('/admin', authenticate, isAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('targetUsers', 'name email')
            .lean();

        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener notificaciones admin' });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Admin
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Notificación eliminada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar notificación' });
    }
});

export default router;
