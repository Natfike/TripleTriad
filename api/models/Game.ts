import mongoose, { Schema, Document } from 'mongoose';

export interface IMove {
    player: string;
    cardId: string;
    cellIndex: number;
    timestamp: Date;
}

export interface IGame extends Document {
    roomId: string;
    status: 'waiting' | 'in_progress' | 'finished';
    rules: string[];
    players: {
        p1: { username: string, deck: string[] };
        p2: { username: string, deck: string[] };
    };
    board: {
        cardId: string | null;
        owner: 'p1' | 'p2' | null;
    }[];
    currentTurn: 'p1' | 'p2';
    winner: 'p1' | 'p2' | 'draw' | null;
    history: IMove[];
}

const GameSchema: Schema = new Schema<IGame>({
    roomId: { type: String, required: true, unique: true },
    status: { type: String, enum: ['waiting', 'in_progress', 'finished'], default: 'waiting' },
    rules: [{ type: String }],
    players: {
        p1: {
            username: { type: String },
            deck: [{ type: String }]
        },
        p2: {
            username: { type: String },
            deck: [{ type: String }]
        }
    },
    board: {
        type: [{ cardId: String, owner: String}],
        default: Array(9).fill({ cardId: null, owner: null })
    },
    currentTurn: { type: String, enum: ['p1', 'p2'], default: 'p1' },
    winner: { type: String, enum: ['p1', 'p2', 'draw', null], default: null },
    history: [{
        player: { type: String },
        cardId: { type: String },
        cellIndex: { type: Number },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model<IGame>('Game', GameSchema);