import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import cardRoutes from './routes/cardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import packRoutes from './routes/packRoutes.js';
import roomHandler from './handlers/roomHandler.js';
import gameHandler from './handlers/gameHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173","https://tripletriad-react.web.app", "https://tripletriad-react.firebaseapp.com"],
        methods: ["GET", "POST"]
    }
})

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packs', packRoutes);

io.on('connection', (socket) => {
    console.log('User connected : ', socket.id);

    roomHandler(io, socket);
    gameHandler(io, socket);

    socket.on('disconnect', () => {
        const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
        rooms.forEach(roomId => {
            socket.to(roomId).emit('player_left', { username: socket.data.username });
        });
        console.log('User disconnected : ', socket.id);
    })
})

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
    throw new Error('MONGO_URI is not defined in environment variables');
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        httpServer.listen(Number(PORT), "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    })