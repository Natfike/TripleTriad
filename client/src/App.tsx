import './styles/App.css'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  }

  return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel">
                    <h1 className="ffviii-title">{t('home.title')}</h1>
                    <div className="menu-buttons">
                        <Link to="/authentification">
                            <button className="ffviii-button">{t('home.authenticate')}</button>
                        </Link>
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