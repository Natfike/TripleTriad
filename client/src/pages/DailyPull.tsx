import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/DailyDraw.css';


interface Card {
    _id: string;
    cardname: string;
    cardRarity: number;
    cardImage: string;
}

interface Pack {
    code: string;
    coverImage: string
}


function DailyPull(){

    const { t } = useTranslation();
    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawnCards, setDrawnCards] = useState<Card[] | null>(null);
    const [packs, setPacks] = useState<Pack[]>([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/');
        }

        try {
            axios.get(`${API_URL}/api/packs/`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setPacks(response.data);
                })
        } catch (error) {
            console.error(error);
        }
    }, [API_URL, token]);

    const prevPack = () => {
        setCurrentIndex(((prev) => (prev - 1 + packs.length) % packs.length));
    }

    const nextPack = () => {
        setCurrentIndex(((prev) => (prev + 1) % packs.length));
    }

    const leftIndex = (currentIndex - 1 + packs.length) % packs.length;
    const rightIndex = (currentIndex + 1) % packs.length;

    const handleOpenPack = () => {
        setIsDrawing(true);
        setMessage('');

        axios.post(`${API_URL}/api/users/dailyPull`, {
            packCode: packs[currentIndex].code
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
            setDrawnCards(response.data.cards);
            setMessage(t('dailyPull.success'));
        })
        .catch(error => {
            console.error('Error opening pack:', error);
            setMessage(t('dailyPull.error'));
        })
        .finally(() => {
            setIsDrawing(false);
        });
    }

    return (
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel gallery-panel" style={{ position: 'relative' }}>

                    <div className="gallery-header">
                        <h1 className="ffviii-title">{t('dailyPull.title')}</h1>
                        <Link to="/">
                            <button className="ffviii-button">{t('dailyPull.back')}</button>
                        </Link>
                    </div>

                    {message && <div className="error-message">{message}</div>}

                    <div className="carousel-area">
                        <button className="deck-arrow" onClick={prevPack}>&lt;</button>

                        <div className="pack-display side" onClick={prevPack}>
                                <img src={packs[leftIndex]?.coverImage} alt={packs[leftIndex]?.code} className="booster-image" />
                                <span>{packs[leftIndex]?.code}</span>
                        </div>

                        <div className="pack-display active" onClick={handleOpenPack}>
                                <img src={packs[currentIndex]?.coverImage} alt={packs[currentIndex]?.code} className="booster-image" />
                                <span>{packs[currentIndex]?.code}</span>
                        </div>

                        <div className="pack-display side" onClick={nextPack}>
                                <img src={packs[rightIndex]?.coverImage} alt={packs[rightIndex]?.code} className="booster-image" />
                                <span>{packs[rightIndex]?.code}</span>
                        </div>

                        <button className="deck-arrow" onClick={nextPack}>&gt;</button>
                    </div>

                    <div className="open-action-area">
                        <button
                            className="big-open-button"
                            onClick={handleOpenPack}
                            disabled={isDrawing}
                        >
                            {isDrawing ? t('dailyPull.opening') : t('dailyPull.open')}
                        </button>
                    </div>

                    {drawnCards && (
                        <div className="reward-overlay">
                            <h2 className="reward-title">{t('dailyPull.rewards')}</h2>
                            <div className="reward-cards">
                                {drawnCards.map((card, index) => (
                                    <img key={index} src={card.cardImage} alt={card.cardname} className="reward-card" />
                                ))}
                            </div>
                            <button className="ffviii-button" onClick={() => navigate('/')}>
                                {t('dailyPull.close')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DailyPull;