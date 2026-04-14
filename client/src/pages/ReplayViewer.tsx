import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../styles/ReplayViewer.css';

interface GameData {
    players: {
        p1: { username: string };
        p2: { username: string };
    };
    history: {
        player: string;
        cardId: string;
        cellIndex: number;
    }[];
    board: { cardId: string, owner: string }[];
}

interface Card {
    _id: string;
    cardName: string;
    cardImage: string;
    numbers: { top: string; left: string; right: string; bottom: string };
}

function ReplayViewer() {
    const { gameId } = useParams();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const [game, setGame] = useState<GameData | null>(null);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/authentification');
            return;
        }

        const fetchGame = axios.get(`${API_URL}/api/users/replays/${gameId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const fetchCards = axios.get(`${API_URL}/api/cards`);

        Promise.all([fetchGame, fetchCards])
            .then(([gameRes, cardsRes]) => {
                setGame(gameRes.data.replay);
                setAllCards(cardsRes.data);
                setLoading(false);
            })
            .catch(() => {
                navigate('/replay');
            });
    }, [gameId, token, API_URL, navigate]);

    if (loading || !game) {
        return (
            <div className="room-container">
                <p className="replay-message">{t('replay.loading')}</p>
            </div>
        );
    }

    const parseValue = (value: string) => value === 'A' ? 10 : parseInt(value) || 0;

    const buildBoardAtCurrentTime = () => {
        const currentBoard = Array(9).fill(null).map(() => ({ cardId: null as string | null, owner: null as string | null }));
        
        const cardsDict: Record<string, any> = {};
        allCards.forEach(c => cardsDict[c._id] = c.numbers);

        for (let i = 0; i < currentMoveIndex; i++) {
            const move = game.history[i];
            const playerRole = move.player === game.players.p1.username ? 'p1' : 'p2';
            currentBoard[move.cellIndex] = { cardId: move.cardId, owner: playerRole };
            const playedCardStats = cardsDict[move.cardId];
            if (!playedCardStats) continue;

            const x = move.cellIndex % 3;
            const y = Math.floor(move.cellIndex / 3);

            const checks = [
                { nx: x, ny: y - 1, dir: 'top', oppDir: 'bottom' },
                { nx: x - 1, ny: y, dir: 'left', oppDir: 'right' },
                { nx: x + 1, ny: y, dir: 'right', oppDir: 'left' },
                { nx: x, ny: y + 1, dir: 'bottom', oppDir: 'top' }
            ];

            for (const check of checks) {
                if (check.nx >= 0 && check.nx < 3 && check.ny >= 0 && check.ny < 3) {
                    const neighborIndex = check.ny * 3 + check.nx;
                    const neighborCell = currentBoard[neighborIndex];
                    if (neighborCell.owner && neighborCell.owner !== playerRole && neighborCell.cardId) {
                        const neighborCardStats = cardsDict[neighborCell.cardId];
                        if (neighborCardStats) {
                            const playedValue = parseValue(playedCardStats[check.dir]);
                            const neighborValue = parseValue(neighborCardStats[check.oppDir]);
                            if (playedValue > neighborValue) {
                                currentBoard[neighborIndex].owner = playerRole;
                            }
                        }
                    }
                }
            }
        }
        return currentBoard;
    };

    const board = buildBoardAtCurrentTime();
    const currentMove = currentMoveIndex > 0 ? game.history[currentMoveIndex - 1] : null;

    return (
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel replay-panel">
                    
                    <div className="replay-header">
                        <h1 className="ffviii-title">{game.players.p1.username} VS {game.players.p2.username}</h1>
                        <div className="replay-back-wrapper">
                            <Link to="/replay">
                                <button className="ffviii-button">{t('play.back', 'RETOUR')}</button>
                            </Link>
                        </div>
                    </div>

                    <div className="replay-container">
                        <div className="replay-info-banner">
                            {currentMove 
                                ? t('replay.turnPlayed', { index : currentMoveIndex, player: currentMove.player }) 
                                : t('replay.start')}
                        </div>

                        <div className="replay-board" style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 100px)', 
                            gap: '10px', 
                            background: 'rgba(0,0,0,0.5)', 
                            padding: '10px', 
                            borderRadius: '5px' 
                        }}>
                            {board.map((cell, idx) => {
                                const cardData = cell.cardId ? allCards.find(c => c._id === cell.cardId) : null;
                                
                                return (
                                    <div key={idx} className="replay-cell" style={{ 
                                        width: '100px', height: '130px', 
                                        border: '1px dashed #555', 
                                        position: 'relative' 
                                    }}>
                                        {cardData && (
                                            <div style={{
                                                width: '100%', height: '100%',
                                                boxShadow: cell.owner === 'p1' ? '0 0 10px blue' : '0 0 10px red',
                                                border: cell.owner === 'p1' ? '2px solid blue' : '2px solid red'
                                            }}>
                                                <img 
                                                    src={cardData.cardImage} 
                                                    alt={cardData.cardName} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="replay-controls" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                            <button 
                                className="ffviii-button" 
                                onClick={() => setCurrentMoveIndex(0)}
                                disabled={currentMoveIndex === 0}
                            >&lt;&lt;</button>
                            
                            <button 
                                className="ffviii-button" 
                                onClick={() => setCurrentMoveIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentMoveIndex === 0}
                            >◀</button>

                            <input 
                                type="range" 
                                min="0" 
                                max={game.history.length} 
                                value={currentMoveIndex}
                                onChange={(e) => setCurrentMoveIndex(parseInt(e.target.value))}
                                style={{ width: '300px', cursor: 'pointer' }}
                            />

                            <button 
                                className="ffviii-button" 
                                onClick={() => setCurrentMoveIndex(prev => Math.min(game.history.length, prev + 1))}
                                disabled={currentMoveIndex === game.history.length}
                            >▶</button>

                            <div style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', minWidth: '80px', textAlign: 'center' }}>
                                {currentMoveIndex} / {game.history.length}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReplayViewer;