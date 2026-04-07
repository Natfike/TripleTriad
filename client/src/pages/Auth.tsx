import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

function Auth() {
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
        console.log('Register attempt:', { registerUsername, registerPassword });

        axios.post(`${API_URL}/api/auth/register`, {
            username: registerUsername,
            password: registerPassword
        })
        .then(response => {
            console.log('Registration successful:', response.data);
            setRegisterSuccess('Account created successfully! You can now log in.');
            setRegisterError('');
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

    // UI
    return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel auth-panel">
                    <h1 className="ffviii-title">Authentication</h1>
                    
                    <div className="menu-auth">
                        
                        { /* Login Form */ }
                        <form className="auth-form" onSubmit={handleLogin}>
                            <h2 className="auth-subtitle">Login</h2>

                            {loginError && <div className="error-message">{loginError}</div>}

                            <div className="input-group">
                                <label>Username</label>
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
                                <label>Password</label>
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
                                {isLoginLoading ? 'Signing In...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="auth-divider"></div>

                        { /* Registration Form */ }
                        <form className="auth-form" onSubmit={handleRegister}>
                            <h2 className="auth-subtitle">Register</h2>
                            
                            {registerError && <div className="error-message">{registerError}</div>}
                            {registerSuccess && <div className="success-message">{registerSuccess}</div>}

                            <div className="input-group">
                                <label>Username</label>
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
                                <label>Password</label>
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
                                {isRegisterLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Auth;