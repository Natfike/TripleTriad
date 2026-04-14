import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Auth.css';

function Auth() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;

    // States for login form
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // States for registration form
    const [registerUsername, setRegisterUsername] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');

    const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoginLoading(true);
        setLoginError('');
        axios.post(`${API_URL}/api/auth/login`, {
            username: loginUsername,
            password: loginPassword
        })
        .then(response => {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            navigate('/');
        })
        .catch(error => {
            setLoginError(error.response?.data?.message || 'Login failed');
        })
        .finally(() => {
            setIsLoginLoading(false);
        });
    };

    const handleRegister = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        axios.post(`${API_URL}/api/auth/register`, {
            username: registerUsername,
            password: registerPassword
        })
        .then(response => {
            setRegisterSuccess('Account created successfully! You can now log in.');
            setRegisterError('');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('username', response.data.username);
            navigate('/');
        })
        .catch(error => {
            console.error('Registration error:', error.response?.data || error.message);
            setRegisterError(error.response?.data?.message || 'Registration failed');
            setRegisterSuccess('');
        })
        .finally(() => {
            setIsRegisterLoading(false);
        });
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/');
        }
    }, [navigate]);

    // UI
    return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel auth-panel">
                    <h1 className="ffviii-title">{t('auth.title')}</h1>
                    
                    <div className="menu-auth">
                        
                        { /* Login Form */ }
                        <form className="auth-form" onSubmit={handleLogin}>
                            <h2 className="auth-subtitle">{t('auth.login')}</h2>

                            {loginError && <div className="error-message">{loginError}</div>}

                            <div className="input-group">
                                <label>{t('auth.username')}</label>
                                <input 
                                    type="text" 
                                    className="ffviii-input"
                                    value={loginUsername}
                                    onChange={(e) => setLoginUsername(e.target.value)}
                                    required
                                    disabled={isLoginLoading}
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>{t('auth.password')}</label>
                                <input 
                                    type="password" 
                                    className="ffviii-input"
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    disabled={isLoginLoading}
                                />
                            </div>
                            
                            <button type="submit" className="ffviii-button" disabled={isLoginLoading}>
                                {isLoginLoading ? t('auth.signing_in') : t('auth.sign_in')}
                            </button>
                        </form>

                        <div className="auth-divider"></div>

                        { /* Registration Form */ }
                        <form className="auth-form" onSubmit={handleRegister}>
                            <h2 className="auth-subtitle">{t('auth.register')}</h2>

                            {registerError && <div className="error-message">{registerError}</div>}
                            {registerSuccess && <div className="success-message">{registerSuccess}</div>}

                            <div className="input-group">
                                <label>{t('auth.username')}</label>
                                <input 
                                    type="text" 
                                    className="ffviii-input"
                                    value={registerUsername}
                                    onChange={(e) => setRegisterUsername(e.target.value)}
                                    required
                                    disabled={isRegisterLoading}
                                />
                            </div>
                            
                            <div className="input-group">
                                <label>{t('auth.password')}</label>
                                <input 
                                    type="password" 
                                    className="ffviii-input"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    required
                                    disabled={isRegisterLoading}
                                />
                            </div>
                            
                            <button type="submit" className="ffviii-button" disabled={isRegisterLoading}>
                                {t('auth.create')}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;