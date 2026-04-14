import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Card from '../models/Card.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

router.post('/register',async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ 
            $or: [{username}]
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const starterCards = await Card.find({
            cardGroup: 'FFVIII',
            cardRarity: { $in: [1, 2] }
        });
        
        const starterCardIds = starterCards.map(card => card._id);

        const emptyDeck = [
             { name: 'Deck 1', cards: Array(5).fill(null) },
             { name: 'Deck 2', cards: Array(5).fill(null) },
             { name: 'Deck 3', cards: Array(5).fill(null) },
             { name: 'Deck 4', cards: Array(5).fill(null) },
             { name: 'Deck 5', cards: Array(5).fill(null) }
        ]
        
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            passwordHash,
            cardCollection: starterCardIds,
            decks: emptyDeck
        })

        await user.save();

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'Login successful',
            token,
            username: user.username
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user){
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({
            message: 'Login successful',
            token,
            username: user.username
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;