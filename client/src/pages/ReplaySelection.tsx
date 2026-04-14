import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "../styles/global.css"
import "../styles/ReplaySelection.css"

interface Game{
    _id: string;
    roomId: string;
    players: {
        p1: { username: string },
        p2: { username: string }
    };
    winner: 'p1' | 'p2' | 'draw' | null;
    updatedAt: string;
}

function ReplaySelection() {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const myUsername = localStorage.getItem('username');

    const [replays, setReplays] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }

        axios.get(`${API_URL}/api/users/replays`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            if (!response.data.replays) {
                navigate('/');
                return;
            }
            setReplays(response.data.replays);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [API_URL, token, navigate]);

    const getMatchResult = (game: Game) => {
        if (game.winner === 'draw') {
            return { text: t('replay.result.draw'), cssClass: 'result-draw' };
        }

        const isP1 = game.players.p1.username === myUsername;
        const didP1Win = (game.winner === 'p1');

        if ((isP1 && didP1Win) || (!isP1 && !didP1Win)) {
            return { text: t('replay.result.win'), cssClass: 'result-victory' };
        } else {
            return { text: t('replay.result.lose'), cssClass: 'result-defeat' };
        }
    }

    return (
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel replay-panel">
                    
                    <div className="replay-header">
                        <h1 className="ffviii-title">{t('replay.title')}</h1>
                        <div className="replay-back-wrapper">
                            <Link to="/">
                                <button className="ffviii-button">{t('play.back')}</button>
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <p className="replay-message">{t('replay.loading')}</p>
                    ) : replays.length === 0 ? (
                        <p className="replay-message">{t('replay.noReplays')}</p>
                    ) : (
                        <div className="replays-list">
                            {replays.map((game) => {
                                const result = getMatchResult(game);
                                const opponent = game.players.p1.username === myUsername ? game.players.p2.username : game.players.p1.username;
                                const date = new Date(game.updatedAt).toLocaleDateString();

                                return (
                                    <div key={game._id} className="replay-item">
                                        <div className="replay-info">
                                            <span className="replay-date">{date}</span>
                                            <span>VS <strong className="replay-opponent">{opponent}</strong></span>
                                        </div>
                                        
                                        <div className="replay-actions">
                                            <span className={`replay-result ${result.cssClass}`}>
                                                {result.text}
                                            </span>
                                            <Link to={`/replay/${game._id}`}>
                                                <button className="ffviii-button small-button">
                                                    {t('replay.watch')}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReplaySelection