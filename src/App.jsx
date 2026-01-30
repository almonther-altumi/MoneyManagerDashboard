
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTranslation } from "react-i18next";
import { FinancialProvider } from './contexts/FinancialContext';

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
import LandingPage from './Pages/LandingPage'
import ReportProblemPage from './Pages/ReportProblemPage'

import TermsOfService from "./Pages/TermsOfService";
import PrivacyPolicy from "./Pages/PrivacyPolicy";


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;

    // Initialize Theme
    const savedTheme = localStorage.getItem('app_theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [i18n.language]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1029) {
        setIsSidebarOpen(false);

      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize(); // فحص أولي عند تحميل الصفحة
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);


  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className={`app-root ${user && isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <BrowserRouter>
        <FinancialProvider>
          {user && (
            <>
              <SideBar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
              {/* Mobile Sidebar Backdrop */}
              {isSidebarOpen && (
                <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
              )}
            </>
          )}

          <div className="main-layout" style={!user ? { marginInlineStart: 0, width: '100%' } : {}}>
            {user && (
              <Header user={user} toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            )}

            <main className="page-content">
              <Routes>
                <Route path="/" element={user ? <HomePage /> : <LandingPage />} />

                {/* Protected Routes - Redirect to Login if not authenticated */}
                <Route path="/income" element={user ? <IncomePage /> : <Navigate to="/login" />} />
                <Route path="/expense" element={user ? <ExpensePage /> : <Navigate to="/login" />} />
                <Route path="/debts" element={user ? <DebtsPage /> : <Navigate to="/login" />} />
                <Route path="/reports" element={user ? <ReportsPage /> : <Navigate to="/login" />} />
                <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
                <Route path="/report-problem" element={user ? <ReportProblemPage /> : <Navigate to="/login" />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </FinancialProvider>
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
          margin-inline-start: 280px;
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
            margin-inline-start: 0;
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

const LoadingScreen = () => {
  const { t } = useTranslation();
  const [textIndex, setTextIndex] = useState(0);
  const loadingTexts = [
    t('loading.preparing'),
    t('loading.syncing'),
    t('loading.securing'),
    t('loading.welcome')
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-light)',
      color: 'var(--text)',
      gap: '24px'
    }}>
      <div className="loader-logo">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="loader-text-container">
        {loadingTexts.map((text, index) => (
          <p
            key={index}
            className={`loading-msg ${index === textIndex ? 'active' : ''}`}
          >
            {text}
          </p>
        ))}
      </div>

      <style>{`
                .loader-logo {
                    color: var(--primary);
                    animation: floatLogo 3s ease-in-out infinite;
                }

                .loader-text-container {
                    position: relative;
                    height: 24px;
                    width: 300px;
                    display: flex;
                    justify-content: center;
                }

                .loading-msg {
                    position: absolute;
                    font-size: 1rem;
                    color: var(--text-muted);
                    opacity: 0;
                    margin: 0;
                    letter-spacing: 0.5px;
                    filter: blur(8px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    transform: translateY(10px);
                }

                .loading-msg.active {
                    opacity: 1;
                    filter: blur(0px);
                    transform: translateY(0);
                }

                @keyframes floatLogo {
                    0% { transform: translateY(0px); opacity: 0.8; }
                    50% { transform: translateY(-10px); opacity: 1; filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.5)); }
                    100% { transform: translateY(0px); opacity: 0.8; }
                }
            `}</style>
    </div>
  );
};
