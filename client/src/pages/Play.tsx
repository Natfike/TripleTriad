import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext"; 
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import '../styles/global.css';
import '../styles/Play.css';

type ViewState = 'menu' | 'create' | 'join' |'lobby' | 'choose_deck';

interface Card {
    _id: string;
    cardName: string;
    cardRarity: string;
    cardImage: string;
}

interface Deck {
    name: string;
    cards: (string | null)[];
}

function Play(){

    const { t } = useTranslation();
    const { socket } = useSocket();
    const [statusText, setStatusText] = useState(t('play.matchmaking.idle'));
    const [currentView, setCurrentView] = useState<ViewState>('menu');
    const [roomName, setRoomName] = useState('');
    const [roomRules, setRoomRules] = useState('open');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [currentRoomId, setCurrentRoomId] = useState('');
    const [players, setPlayers] = useState<string[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
    const [allCards, setAllCards] = useState<Card[]>([]);
    const [disableChoiceDeckButton, setDisableChoiceDeckButton] = useState(false);
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {

        if (!token) {
            navigate('/');
        }

        const fetchDecks = axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            const userDecks = response.data.decks || [];
            const hasCompleteDeck = userDecks.some(deck => deck.cards.every((cardId: string | null) => cardId !== null));
            if (!hasCompleteDeck) {
                navigate('/deck');
            }
            return response;
        });

        const fetchAllCards = axios.get(`${API_URL}/api/cards`);

        Promise.all([fetchDecks, fetchAllCards])
            .then(([userResponse, cardsResponse]) => {
                const userDecks = userResponse.data.decks || [];
                setDecks(userDecks.length > 0 ? userDecks : [{ name: t('deck.defaultName'), cards: Array(5).fill(null) }]);
                setAllCards(cardsResponse.data);
            }).catch(error => {
                console.error('Error fetching decks or cards:', error);
            });

        if (decks.length > 0) {
            const hasCompleteDeck = decks.some(deck => deck.cards.every(cardId => cardId !== null));
            if (!hasCompleteDeck) {
                navigate('/decks');
            }
        }

        /* SOCKET */

        if (!socket) return;

        socket.on('connect', () => {
            setStatusText(t('play.matchmaking.connected'));
        });

        socket.on('room_created', (data) => {
            setCurrentRoomId(data.roomId);
            setPlayers([username || '']);
            setCurrentView('lobby');
            setStatusText(t('play.matchmaking.roomCreated', { roomId: data.roomId }));
        });

        socket.on('room_joined', (data) => {
            setCurrentRoomId(data.roomId);
            setPlayers(data.players);
            setCurrentView('lobby');
            setStatusText(t('play.matchmaking.roomJoined', { roomId: data.roomId }));
        });

        socket.on('player_joined', (data) => {
            setPlayers((prev) => [...prev, data.username]);
            setStatusText(t('play.matchmaking.playerJoined', { username: data.username }));
        });

        socket.on('player_left', (data) => {
            setPlayers((prev) => prev.filter(p => p !== data.username));
            setStatusText(t('play.matchmaking.playerLeft', { username: data.username }));
        });

        socket.on('choose_deck', () => {
            setCurrentView('choose_deck');
        });

        socket.on('waiting_for_opponent', () => {
            setDisableChoiceDeckButton(true);
            setStatusText(t('play.matchmaking.waitingForOpponent'));
        });

        socket.on('start_game', (data) => {
            navigate('/game', { state: { roomId: data.roomId, players: data.players, decks: data.decks } });
        });

        return () => {
            socket.off('room_created');
            socket.off('room_joined');
            socket.off('player_joined');
            socket.off('player_left');
            socket.off('choose_deck');
            socket.off('waiting_for_opponent');
            socket.off('start_game');
        }

    }, [API_URL, t]);

    const handleSelectDeck = () => {
        if (socket) {
            socket.emit('deck_selected', { roomId: currentRoomId, player: username, deck: decks[currentDeckIndex].cards });
        }
    };

    const handleCreateGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        if (socket) {
            e.preventDefault();
            if (socket && roomName.trim() !== '') {
                socket.emit('create_room', { roomName, roomRules, username });
            }
        }
    };

    const handleJoinGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        if (socket) {
            e.preventDefault();

            if (socket && joinRoomId.trim() !== '') {
                socket.emit('join_room', { roomId: joinRoomId, username });
            }
        }
    };


