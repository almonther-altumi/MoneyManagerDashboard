
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Header from './components/header'
import SideBar from "./components/sideBar"

// pages 
import IncomePage from './Pages/IncomePage'
import ExpensePage from './Pages/ExpensePage'
import DebtsPage from './Pages/DebtsPage'
import ReportsPage from './Pages/ReportsPage'
import SettingsPage from './Pages/SettingsPage'
import NotFoundPage from './Pages/NotFoundPage'
import HomePage from './Pages/HomePage'
import LoginPage from './Pages/LoginPage'

export default function App() {
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className={`app-root ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <BrowserRouter>
        <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        {/* Mobile Sidebar Backdrop */}
        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
        )}

        <div className="main-layout">
          <Header user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="page-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/income" element={<IncomePage />} />
              <Route path="/expense" element={<ExpensePage />} />
              <Route path="/debts" element={<DebtsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage onLogin={setUser} />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>

      <style>{`
        .app-root {
          display: flex;
          min-height: 100vh;
          background: var(--bg-light);
          transition: all 0.3s ease;
        }

        .main-layout {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .sidebar-open .main-layout {
          margin-left: 280px;
        }

        .page-content {
          flex: 1;
          position: relative;
        }

        .sidebar-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(4px);
          z-index: 950;
          transition: all 0.3s ease;
        }

        @media (max-width: 1024px) {
          .sidebar-open .main-layout {
            margin-left: 0;
          }
          .sidebar-backdrop {
            display: block;
          }
          .sidebar-open {
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  )
}
