import './App.css'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame' 
import OfflineGame from './pages/OfflineGame'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Router basename={import.meta.env.DEV ? '/' : '/tic-tac-toeReactJS/'}>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/offline" element={<OfflineGame />} />
          </Routes>
        </div>
      </Router>
    </div>
  )
}

export default App
