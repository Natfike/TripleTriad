import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext.tsx'
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import "../styles/global.css"
import "../styles/Game.css"

interface GameCard {
    id: string;
    image: string;
    owner: 'p1' | 'p2';
    numbers?: { top: string, left: string, right: string, bottom: string };
}

function Game(){

    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket()
    const { t } = useTranslation();
    const hasEmittedReady = useRef(false);
    const myRoleRef = useRef<'p1' | 'p2'>('p1');

    const username = localStorage.getItem('username');
    const roomId = location.state?.roomId;

    const [gameResult, setGameResult] = useState<{ show: boolean, message: string } | null>(null);
    const [board, setBoard] = useState<(GameCard | null)[]>(Array(9).fill(null));
    const [myHand, setMyHand] = useState<GameCard[]>([]);
    const [opponentHand, setOpponentHand] = useState<GameCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const [currentTurn, setCurrentTurn] = useState<'p1' | 'p2'>('p1');

    useEffect(() => {
        if (!socket || !roomId || !username) {
            navigate('/');
            return;
        }

        if (!hasEmittedReady.current) {
            socket.emit('player_ready', { roomId, username });
            hasEmittedReady.current = true;
        }

        socket.on('game_initiated', (data) => {
            const { gameState, p1FullDeck, p2FullDeck } = data;

            const role = gameState.players.p1.username === username ? 'p1' : 'p2';
            myRoleRef.current = role;
            setCurrentTurn(gameState.currentTurn);

            const formatDeck = (deck: any[], owner: 'p1' | 'p2'): GameCard[] => {
                return deck.map(card => ({
                    id: card._id,
                    image: card.cardImage,
                    owner: owner,
                    numbers: card.numbers
                }));
            }

            if (role === 'p1') {
                setMyHand(formatDeck(p1FullDeck, 'p1'));
                setOpponentHand(formatDeck(p2FullDeck, 'p2'));
            } else {
                setMyHand(formatDeck(p2FullDeck, 'p2'));
                setOpponentHand(formatDeck(p1FullDeck, 'p1'));
            }
        });

        socket.on('board_updated', (data) => {
            setBoard(data.board);
            setCurrentTurn(data.currentTurn);
            const currentRole = myRoleRef.current;

            setMyHand(prev => prev.filter(card => {
                const myNewIds = (currentRole === 'p1' ? data.hands.p1 : data.hands.p2)
                return myNewIds.includes(card.id);
            }));
            
            setOpponentHand(prev => prev.filter(card => {
                const opponentNewIds = (currentRole === 'p1' ? data.hands.p2 : data.hands.p1)
                return opponentNewIds.includes(card.id);
            }));
        });

        socket.on('game_finished', (data) => {
            const { winner } = data;
            let message = '';
            if (winner === 'draw') {
                message = t('game.draw');
            } else if ((winner === 'p1' && myRoleRef.current === 'p1') || (winner === 'p2' && myRoleRef.current === 'p2')) {
                message = t('game.victory');
            } else {
                message = t('game.defeat');
            }

            setGameResult({ show: true, message });
        });

        return () => {
            socket.off('game_initiated');
            socket.off('board_updated');
            socket.off('game_finished');
        };
    }, [socket, roomId, username, navigate]);
    
    const handleCardClick = (cardId: string) => {
        setSelectedCardId(prev => prev === cardId ? null : cardId);
    }

    const handleCellClick = (index: number) => {

        if (currentTurn !== myRoleRef.current) return;
        if (!selectedCardId || board[index] !== null) return;

        const cardToPlay = myHand.find(card => card.id === selectedCardId);
        if (!cardToPlay) return;

        setSelectedCardId(null);

        if (!socket) return;

        socket.emit('play_card', { 
            roomId,
            username,
            cardId: cardToPlay.id,
            cellIndex: index
        });
    }

    return (
        <div className="room-container">

            {/* MODALE DE FIN DE JEU */}
            {gameResult?.show && (
                <div className="game-over-overlay">
                    <div className="game-over-panel ffviii-panel">
                        <h1 className="game-over-title">{gameResult.message}</h1>
                        <button 
                            className="ffviii-button" 
                            onClick={() => navigate('/')}
                            style={{ padding: '10px 40px', fontSize: '1.2rem' }}
                        >
                            {t('game.backToMenu')}
                        </button>
                    </div>
                </div>
            )}

            <div className="wood-table" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}> 
                <div className="turn-indicator-container">
                    <h2 className={`turn-text ${currentTurn === myRoleRef.current ? 'my-turn' : 'opponent-turn'}`}>
                        {currentTurn === myRoleRef.current ? t('game.yourTurn') : t('game.opponentTurn')}
                    </h2>
                </div>
                <div className="game-layout">
                    <div className="hand-container">
                        <div className="player-name-tag ffviii-panel-mini">{username}</div>
                        <div className="cards-stack">
                            {myHand.map((card) => (
                                <div 
                                    key={card.id}
                                    className={`game-card ${selectedCardId === card.id ? 'selected' : ''}`}
                                    onClick={() => handleCardClick(card.id)}
                                >
                                    {card.image ? (
                                        <img src={card.image} alt="My Card" />
                                    ) : (
                                        <div className="card-placeholder">Card</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="board-container ffviii-panel">
                        {board.map((cellCard, index) => (
                            <div 
                                key={index} 
                                className={`board-cell ${!cellCard ? 'empty' : 'filled'}`}
                                onClick={() => handleCellClick(index)}
                            >
                                {cellCard && (
                                    <div className={`game-card ${cellCard.owner !== myRoleRef.current ? 'p2-card' : ''}`}>
                                        {cellCard.image ? (
                                            <img src={cellCard.image} alt="Card on board" />
                                        ) : (
                                            <div className="card-placeholder">Card</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    
                    <div className="hand-container">
                        <div className="player-name-tag ffviii-panel-mini opponent">{t('game.opponent')}</div>
                        <div className="cards-stack">
                            {opponentHand.map((card) => (
                                <div key={card.id} className="game-card p2-card">
                                    {card.image ? (
                                        <img src={card.image} alt="Opponent Card" />
                                    ) : (
                                        <div className="card-placeholder">Card</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Game;