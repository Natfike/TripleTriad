import { Server, Socket } from "socket.io";
import Game from "../models/Game.js";
import Card from "../models/Card.js";
import { GameEngine } from "../gameEngine/Engine.js";

export default function gameHandler(io: Server, socket: Socket) {

    socket.on('player_ready', async (data) => {
        console.log('Player ready:', data);
        const { roomId, username } = data;

        socket.join(roomId);
        socket.data.ready = true;
        socket.data.username = username;

        const roomSockets = await io.in(roomId).fetchSockets();
        
        if (roomSockets.length === 2 && roomSockets.every(s => s.data.ready)) {

            try {
                const game = await Game.findOne({ roomId });
                if (!game) {return;}

                const p1Deck = game.players.p1.deck
                const p2Deck = game.players.p2.deck

                const p1FullDeck = await Card.find({ _id: { $in: p1Deck } });
                const p2FullDeck = await Card.find({ _id: { $in: p2Deck } });

                const getFullDeck = (decksIds: string[], fullCards: any[]) => {
                    return decksIds.map(id => fullCards.find(c => c._id.toString() === id.toString()));
                }

                const p1PopulatedDeck = getFullDeck(p1Deck, p1FullDeck);
                const p2PopulatedDeck = getFullDeck(p2Deck, p2FullDeck);

                io.to(roomId).emit('game_initiated', { 
                    gameState: game, 
                    p1FullDeck: p1PopulatedDeck, 
                    p2FullDeck: p2PopulatedDeck 
                });
            } catch (error) {
                console.error('Error initializing game:', error);
                return;
            }
        }
    });

    socket.on('play_card', async (data) => {
        console.log('Play card event received:', data);
        const { roomId, username, cardId, cellIndex } = data;

        try {
            const game = await Game.findOne({ roomId });
            if (!game || game.status !== 'in_progress') {
                console.error('Game not found or not in progress');
                return;
            }

            const playerRole = game.players.p1.username === username ? 'p1' : 'p2';
            if (game.currentTurn !== playerRole) {
                console.error('Not your turn');
                return;
            }

            const targetCell = game.board[cellIndex];
            
            if (targetCell && targetCell.owner) {
                console.log('Cell already occupied by player', targetCell.owner);
                return;
            }

            const boardCardIds = game.board
                .filter(cell => cell && cell.cardId)
                .map(cell => cell.cardId);
            const allInvolvedIds = [...new Set([cardId, ...boardCardIds])];

            const cardsData = await Card.find({ _id: { $in: allInvolvedIds}});

            const cardsDict: Record<string, any> = {};

            cardsData.forEach(card => {
                cardsDict[card._id.toString()] = card.numbers;
            });

            const result = GameEngine.processMove(game.board, cellIndex, cardId, playerRole, game.rules, cardsDict);

            game.board = result.updatedBoard;
            game.history.push({ player: username, cardId, cellIndex, timestamp: new Date() });

            if (GameEngine.checkEndGame(game.board)) {
                ({ status: game.status, winner: game.winner } = GameEngine.detemineWinner(game.board, game.players));
            } else {
                game.currentTurn = playerRole === 'p1' ? 'p2' : 'p1';
            }

            if(playerRole === 'p1') {
                game.players.p1.deck = game.players.p1.deck.filter(id => id.toString() !== cardId.toString());
            } else {
                game.players.p2.deck = game.players.p2.deck.filter(id => id.toString() !== cardId.toString());
            }

            await game.save();

            const formattedBoard = game.board.map(cell => {
                if (!cell || cell.owner === null) return null;
                
                const cardDetails = cardsData.find(c => c._id.toString() === cell.cardId?.toString());

                return {
                    id: cardDetails?._id,
                    image: cardDetails?.cardImage,
                    owner: cell.owner,
                    numbers: cardDetails?.numbers
                };
            });

            io.to(roomId).emit('board_updated', {
                board: formattedBoard,
                currentTurn: game.currentTurn,
                hands: {
                    p1: game.players.p1.deck,
                    p2: game.players.p2.deck
                },
                lastMove: { playerRole, cardId, cellIndex, flippedCells: result.flippedCells },
            })

            if (game.status === 'finished') {
                io.to(roomId).emit('game_finished', { winner: game.winner });
            }
        } catch (error) {
            console.error('Error playing card:', error);
        }
    })
}