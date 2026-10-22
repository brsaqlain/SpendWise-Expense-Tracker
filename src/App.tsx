import React, { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { StoreProvider, useStore } from './store'
import { ToastProvider } from './components/ui'
import { BottomNav } from './components/BottomNav'
import { Splash } from './screens/Splash'
import { Onboarding } from './screens/Onboarding'
import { Dashboard } from './screens/Dashboard'
import { AddTransaction } from './screens/AddTransaction'
import { Transactions } from './screens/Transactions'
import { TransactionDetail } from './screens/TransactionDetail'
import { Budgets } from './screens/Budgets'
import { Analytics } from './screens/Analytics'
import { Savings } from './screens/Savings'
import { Profile } from './screens/Profile'
import { Screen } from './components/ui'

let sessionStarted = false

const MainLayout: React.FC = () => {
  const [showSplash, setShowSplash] = useState(!sessionStarted)

  if (showSplash) return <div className="app-shell"><Splash onDone={() => { sessionStarted = true; setShowSplash(false) }} /></div>

  return (
    <div className="app-shell has-nav">
      <div style={{ minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/tx/:id" element={<TransactionDetail />} />
          <Route path="/add" element={<AddTransaction />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

const App: React.FC = () => (
  <StoreProvider>
    <ToastProvider>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </ToastProvider>
  </StoreProvider>
)

export default App
