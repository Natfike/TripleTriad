import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/global.css'; 
import '../styles/NotFound.css';

function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel notfound-panel">
                    <h1 className="ffviii-title notfound-title">
                        404
                    </h1>
                    <h2 className="gallery-subtitle notfound-message">
                        {t('error.notFound')}
                    </h2>
                    <Link to="/">
                        <button className="ffviii-button notfound-button">
                            {t('error.returnHome')}
                        </button>
                    </Link>

                </div>
            </div>
        </div>
    );
}

export default NotFound;