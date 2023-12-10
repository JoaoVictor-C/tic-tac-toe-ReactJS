import './App.css'
import Home from './pages/Home'
import CreateGame from './pages/CreateGame'
import JoinGame from './pages/JoinGame' 
import OfflineGame from './pages/OfflineGame'

import { HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateGame />} />
            <Route path="/join" element={<JoinGame />} />
            <Route path="/offline" element={<OfflineGame />} />
          </Routes>
        </div>
      </HashRouter>
    </div>
  )
}

export default App
