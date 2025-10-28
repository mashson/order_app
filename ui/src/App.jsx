import { useState } from 'react'
import './App.css'
import OrderScreen from './components/OrderScreen'
import AdminScreen from './components/AdminScreen'

function App() {
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">COZY</h1>
          <nav className="nav-tabs">
            <button 
              className={`nav-btn ${currentView === 'order' ? 'active' : ''}`}
              onClick={() => setCurrentView('order')}
            >
              주문하기
            </button>
            <button 
              className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => setCurrentView('admin')}
            >
              관리자
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {currentView === 'order' ? (
          <OrderScreen />
        ) : (
          <AdminScreen />
        )}
      </main>
    </div>
  )
}

export default App
