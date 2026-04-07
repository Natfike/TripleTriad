import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import Card from './models/Card.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
}

const seedDatabase = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding');

        const rawData = fs.readFileSync('./data/cards.json', 'utf-8');
        const cardsData = JSON.parse(rawData);

        const validCards: any[] = [];

        cardsData.forEach((groupObject: any) => {
            const currentGroup = groupObject.cardGroup;
            const cardList = groupObject.cardList;

            for (const [levelName, cardsArray] of Object.entries(cardList)) {
                (cardsArray as any[]).forEach((card) => {
                  
                    validCards.push({
                        cardName: card.cardName,
                        cardRarity: card.cardRarity,
                        element: card.element,
                        numbers: card.numbers,
                        cardImage: card.cardImage,
                        cardGroup: currentGroup
                    });
                });
            }
        });

        console.log(`Parsed ${validCards.length} cards from JSON`);

        await Card.deleteMany({});

        await Card.insertMany(validCards);

        console.log('Database seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();