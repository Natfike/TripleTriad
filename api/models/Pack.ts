import mongoose, { Schema, Document } from 'mongoose';

export interface IPack extends Document {
    code: string;
    coverImage: string;
}

const packSchema: Schema = new Schema({
    code: { type: String, required: true, unique: true },
    coverImage: { type: String, required: true }
})

export default mongoose.model<IPack>('Pack', packSchema);