const renderMenu = () => (
        <div className="play-menu-container">
            <div className="play-option-card" onClick={() => setCurrentView('create')}>
                <h3>{t('play.createGame')}</h3>
                <p>{t('play.createGameDescription')}</p>
            </div>
            <div className="play-option-card" onClick={() => setCurrentView('join')}>
                <h3>{t('play.joinGame')}</h3>
                <p>{t('play.joinGameDescription')}</p>
            </div>
        </div>
    );

    const renderLobby = () => {
        const player1 = players[0];
        const player2 = players[1];

        return (
            <div className="lobby-container">
                <h2 className="gallery-subtitle">{t('play.lobby')}</h2>
                <div className="room-info-badge">{t('play.roomId')} {currentRoomId}</div>

                <div className="players-vs-area">
                    <div className={`player-slot ${player1 ? 'filled' : ''}`}>
                        {player1 ? (
                            <><span>{t('play.player1')}</span><h3>{player1}</h3></>
                        ) : (
                            <span>{t('play.waiting')}</span>
                        )}
                    </div>

                    <div className="vs-badge">{t('play.vs')}</div>

                    <div className={`player-slot ${player2 ? 'filled' : ''}`}>
                        {player2 ? (
                            <><span>{t('play.player2')}</span><h3>{player2}</h3></>
                        ) : (
                            <span>{t('play.waiting')}</span>
                        )}
                    </div>
                </div>

                <div className="action-buttons" style={{ marginTop: '30px' }}>
                    <button 
                        className="ffviii-button" 
                        onClick={() => {
                            socket?.emit('leave_room', { roomId: currentRoomId, player: username });
                            setCurrentView('menu');
                        }}
                    >
                        {t('play.leave')}
                    </button>
                </div>
            </div>
        );
    };

    const renderCreateForm = () => (
        <form className="play-form-container" onSubmit={handleCreateGame}>
            <h2 className="gallery-subtitle">{t('play.createGame')}</h2>
            
            <div className="form-group">
                <label>{t('play.gameName')}</label>
                <input 
                    type="text" 
                    className="ffviii-input" 
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    required
                    placeholder="Ex: Squal's Gunblade"
                />
            </div>

            <div className="form-group">
                <label>{t('play.gameRules')}</label>
                <select 
                    className="ffviii-select"
                    value={roomRules}
                    onChange={(e) => setRoomRules(e.target.value)}
                >
                    <option value="open">{t('play.open')}</option>
                    <option value="closed">{t('play.closed')}</option>
                </select>
            </div>

            <div className="action-buttons">
                <button type="submit" className="ffviii-button">{t('play.createGame')}</button>
                <button type="button" className="ffviii-button" onClick={() => setCurrentView('menu')}>{t('play.cancel')}</button>
            </div>
        </form>
    );

    const renderJoinForm = () => (
        <form className="play-form-container" onSubmit={handleJoinGame}>
            <h2 className="gallery-subtitle">{t('play.joinGame')}</h2>
            
            <div className="form-group">
                <label>{t('play.roomId')}</label>
                <input 
                    type="text" 
                    className="ffviii-input" 
                    value={joinRoomId}
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                    required
                    placeholder="Ex: A7B9-X2"
                />
            </div>

            <div className="action-buttons">
                <button type="submit" className="ffviii-button">{t('play.joinGame')}</button>
                <button type="button" className="ffviii-button" onClick={() => setCurrentView('menu')}>{t('play.cancel')}</button>
            </div>
        </form>
    );

    const renderChooseDeck = () => {
        if (decks.length === 0 || allCards.length === 0) return <p>{t('play.loading')}</p>;

        const currentDeck = decks[currentDeckIndex];

        const isCurrentDeckComplete = currentDeck.cards.length === 5 && currentDeck.cards.every(cardId => cardId !== null);

        return (
            <div className="choose-deck-container">
                <h2 className="gallery-subtitle choose-deck-subtitle">
                    {t('play.chooseYourDeck') || 'CHOISISSEZ VOTRE DECK'}
                </h2>
                
                <h3 className="choose-deck-name">
                    {currentDeck.name} ({currentDeckIndex + 1}/{decks.length})
                </h3>

                <div className="deck-builder-area choose-deck-area">
                    <button 
                        className="deck-arrow" 
                        onClick={() => setCurrentDeckIndex(prev => prev > 0 ? prev - 1 : prev)} 
                        disabled={currentDeckIndex === 0}
                    >
                        &lt;
                    </button>

                    <div className="deck-slots">
                        {currentDeck.cards.map((cardId, index) => {
                            const cardData = allCards.find(c => c._id === cardId);

                            return (
                                <div key={index} className={`deck-slot readonly ${cardData ? 'has-card' : ''}`}>
                                    {cardData ? (
                                        <img 
                                            src={cardData.cardImage} 
                                            alt={cardData.cardName} 
                                            className="deck-slot-image" 
                                        />
                                    ) : (
                                        <span className="empty-slot-text">{t('deck.emptySlot')}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button 
                        className="deck-arrow" 
                        onClick={() => setCurrentDeckIndex(prev => prev < decks.length - 1 ? prev + 1 : prev)} 
                        disabled={currentDeckIndex === decks.length - 1}
                    >
                        &gt;
                    </button>
                </div>

                <button 
                    className="big-open-button choose-deck-ready-btn" 
                    onClick={handleSelectDeck}
                    disabled={disableChoiceDeckButton || !isCurrentDeckComplete}
                >
                    {t('play.ready')}
                </button>
                
            </div>
        );
    };

    return (
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel gallery-panel" style={{ alignItems: 'center' }}>
                    
                    <div className="gallery-header">
                        <h1 className="ffviii-title">{t('play.multiplayer')}</h1>
                        <Link to="/">
                            <button className="ffviii-button">{t('play.back')}</button>
                        </Link>
                    </div>

                    <p style={{ color: '#aaa', fontFamily: "'VT323', monospace", fontSize: '1.2rem', margin: '0' }}>
                        {statusText}
                    </p>

                    {currentView === 'menu' && renderMenu()}
                    {currentView === 'create' && renderCreateForm()}
                    {currentView === 'join' && renderJoinForm()}
                    {currentView === 'lobby' && renderLobby()}
                    {currentView === 'choose_deck' && renderChooseDeck()}

                </div>
            </div>
        </div>
    );
}

export default Play;