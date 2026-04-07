import { Link } from 'react-router-dom';
import cards from '../data/cards.json';
import { useTranslation } from 'react-i18next';

function Gallery() {
    const { t } = useTranslation();
    const allCards = cards.flatMap(group => 
        Object.values(group.cardList).flat()
    );

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
                    
                    <div className="gallery-grid">
                        {allCards.map((card, index) => (
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