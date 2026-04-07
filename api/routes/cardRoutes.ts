import express from 'express';
import Card from '../models/Card.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const cards = await Card.find();
        res.json(cards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;