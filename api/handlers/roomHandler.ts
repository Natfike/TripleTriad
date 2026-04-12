import { Server, Socket } from "socket.io";

export default function roomHandler(io: Server, socket: Socket) {
    socket.on('create_room', (data) => {
        const { roomName, roomRules, username } = data;
        socket.data.username = username;

        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
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
        socket.join(roomId);

        const players = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(socketId => {
            const s = io.sockets.sockets.get(socketId);
            console.log(s);
            return s?.data.username || 'Unknown';
        });

        socket.emit('room_joined', { roomId, players });
        socket.to(roomId).emit('player_joined', { username });
    });

    socket.on('leave_room', (data) => {
        const { roomId, player } = data;
        socket.leave(roomId);
        socket.to(roomId).emit('player_left', { username: player });
    })
}