import mongoose, { Schema, Document } from 'mongoose';

export interface IDeck {
    name: string;
    cards: mongoose.Types.ObjectId[];
}

export interface IUser extends Document {
    username: string;
    passwordHash: string;
    cardCollection: mongoose.Types.ObjectId[];
    decks: IDeck[];
    lastPackOpened?: Date;
}

const deckSchema: Schema = new Schema({
    name: { type: String, required: true },
    cards: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Card'}],
        validate: {
            validator: function(v: mongoose.Types.ObjectId[]){
                return v.length <= 5;
            },
            message: 'A deck cannot contain more than 5 cards.'
        }
    }, 
}, { _id: false });

const userSchema: Schema = new Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true
    },
    passwordHash: { 
        type: String,
        required: true 
    },
    cardCollection: [{
        type: Schema.Types.ObjectId,
        ref: 'Card'
    }],
    decks: {
        type: [deckSchema],
        validate: {
            validator: function(v: IDeck[]) {
                return v.length <= 5;
            },
            message: 'A user cannot have more than 5 decks.'
        }
    },
    lastPackOpened: { type: Date }
})

export default mongoose.model<IUser>('User', userSchema);