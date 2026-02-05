
import React, { useState, useEffect } from "react";
import "./Styles/headerStyle.css";
import { useLocation, useNavigate } from "react-router-dom";
import avatar from "../assets/unknownUser.svg";

import { useTranslation } from "react-i18next";

// Icons
import Email_Icon from './Icons/Header_Icons/EmailIcon';
import NotificationIcon from './Icons/Header_Icons/NotificationIcon';
import ThemeIcon from './Icons/Header_Icons/ThemeIcon';
import NotificationMenu from './NotificationMenu';
import { db } from "../firebase";
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

// eslint-disable-next-line no-unused-vars
function Header({ user, toggleSidebar, isSidebarOpen }) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const theme = localStorage.getItem('app_theme') || 'light';
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    });
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    useEffect(() => {
        const handleThemeChange = () => {
            const theme = localStorage.getItem('app_theme') || 'light';
            if (theme === 'auto') {
                setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
            } else {
                setIsDarkMode(theme === 'dark');
            }
        };

        window.addEventListener('theme_update', handleThemeChange);
        window.addEventListener('storage', handleThemeChange);

        return () => {
            window.removeEventListener('theme_update', handleThemeChange);
            window.removeEventListener('storage', handleThemeChange);
        };
    }, []);

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        localStorage.setItem('app_theme', newTheme);
        setIsDarkMode(!isDarkMode);
        window.dispatchEvent(new Event('theme_update'));
    };

    // Default/Fallback user (Mock)
    const defaultUser = {
        displayName: t('header.log_in'),
        photoURL: avatar,
        email: "user@example.com",
        role: ""
    };

    // Use real Google user if logged in, otherwise default
    const currentUser = user ? {
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        role: user.email === 'monthertumi2025@gmail.com' ? t('header.role_owner') : t('header.role_member')
    } : defaultUser;

    const getTitle = () => {
        switch (location.pathname) {
            case "/": return t('header.titles.grand_overview');
            case "/income": return t('header.titles.liquidity_analytics');
            case "/expense": return t('header.titles.expenditure_control');
            case "/debts": return t('header.titles.liability_management');
            case "/reports": return t('header.titles.fiscal_synthesis');
            case "/settings": return t('header.titles.global_preferences');
            default: return t('header.titles.default');
        }
    };

    const [hasNotification, setHasNotification] = useState(false);
    const [latestNoteId, setLatestNoteId] = useState(null);

    useEffect(() => {
        if (!user) return; // only listen when authenticated

        const q = query(
            collection(db, 'global_notifications'),
            orderBy('time', 'desc'),
            limit(1)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const latestDoc = snapshot.docs[0];
                const latestId = latestDoc.id;
                setLatestNoteId(latestId);

                const lastSeenId = localStorage.getItem('last_seen_notification_id');
                if (lastSeenId !== latestId) {
                    setHasNotification(true);
                }
            }
        }, (err) => {
            // silence permission errors for unauthenticated users
            console.warn('Notification listener error:', err);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMailClick = () => {
        if (latestNoteId) {
            localStorage.setItem('last_seen_notification_id', latestNoteId);
        }
        setHasNotification(false);
        setIsNotificationsOpen(!isNotificationsOpen);
    }

    const iconSize = 24;

    return (
        <header className="main-header">
            <div className="header-left">
                <button className="menu-toggle-btn" onClick={toggleSidebar} aria-label="Toggle Sidebar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <h2 id="header-title">{getTitle()}</h2>
            </div>

            <nav className="header-actions">
                <div className="notification-container">
                    <button className="icon-btn theme-toggle" onClick={handleMailClick} title="App News">
                        <NotificationIcon width={iconSize} height={iconSize} />
                        {hasNotification && <span className="notification-pulse" />}
                    </button>
                    {isNotificationsOpen && (
                        <NotificationMenu user={user} onClose={() => setIsNotificationsOpen(false)} />
                    )}
                </div>
                <button className="icon-btn theme-toggle" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                    <ThemeIcon isDark={isDarkMode} width={iconSize} height={iconSize} />
                </button>

                <div className="divider"></div>

                <div className="account-section clickable" onClick={() => navigate('/login')}>
                    <img src={currentUser.photoURL || avatar} alt={currentUser.displayName} className="account-avatar" />
                    <div className="account-info">
                        <h3 className="account-name">{currentUser.displayName}</h3>
                        <span className="role-tag">{currentUser.role}</span>
                    </div>
                </div>
            </nav>

        </header>
    )
}
export default Header;
