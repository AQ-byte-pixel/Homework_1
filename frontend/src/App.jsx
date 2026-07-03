import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Cases from './pages/Cases'
import Chat from './pages/Chat'
import Warning from './pages/Warning'
import Education from './pages/Education'
import Admin from './pages/Admin'

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/warning" element={<Warning />} />
        <Route path="/education" element={<Education />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </AppLayout>
  )
}

export default App
