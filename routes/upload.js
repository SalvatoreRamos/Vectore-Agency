import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticate, isAdmin } from '../middleware/auth.js';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Cloudinary Configuration
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('⚠️ Cloudinary is not fully configured. Image uploads will use local storage or fail.');
}

// Configure Cloudinary Storage
let storage;
try {
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'vectore-agency',
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'avif'],
            transformation: [{ width: 1000, crop: 'limit' }]
        }
    });
} catch (error) {
    console.error('❌ Error initializing Cloudinary storage:', error.message);
    // Fallback or just let it be null (will fail on upload)
    storage = null;
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

router.post('/image', [authenticate, isAdmin], (req, res, next) => {
    if (!storage) {
        return res.status(500).json({
            success: false,
            message: 'Cloudinary storage is not configured'
        });
    }
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'Error uploading to Cloudinary',
                error: err.message
            });
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const fileUrl = req.file.path; // Cloudinary URL

        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                filename: req.file.filename,
                url: fileUrl,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

// @route   POST /api/upload/images
// @desc    Upload multiple images
// @access  Private/Admin
router.post('/images', [authenticate, isAdmin], (req, res, next) => {
    if (!storage) {
        return res.status(500).json({
            success: false,
            message: 'Cloudinary storage is not configured'
        });
    }
    upload.array('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: 'Error uploading to Cloudinary',
                error: err.message
            });
        }
        next();
    });
}, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const files = req.files.map(file => ({
            filename: file.filename,
            url: file.path, // Cloudinary URL
            size: file.size,
            mimetype: file.mimetype
        }));

        res.json({
            success: true,
            message: `${files.length} files uploaded successfully`,
            data: files
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

export default router;
