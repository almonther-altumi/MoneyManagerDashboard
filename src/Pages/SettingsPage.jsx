import React, { useState, useEffect } from 'react';
import '../components/Styles/SettingsPageStyles/SettingsPageStyle.css';
import { db, auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

import { useFinancialData } from '../contexts/FinancialContext';

import { useNotification } from '../hooks/useNotification';
import Notification from '../components/Notification';

function SettingsPage() {
    const { t, i18n } = useTranslation();
    const { settings: contextSettings, refreshData } = useFinancialData();
    const { notification, showNotification, hideNotification } = useNotification();

    const [activeTab, setActiveTab] = useState('general');
    const [localSettings, setLocalSettings] = useState({
        currency: 'USD',
        language: 'English',
        emailNotifications: true,
        monthlyBudgetAlert: true,
        dataSync: true,
        privacyMode: false,
        themeAuto: true,
        securityLock: false
    });

    // Sync from context to local state
    // FIXED: Removed i18n.language from dependency to prevent reverting user selection
    useEffect(() => {
        if (contextSettings) {
            setLocalSettings(prev => ({ ...prev, ...contextSettings }));

            // Apply Theme from settings on load (Language sync is now handled globally in FinancialContext)
            const isDark = contextSettings.themeAuto;
            if (isDark) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('app_theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('app_theme', 'light');
            }
        }
    }, [contextSettings]);

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));

        // Immediate language switch preview
        if (key === 'language') {
            const newLang = value === 'Arabic' ? 'ar' : 'en';
            i18n.changeLanguage(newLang);
            document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        }

        // Immediate Theme Switch
        if (key === 'themeAuto') {
            if (value) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('app_theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('app_theme', 'light');
            }
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "general");
            await setDoc(settingsRef, localSettings, { merge: true });

            // Re-sync language globally through context refresh
            // i18next usually handles local state, but we want the app to stay in sync
            refreshData();

            showNotification(t('settings.save_success'), "success");
        } catch (error) {
            console.error("Error saving settings:", error);
            showNotification(t('settings.save_error'), "error");
        }
    };

    const tabs = [
        { id: 'general', label: t('settings.tabs.general'), icon: '⚙️' },
        // { id: 'notifications', label: t('settings.tabs.alerts'), icon: '🔔' }, // Un-commented for translation demo
        // { id: 'security', label: t('settings.tabs.security'), icon: '🔒' }     // Un-commented for translation demo
    ];

    // Filter tabs if you want to keep hidden ones hidden, but for now showing all as per structure
    // or just show General if that's the current state. 
    // The original code had them commented out. I will keep them effectively available but maybe just 'general' is active.

    return (
        <div className="luxury-settings-root">
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
            <div className="luxury-settings-container">
                <aside className="settings-sidebar">
                    <div className="sidebar-brand">
                        <h2>{t('settings.title')}</h2>
                        <p>{t('settings.description')}</p>
                    </div>
                    <nav className="settings-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className="nav-icon">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="settings-main">
                    <div className="settings-content-card">
                        {activeTab === 'general' && (
                            <div className="settings-view">
                                <header>
                                    <h3>{t('settings.general.title')}</h3>
                                    <p>{t('settings.general.subtitle')}</p>
                                </header>
                                <div className="setting-group">

                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.general.language_title')}</h4>
                                            <p>{t('settings.general.language_desc')}</p>
                                        </div>
                                        <select value={localSettings.language} onChange={(e) => handleChange('language', e.target.value)}>
                                            <option value="English">{t('settings.general.lang_en')}</option>
                                            <option value="Arabic">{t('settings.general.lang_ar')}</option>
                                        </select>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.general.theme_title')}</h4>
                                            <p>{t('settings.general.theme_desc')}</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={localSettings.themeAuto} onChange={(e) => handleChange('themeAuto', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="settings-view">
                                <header>
                                    <h3>{t('settings.notifications.title')}</h3>
                                    <p>{t('settings.notifications.subtitle')}</p>
                                </header>
                                <div className="setting-group">
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.notifications.email_briefings')}</h4>
                                            <p>{t('settings.notifications.email_briefings_desc')}</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={localSettings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.notifications.critical_budget_alerts')}</h4>
                                            <p>{t('settings.notifications.critical_budget_alerts_desc')}</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={localSettings.monthlyBudgetAlert} onChange={(e) => handleChange('monthlyBudgetAlert', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="settings-view">
                                <header>
                                    <h3>{t('settings.security.title')}</h3>
                                    <p>{t('settings.security.subtitle')}</p>
                                </header>
                                <div className="setting-group">
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.security.privacy_stealth_mode')}</h4>
                                            <p>{t('settings.security.privacy_stealth_mode_desc')}</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={localSettings.privacyMode} onChange={(e) => handleChange('privacyMode', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>{t('settings.security.authentication_lock')}</h4>
                                            <p>{t('settings.security.authentication_lock_desc')}</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={localSettings.securityLock} onChange={(e) => handleChange('securityLock', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <footer className="settings-footer">
                            <button className="luxury-save-btn" onClick={handleSave}>
                                {t('settings.commit_preferences')}
                            </button>
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default SettingsPage;