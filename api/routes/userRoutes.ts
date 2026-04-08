import express from 'express';
import User from '../models/User.js';
import { verifyToken, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user.userId).select('cardCollection decks');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/decks', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { decks } = req.body;

        if (!decks || !Array.isArray(decks)) {
            return res.status(400).json({ message: 'Invalid decks format' });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.decks = decks;
        await user.save();

        res.json({ message: 'Decks updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

export default router;