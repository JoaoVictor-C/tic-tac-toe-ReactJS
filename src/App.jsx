import './App.css'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame' 
import OfflineGame from './pages/OfflineGame'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router>
        <div>
          <Routes>
            <Route path="/tic-tac-toe-ReactJS" element={<Home />} />
            <Route path="/tic-tac-toe-ReactJS/create" element={<CreateGame />} />
            <Route path="/tic-tac-toe-ReactJS/join" element={<JoinGame />} />
            <Route path="/tic-tac-toe-ReactJS/offline" element={<OfflineGame />} />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
