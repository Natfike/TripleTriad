import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import '../styles/Deck.css';


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

function Deck() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('token');

    const [ownedCards, setOwnedCards] = useState<Card[]>([]);
    const [decks, setDecks] = useState<Deck[]>([]);
    const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
    
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError(t('deck.notAuthenticated'));
            setIsLoading(false);
            navigate('/');
        }

        const fetchAllCards = axios.get(`${API_URL}/api/cards`);
        const fetchUserCollection = axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        Promise.all([fetchAllCards, fetchUserCollection])
            .then(([cardsResponse, userResponse]) => {
                const allCards: Card[] = cardsResponse.data;
                const ownedCardIds: string[] = userResponse.data.cardCollection || [];

                const userDecks = userResponse.data.decks || [];


                const ownedCards = allCards.filter(card => ownedCardIds.includes(card._id));
                setOwnedCards(ownedCards);
                setDecks(userDecks.length > 0 ? userDecks : [{ name: t('deck.defaultName'), cards: Array(5).fill(null) }]);
            }).catch(error => {
                console.error('Error fetching cards or user collection:', error);
                setError(t('deck.error'));
            }).finally(()=>{
                setIsLoading(false);
            });
        }, [API_URL, token]);

    const nextDeck = () => {
        if(currentDeckIndex < decks.length - 1) {
            setCurrentDeckIndex(currentDeckIndex + 1);
        }
    };

    const previousDeck = () => {
        if(currentDeckIndex > 0) {
            setCurrentDeckIndex(currentDeckIndex - 1);
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDecks = [...decks];
        newDecks[currentDeckIndex].name = e.target.value;
        setDecks(newDecks);
    }

    const addCardToDeck = (cardId: string) => {
        const newDecks = [...decks];
        const currentCards = [...newDecks[currentDeckIndex].cards];
        
        if (currentCards.includes(cardId)) return;

        const emptySlotIndex = currentCards.indexOf(null);

        if (emptySlotIndex !== -1) {
            currentCards[emptySlotIndex] = cardId;
            newDecks[currentDeckIndex].cards = currentCards;
            setDecks(newDecks);
        }
    };

    const removeCardFromDeck = (slotIndex: number) => {
        const newDecks = [...decks];
        const currentCards = [...newDecks[currentDeckIndex].cards];
        
        currentCards[slotIndex] = null;
        newDecks[currentDeckIndex].cards = currentCards;
        setDecks(newDecks);
    };

    const handleSaveDecks = () => {
        if (!token) {
            setError(t('deck.notAuthenticated'));
            return;
        }

        setIsSaving(true);
        setSaveMessage('');

        axios.post(`${API_URL}/api/users/decks`, { decks }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(() => {
            setSaveMessage(t('deck.saveSuccess'));
        })
        .catch(error => {
            console.error('Error saving decks:', error);
            setSaveMessage(t('deck.saveError'));
        })
        .finally(() => {
            setIsSaving(false);
        });
    }

    if (decks.length === 0 && !isLoading) {return null;}

    const currentDeck = decks[currentDeckIndex];

    return(
       <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel gallery-panel">
                    <div className="gallery-header">
                        <div className="deck-title-section">
                            <span className='deck-counter'>{currentDeckIndex + 1} / {decks.length}</span>
                            
                            <input
                                type="text"
                                className="ffviii-input deck-name-input"
                                value={currentDeck?.name || ''}
                                onChange={handleNameChange}
                                maxLength={15}
                                placeholder={t('deck.defaultName')}
                            />
                            <div className="deck-message-container">
                                {saveMessage && (
                                    <span className={saveMessage !== '' ? 'text-success' : 'text-error'}>
                                        {saveMessage}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="deck-actions-section">
                            <button 
                                className="ffviii-button" 
                                onClick={handleSaveDecks}
                                disabled={isSaving}
                            >
                                {isSaving ? '...' : t('deck.save')}
                            </button>
                            
                            <Link to="/">
                                <button className="ffviii-button">{t('deck.back')}</button>
                            </Link>
                        </div>
                    </div>

                    {isLoading && <p>{t('deck.loading')}</p>}
                    {error && <p className="error-message">{t('deck.error')}</p>}

                    {!isLoading && !error && (
                        <>
                            <div className="deck-builder-area">
                                <button className='deck-arrow' onClick={previousDeck} disabled={currentDeckIndex <= 0}>
                                    &lt;
                                </button>

                                <div className="deck-slots">
                                    {currentDeck["cards"].map((cardId, index) => {
                                        const cardData = ownedCards.find(card => card._id === cardId);

                                        return (
                                            <div key={index} className={`deck-slot ${cardData ? 'has-card' : 'empty'}`} onClick={() => {
                                                removeCardFromDeck(index);
                                            }}>
                                                {cardData ? (
                                                    <img src={cardData.cardImage} alt={cardData.cardName} className="deck-card-image" />
                                                ) : (
                                                    <span className='empty-slot-text'></span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                <button className='deck-arrow' onClick={nextDeck} disabled={currentDeckIndex >= decks.length - 1}>
                                    &gt;
                                </button>
                            </div>

                            <h2 className="gallery-subtitle">{t('deck.cardList')}</h2>
                            <div className="gallery-grid">
                                {ownedCards.map((card) => {
                                    const isEquipped = currentDeck.cards.includes(card._id);
                                    return (
                                        <div key={card._id} className="ffviii-card-item" onClick={() => addCardToDeck(card._id)}>
                                        <div className="card-image-container">
                                            <img 
                                                src={card.cardImage} 
                                                alt={card.cardName} 
                                                className={`card-image ${isEquipped ? 'card-not-owned' : ''}`} 
                                                loading='lazy' 
                                            />
                                        </div>
                                    </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
       </div>
    )
}

export default Deck