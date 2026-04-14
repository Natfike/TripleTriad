import { Server, Socket } from "socket.io";
import Game from "../models/Game.js";

const activeRooms = new Map();

export default function roomHandler(io: Server, socket: Socket) {
    socket.on('create_room', (data) => {
        const { roomName, roomRules, username } = data;
        socket.data.username = username;

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

        activeRooms.set(roomId, {
            name: roomName,
            rules: roomRules,
            players: {
                [username]: { isReadyWithDeck: false, deck: [] }
                }
        });

        socket.join(roomId);

        socket.emit('room_created', { roomId, players: [username] });
    });

    socket.on('join_room', (data) => {
        const { roomId, username } = data;
        socket.data.username = username;

        if (!io.sockets.adapter.rooms.has(roomId)) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        const room = activeRooms.get(roomId);
        if (room) {
            room.players[username] = { isReadyWithDeck: false, deck: [] };
        }

        socket.join(roomId);

        const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
            const s = io.sockets.sockets.get(socketId);
                return s?.data.username || 'Unknown';
        });

        socket.emit('room_joined', { roomId, players });
        socket.to(roomId).emit('player_joined', { username });

        if (players.length == 2) {
            io.to(roomId).emit('choose_deck', { roomId, players });
        }
    });

    socket.on('deck_selected', async (data) => {
        const { roomId, player, deck } = data;
        const room = activeRooms.get(roomId);
        console.log('Deck selected:', { roomId, player, deck });

        if (room && room.players[player]) {
            room.players[player].isReadyWithDeck = true;
            room.players[player].deck = deck;

            const playersArray = Object.keys(room.players);
            const allPlayersReady = playersArray.every(p => room.players[p].isReadyWithDeck);

            if (allPlayersReady){
                const p1Name = playersArray[0];
                const p2Name = playersArray[1];

                if (!p1Name || !p2Name) return;

                try {
                    const newGame = new Game({
                        roomId,
                        status: 'in_progress',
                        rules: [room.rules],
                        players: {
                            p1: { username: p1Name, deck: room.players[p1Name].deck },
                            p2: { username: p2Name, deck: room.players[p2Name].deck }
                        },
                        currentTurn: 'p1'
                    });
                    await newGame.save();

                    io.to(roomId).emit('start_game', { roomId });

                    activeRooms.delete(roomId);
                } catch (error) {
                    console.error('Error initiating game:', error);
                }
            } else {
                socket.emit('waiting_for_opponent')
            }
        }
    })

    socket.on('leave_room', (data) => {
        const { roomId, player } = data;
        socket.leave(roomId);
        socket.to(roomId).emit('player_left', { username: player });
    })

    socket.on('player_ready', (data) => {
        const { roomId } = data;
        socket.data.ready = true;

        const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
            const s = io.sockets.sockets.get(socketId);
            return { username: s?.data.username, ready: s?.data.ready };
        });

        if (players.every(p => p.ready)) {
            io.to(roomId).emit('game_start', { roomId });
        }
    })
}