import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import axios from 'axios';


function App() {
  const { t, i18n } = useTranslation();
  const API_URL = import.meta.env.VITE_API_URL;
  console.log('API_URL:', API_URL);

  const [dailyPullEnabled, setDailyPullEnabled] = useState(false);
  const [isDeckComplete, setIsDeckComplete] = useState(false);
  const [hasReplays, setHasReplays] = useState(false);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload();
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  }

  useEffect(() => {
        if (!token) {
            setDailyPullEnabled(false);
            setIsDeckComplete(false);
            return;
        }
        
        try {
            axios.get(`${API_URL}/api/users/dailyPullAvailable`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setDailyPullEnabled(response.data.dailyPullAvailable);
                });


            axios.get(`${API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    const userDecks = response.data.decks || [];
                    const hasCompleteDeck = userDecks.some(deck => deck.cards && deck.cards.length === 5 && deck.cards.every(cardId => cardId !== null));
                    setIsDeckComplete(hasCompleteDeck);
                });

            axios.get(`${API_URL}/api/users/replays`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
                .then(response => {
                    setHasReplays(response.data.replays && response.data.replays.length > 0);
                });
        } catch (error) {
            setDailyPullEnabled(false);
        }
  }, [token])

  return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel">
                    <h1 className="ffviii-title">{t('home.title')}</h1>
                    <div className="menu-buttons">
                        {isAuthenticated ? (
                            <>
                                <Link to={isDeckComplete ? "/play" : "/deck"}>
                                    <button className="ffviii-button" disabled={!isDeckComplete}>
                                        {t('home.play')}
                                    </button>
                                </Link>
                                <button onClick={handleLogout} className="ffviii-button">
                                    {t('home.logout')}
                                </button>
                                <Link to="/deck">
                                    <button className="ffviii-button">{t('home.deck')}</button>
                                </Link>
                                <Link to="/dailyPull">
                                    <button 
                                    className="ffviii-button"
                                    disabled={!dailyPullEnabled}
                                    >
                                        {t('home.dailyPull')}
                                    </button>
                                </Link>
                                <Link to={hasReplays ? "/replay" : "#"}>
                                    <button className="ffviii-button" disabled={!hasReplays}>
                                        {t('home.replay')}
                                    </button>
                                </Link>
                            </>
                        ) : (
                            <Link to="/authentification">
                                <button className="ffviii-button">{t('home.authenticate')}</button>
                            </Link>
                        )}
                        <Link to="/gallery">
                            <button className="ffviii-button">{t('home.gallery')}</button>
                        </Link>
                        
                        {/* TODO: Move this to a better place, and add style */}
                        <button onClick={toggleLanguage} className="ffviii-button">
                            {i18n.language === 'en' ? 'Français' : 'English'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App