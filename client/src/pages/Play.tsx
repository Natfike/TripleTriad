import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import '../styles/global.css';
import '../styles/play.css';

type ViewState = 'menu' | 'create' | 'join' |'lobby';

function Play(){

    const { t } = useTranslation();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [statusText, setStatusText] = useState(t('play.matchmaking.idle'));
    const [currentView, setCurrentView] = useState<ViewState>('menu');
    const [roomName, setRoomName] = useState('');
    const [roomRules, setRoomRules] = useState('open');
    const [joinRoomId, setJoinRoomId] = useState('');
    const [currentRoomId, setCurrentRoomId] = useState('');
    const [players, setPlayers] = useState<string[]>([]);
    const username = localStorage.getItem('username');
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setStatusText(t('play.matchmaking.connected'));
        });

        newSocket.on('room_created', (data) => {
            setCurrentRoomId(data.roomId);
            setPlayers([username || '']);
            setCurrentView('lobby');
            setStatusText(t('play.matchmaking.roomCreated', { roomId: data.roomId }));
        });

        newSocket.on('room_joined', (data) => {
            setCurrentRoomId(data.roomId);
            setPlayers(data.players);
            setCurrentView('lobby');
            setStatusText(t('play.matchmaking.roomJoined', { roomId: data.roomId }));
        });

        newSocket.on('player_joined', (data) => {
            setPlayers((prev) => [...prev, data.username]);
            setStatusText(t('play.matchmaking.playerJoined', { username: data.username }));
        });

        newSocket.on('player_left', (data) => {
            setPlayers((prev) => prev.filter(p => p !== data.username));
            setStatusText(t('play.matchmaking.playerLeft', { username: data.username }));
        });

        return () => {
            newSocket.disconnect();
        }

    }, [API_URL, t]);

    const handleCreateGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        if (socket) {
            e.preventDefault();
            if (socket && roomName.trim() !== '') {
                socket.emit('create_room', { roomName, roomRules, username });
            }
        }
    }

    const handleJoinGame = (e: React.SubmitEvent<HTMLFormElement>) => {
        if (socket) {
            e.preventDefault();

            if (socket && joinRoomId.trim() !== '') {
                socket.emit('join_room', { roomId: joinRoomId, username });
            }
        }
    }


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
                    {/* Joueur 1 (L'hôte) */}
                    <div className={`player-slot ${player1 ? 'filled' : ''}`}>
                        {player1 ? (
                            <><span>{t('play.player1')}</span><h3>{player1}</h3></>
                        ) : (
                            <span>{t('play.waiting')}</span>
                        )}
                    </div>

                    <div className="vs-badge">{t('play.vs')}</div>

                    {/* Joueur 2 (Le Challenger) */}
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
                    onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())} // Souvent mieux en majuscules pour les ID
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

                </div>
            </div>
        </div>
    );
}

export default Play;