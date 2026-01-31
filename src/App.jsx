
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useTranslation } from "react-i18next";
import './components/Styles/SharedManagementPage.css';
import { FinancialProvider } from './contexts/FinancialContext';

import Header from './components/header'
import SideBar from "./components/sideBar"

import { Suspense, lazy } from "react";

// Lazy Pages
const IncomePage = lazy(() => import('./Pages/IncomePage'));
const ExpensePage = lazy(() => import('./Pages/ExpensePage'));
const DebtsPage = lazy(() => import('./Pages/DebtsPage'));
const ReportsPage = lazy(() => import('./Pages/ReportsPage'));
const SettingsPage = lazy(() => import('./Pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./Pages/NotFoundPage'));
const HomePage = lazy(() => import('./Pages/HomePage'));
const LoginPage = lazy(() => import('./Pages/LoginPage'));
const LandingPage = lazy(() => import('./Pages/LandingPage'));
const ReportProblemPage = lazy(() => import('./Pages/ReportProblemPage'));
const TermsOfService = lazy(() => import('./Pages/TermsOfService'));
const PrivacyPolicy = lazy(() => import('./Pages/PrivacyPolicy'));
const AdminNotificationsPage = lazy(() => import('./Pages/AdminNotificationsPage'));
const AdminUsersPage = lazy(() => import('./Pages/AdminUsersPage'));
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { ShieldAlert, LogOut } from 'lucide-react';
import BudgetAlertManager from "./components/BudgetAlertManager";


export default function App() {
  const [user, setUser] = useState(null);
  const [userStatus, setUserStatus] = useState(null); // {status, reason}
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Theme Management
  useEffect(() => {
    const handleTheme = () => {
      const savedTheme = localStorage.getItem('app_theme') || 'light';
      let isDark = savedTheme === 'dark';

      if (savedTheme === 'auto') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        document.body.classList.add('dark-mode');
        document.documentElement.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');
      }
    };

    handleTheme();

    // Listen for storage changes (for multiple tabs)
    window.addEventListener('storage', handleTheme);
    // Custom event for immediate updates within the same tab
    window.addEventListener('theme_update', handleTheme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const sysListener = () => {
      if (localStorage.getItem('app_theme') === 'auto') {
        handleTheme();
      }
    };
    mediaQuery.addEventListener('change', sysListener);

    return () => {
      window.removeEventListener('storage', handleTheme);
      window.removeEventListener('theme_update', handleTheme);
      mediaQuery.removeEventListener('change', sysListener);
    };
  }, []);

  useEffect(() => {
    let unsubscribeStatus = () => { };

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Listen to user status in real-time
        const userRef = doc(db, 'users', currentUser.uid);
        unsubscribeStatus = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data.status === 'banned' || data.status === 'suspended') {
              setUserStatus({ status: data.status, reason: data.statusReason || data.suspensionReason });
            } else {
              setUserStatus(null);
            }
          }
        });
      } else {
        setUserStatus(null);
        unsubscribeStatus();
      }

      setLoading(false);
    });
    return () => {
      unsubscribeAuth();
      unsubscribeStatus();
    };
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
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

  if (userStatus) {
    return <RestrictionScreen status={userStatus.status} reason={userStatus.reason} />;
  }

  return (
    <div className={`app-root ${user && isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <BrowserRouter>
        <FinancialProvider>
          <BudgetAlertManager />
          {user && (
            <>
              <SideBar user={user} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
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
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={user ? <HomePage /> : <LandingPage />} />

                  {/* Protected Routes - Redirect to Login if not authenticated */}
                  <Route path="/income" element={user ? <IncomePage /> : <Navigate to="/login" />} />
                  <Route path="/expense" element={user ? <ExpensePage /> : <Navigate to="/login" />} />
                  <Route path="/debts" element={user ? <DebtsPage /> : <Navigate to="/login" />} />
                  <Route path="/reports" element={user ? <ReportsPage /> : <Navigate to="/login" />} />
                  <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />
                  <Route path="/report-problem" element={user ? <ReportProblemPage /> : <Navigate to="/login" />} />
                  <Route path="/admin/notifications" element={user && user.email === 'monthertumi2025@gmail.com' ? <AdminNotificationsPage /> : <Navigate to="/" />} />
                  <Route path="/admin/users" element={user && user.email === 'monthertumi2025@gmail.com' ? <AdminUsersPage /> : <Navigate to="/" />} />

                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
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
  }, [loadingTexts.length]);

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

const RestrictionScreen = ({ status, reason }) => {
  const { t } = useTranslation();
  const isBanned = status === 'banned';

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-light)',
      color: 'var(--text)',
      padding: '24px',
      textAlign: 'center'
    }}>
      <div style={{
        background: isBanned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
        padding: '32px',
        borderRadius: '24px',
        border: `1px solid ${isBanned ? '#ef4444' : '#f59e0b'}`,
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <ShieldAlert size={64} color={isBanned ? '#ef4444' : '#f59e0b'} />
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          {isBanned ? t('security.account_banned') : t('security.account_suspended')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: '1.6' }}>
          {isBanned ? t('security.banned_desc') : t('security.suspended_desc')}
        </p>

        {reason && (
          <div style={{
            background: 'var(--bg)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            width: '100%',
            textAlign: 'left',
            border: '1px solid var(--border-muted)'
          }}>
            <strong style={{ display: 'block', marginBottom: '4px' }}>{t('security.reason_prefix')}</strong>
            {reason}
          </div>
        )}

        <button
          onClick={() => auth.signOut()}
          style={{
            marginTop: '12px',
            background: 'var(--text)',
            color: 'var(--bg)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <LogOut size={18} /> {t('login.sign_out')}
        </button>
      </div>
    </div>
  );
};
