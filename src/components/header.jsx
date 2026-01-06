
import React, { useState, useEffect } from "react";
import "./Styles/headerStyle.css";
import { useLocation, useNavigate } from "react-router-dom";
import avatar from "../assets/hassan_avatar.svg";

// Icons
import Email_Icon from './Icons/Header_Icons/EmailIcon';
import ThemeIcon from './Icons/Header_Icons/ThemeIcon';

// eslint-disable-next-line no-unused-vars
function Header({ user, toggleSidebar, isSidebarOpen }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    // useEffect(() => {
    //     if (isDarkMode) {
    //         document.documentElement.setAttribute('data-theme', 'dark');
    //         localStorage.setItem('theme', 'dark');
    //     } else {
    //         document.documentElement.removeAttribute('data-theme');
    //         localStorage.setItem('theme', 'light');
    //     }
    // }, [isDarkMode]);

    useEffect(() => {
            document.getElementById('root').classList.toggle('dark-mode');
            localStorage.setItem('theme', 'dark');
       
    }, [isDarkMode]);
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        
    };

    // Default/Fallback user (Mock)
    const defaultUser = {
        displayName: "LogIn",
        photoURL: avatar,
        email: "user@example.com",
        role: ""
    };

    // Use real Google user if logged in, otherwise default
    const currentUser = user ? {
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        role: "Owner"
    } : defaultUser;

    const getTitle = () => {
        switch (location.pathname) {
            case "/": return "Grand Overview";
            case "/income": return "Liquidity Analytics";
            case "/expense": return "Expenditure Control";
            case "/debts": return "Liability Management";
            case "/reports": return "Fiscal Synthesis";
            case "/settings": return "Global Preferences";
            default: return "Money Manager";
        }
    };

    const handleMailClick = () => {
        window.open("https://gmail.com", "_blank");
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
                <button className="icon-btn theme-toggle" onClick={handleMailClick} title="Open Gmail">
                    <Email_Icon isDark={isDarkMode} width={iconSize} height={iconSize} />
                </button>

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

            <style>{`
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .menu-toggle-btn {
                    background: var(--d);
                    border: 1px solid var(--border-muted);
                    color: var(--text);
                    width: 44px;
                    height: 44px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .menu-toggle-btn:hover {
                    background: var(--secondary);
                    color: white;
                    border-color: var(--secondary);
                    transform: scale(1.05);
                }

                @media (min-width: 1025px) {
                    .menu-toggle-btn {
                        display: none; /* Hide toggle on large screens if sidebar is always visible */
                    }
                    /* Show it if we want manual toggle on desktop */
                     .sidebar-closed .menu-toggle-btn {
                        display: flex;
                    }
                }

                @media (max-width: 1024px) {
                    .main-header {
                        padding: 0 24px;
                    }
                    .account-info {
                        display: none;
                    }
                }
            `}</style>
        </header>
    )
}
export default Header;
