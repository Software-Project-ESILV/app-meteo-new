import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Reports from './pages/Reports'
import History from './pages/History'
import Settings from './pages/Settings' // Import du vrai composant Settings
import './App.css'

// Placeholder pour Dashboard viré au profit de History


function App() {
  return (
    <BrowserRouter>
      {/* Background is handled by theme.css on body */}
      <div>
        <NavBar />
        <main style={{ paddingBottom: '5rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/dashboard" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
