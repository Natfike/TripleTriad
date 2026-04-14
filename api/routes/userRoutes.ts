import express from 'express';
import User from '../models/User.js';
import Card from '../models/Card.js';
import Game from '../models/Game.js';
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
});

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
});

router.get('/dailyPullAvailable', verifyToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        const now = new Date();
        const available = !user.lastPackOpened || (now.toDateString() !== user.lastPackOpened.toDateString());

        res.status(200).json({ dailyPullAvailable: available });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/dailyPull', verifyToken, async (req: AuthRequest, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        const now = new Date();
        if (user.lastPackOpened && (now.toDateString() === user.lastPackOpened.toDateString())) {
            return res.status(400).json({ message: 'You have already opened a pack today' });
        }

        const cardGroupSelected = req.body.packCode;

        const drawnCards = await Card.aggregate([
            { $match: { cardGroup: cardGroupSelected } },
            { $sample: { size: 3 } }
        ]);

        console.log('Drawn cards:', drawnCards);
        if (drawnCards.length === 0) {
            return res.status(400).json({ message: 'No cards available for this pack' });
        }

        const drawnCardIds = drawnCards.map(card => card._id);
        const newCardIds = drawnCardIds.filter(id => !user.cardCollection.includes(id));

        user.cardCollection.push(...newCardIds);
        user.lastPackOpened = now;
        await user.save();
    
        res.status(200).json({ 
            message: 'Daily draw successful',
            cards: drawnCards
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/replays', verifyToken, async (req: AuthRequest, res) => {

    try {
        const user = await User.findById(req.user.userId);
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        const username = user.username;

        const games = await Game.find({
            $or: [
                { 'players.p1.username': username },
                { 'players.p2.username': username }
            ],
            status: 'finished'
        }).select('-history -board')
        .sort({ updatedAt: -1 })

        res.status(200).json({ replays: games });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/replays/:gameId', verifyToken, async (req: AuthRequest, res) => {

    try {
        const user = await User.findById(req.user.userId);
        if (!user) { return res.status(404).json({ message: 'User not found' }); }

        const username = user.username;
        const gameId = req.params.gameId;

        const game = await Game.findById(gameId);

        if (!game) {
            return res.status(404).json({ message: 'Replay not found' });
        }

        res.status(200).json({ replay: game })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;