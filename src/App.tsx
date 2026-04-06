import './App.css'
import { Link } from 'react-router-dom'

function App() {
  return(
        <div className="room-container">
            <div className="wood-table">
                <div className="ffviii-panel">
                    <h1 className="ffviii-title">Home</h1>
                    <Link to="/gallery">
                        <button className="ffviii-button">Go to Gallery</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default App