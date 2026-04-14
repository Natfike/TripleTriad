import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Gallery.css';

interface Card {
    _id: string;
    cardName: string;
    cardImage: string;
    cardRarity: string;
}

function Gallery() {

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');
    const [cards, setCards] = useState<Card[]>([]);
    const [ownedCardIds, setOwnedCardIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    // Fetch all cards from server
    useEffect(() => {
        const fetchAllCards = axios.get(`${API_URL}/api/cards`)
        let fetchUserCollection = Promise.resolve({ data: { cardCollection: [] } });

        if (token) {
            fetchUserCollection = axios.get(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }

        Promise.all([fetchAllCards, fetchUserCollection])
            .then(([cardsResponse, userResponse]) => {
                setCards(cardsResponse.data);
                setOwnedCardIds(userResponse.data.cardCollection || []);
            })
            .catch(error => {
                console.error('Error fetching cards:', error);
                setError(t('gallery.error'));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [API_URL, token]);

    return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel gallery-panel">
                    <div className="gallery-header">
                        <h1 className="ffviii-title">{t('gallery.title')}</h1>
                        <Link to="/">
                            <button className="ffviii-button">{t('gallery.back')}</button>
                        </Link>
                    </div>
                    
                    <p className="gallery-subtitle">{t('gallery.subtitle')}</p>
                    
                    {isLoading && <p>{t('gallery.loading')}</p>}
                    {error && <p className="error-message">{t('gallery.error')}</p>}

                    <div className="gallery-grid">
                        {!isLoading && cards.map((card) => {
                            const isOwned = ownedCardIds.includes(card._id);
                            return (
                                <div key={card._id} className="ffviii-card-item">
                                    <h2 className="card-name">{card.cardName}</h2>
                                    <div className="card-image-container">
                                        <img src={card.cardImage} alt={card.cardName} loading="lazy" className={!isOwned ? 'card-not-owned' : ''} />
                                    </div>
                                    <p className="card-rarity">{t('gallery.rarity')} {card.cardRarity}</p>
                                </div>
                            );
                        })}
                    </div>

                </div>
                
            </div>
        </div>
    )
}

export default Gallery;