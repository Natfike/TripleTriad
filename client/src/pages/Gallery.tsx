import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';

function Gallery() {

    const API_URL = import.meta.env.VITE_API_URL;
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();

    // Fetch all cards from server
    useEffect(() => {
        axios.get(`${API_URL}/api/cards`)
        .then(response => {
            setCards(response.data);
            setIsLoading(false);
        })
        .catch(err => {
            setError(err.message);
            setIsLoading(false);
        })
    }, [API_URL]);

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
                        {cards.map((card, index) => (
                            <div key={index} className="ffviii-card-item">
                                <h2 className="card-name">{card.cardName}</h2>
                                <div className="card-image-container">
                                    <img src={card.cardImage} alt={card.cardName} loading="lazy" />
                                </div>
                                <p className="card-rarity">{t('gallery.rarity')} {card.cardRarity}</p>
                            </div>
                        ))}
                    </div>

                </div>
                
            </div>
        </div>
    )
}

export default Gallery;