import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
    cardName: string;
    cardRarity: number;
    element: string;
    numbers: {
        top: string;
        left: string;
        right: string;
        bottom: string;
    };
    cardImage: string;
};

const cardSchema: Schema = new Schema({
    cardName: { type: String, required: true},
    cardRarity: { type: Number, required: true },
    element: { type: String, required: true },
    numbers: {
        top: { type: String, required: true },
        left: { type: String, required: true },
        right: { type: String, required: true },
        bottom: { type: String, required: true }
    },
    cardImage: { type: String, required: true }
});

export default mongoose.model<ICard>('Card', cardSchema);