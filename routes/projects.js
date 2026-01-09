import express from 'express';
import { body, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find().sort('-createdAt');
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching projects', error: error.message });
    }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private/Admin
router.post('/', [authenticate, isAdmin], [
    body('title').notEmpty().withMessage('Title is required'),
    body('client').notEmpty().withMessage('Client is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('thumbnail').notEmpty().withMessage('Thumbnail is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const project = new Project(req.body);
        await project.save();

        res.status(201).json({ success: true, message: 'Project created successfully', data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating project', error: error.message });
    }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private/Admin
router.put('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, message: 'Project updated successfully', data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating project', error: error.message });
    }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private/Admin
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
        res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting project', error: error.message });
    }
});

export default router;
