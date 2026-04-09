import express from 'express';
import Pack from '../models/Pack.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const packs = await Pack.find();
        res.json(packs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;