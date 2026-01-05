
import React, { useState, useEffect } from 'react';
import '../components/Styles/PagesStyle/SettingsPageStyle.css';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

function SettingsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState({
        currency: 'USD',
        language: 'English',
        emailNotifications: true,
        monthlyBudgetAlert: true,
        dataSync: true,
        privacyMode: false,
        themeAuto: true,
        securityLock: false
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setIsRefreshing(true);
                try {
                    const settingsRef = doc(db, "users", user.uid, "settings", "general");
                    const settingsSnap = await getDoc(settingsRef);
                    if (settingsSnap.exists()) {
                        setSettings(prev => ({ ...prev, ...settingsSnap.data() }));
                    }
                } catch (error) {
                    console.error("Error fetching settings:", error);
                } finally {
                    setTimeout(() => setIsRefreshing(false), 800);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsRefreshing(true);
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "general");
            await setDoc(settingsRef, settings, { merge: true });
        } catch (error) {
            console.error("Error saving settings:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 1200);
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: '⚙️' },
        { id: 'notifications', label: 'Alerts', icon: '🔔' },
        { id: 'security', label: 'Security', icon: '🔒' }
    ];

    return (
        <div className={`luxury-settings-root ${isRefreshing ? 'refresh-active' : ''}`}>

            <div className="unified-refresh-overlay">
                <div className="core-loader"></div>
            </div>
            <div className="status-label">Committing Changes</div>

            <div className="luxury-settings-container content-blur">
                <aside className="settings-sidebar">
                    <div className="sidebar-brand">
                        <h2>Settings</h2>
                        <p>Platform Preferences</p>
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
                                    <h3>General Configuration</h3>
                                    <p>Regional and interface settings for your workspace.</p>
                                </header>
                                <div className="setting-group">
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Base Currency</h4>
                                            <p>Global currency used for liquidity analytics.</p>
                                        </div>
                                        <select value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                                            <option value="USD">USD - US Dollar</option>
                                            <option value="EUR">EUR - Euro</option>
                                            <option value="LYD">LYD - Libyan Dinar</option>
                                        </select>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Locale</h4>
                                            <p>Preferred language for interface text.</p>
                                        </div>
                                        <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)}>
                                            <option value="English">English</option>
                                            <option value="Arabic">Arabic</option>
                                        </select>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Adaptive Theme</h4>
                                            <p>Automatically sync theme with system preferences.</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={settings.themeAuto} onChange={(e) => handleChange('themeAuto', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="settings-view">
                                <header>
                                    <h3>Notifications & Alerts</h3>
                                    <p>Manage how and when you receive financial insight updates.</p>
                                </header>
                                <div className="setting-group">
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Email Briefings</h4>
                                            <p>Weekly summaries of your net-worth growth.</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={settings.emailNotifications} onChange={(e) => handleChange('emailNotifications', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Critical Budget Alerts</h4>
                                            <p>Instant notification upon exceeding 85% of monthly budget.</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={settings.monthlyBudgetAlert} onChange={(e) => handleChange('monthlyBudgetAlert', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="settings-view">
                                <header>
                                    <h3>Security & Privacy</h3>
                                    <p>Advanced data protection and visibility controls.</p>
                                </header>
                                <div className="setting-group">
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Privacy Stealth Mode</h4>
                                            <p>Mask sensitive totals on the dashboard overview.</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={settings.privacyMode} onChange={(e) => handleChange('privacyMode', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                    <div className="luxury-setting-row">
                                        <div className="info">
                                            <h4>Authentication Lock</h4>
                                            <p>Require re-auth before viewing deep analytics.</p>
                                        </div>
                                        <label className="luxury-toggle">
                                            <input type="checkbox" checked={settings.securityLock} onChange={(e) => handleChange('securityLock', e.target.checked)} />
                                            <span className="luxury-slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <footer className="settings-footer">
                            <button className="luxury-save-btn" onClick={handleSave}>
                                Commit Preferences
                            </button>
                        </footer>
                    </div>
                </main>
            </div>

            <style>{`
                .luxury-settings-root {
                    height: 100vh;
                    padding: 40px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    background: var(--bg-light);
                }

                .luxury-settings-container {
                    width: 100%;
                    max-width: 1100px;
                    height: 85vh;
                    display: flex;
                    background: var(--bg);
                    border-radius: 40px;
                    border: 1px solid var(--border-muted);
                    box-shadow: var(--shadow-lg);
                    overflow: hidden;
                }

                .settings-sidebar {
                    width: 280px;
                    padding: 40px;
                    background: var(--highlight);
                    border-right: 1px solid var(--border-muted);
                    display: flex;
                    flex-direction: column;
                    gap: 40px;
                }

                .sidebar-brand h2 {
                    font-size: 24px;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text);
                    letter-spacing: -1px;
                }

                .sidebar-brand p {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 4px 0 0 0;
                }

                .settings-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: 18px;
                    border: none;
                    background: transparent;
                    color: var(--text-muted);
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    text-align: left;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .nav-item:hover {
                    background: var(--bg-light);
                    color: var(--text);
                }

                .nav-item.active {
                    background: var(--bg-light);
                    color: var(--secondary);
                    box-shadow: var(--shadow);
                }

                .nav-icon {
                    font-size: 18px;
                }

                .settings-main {
                    flex: 1;
                    padding: 60px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }

                .settings-view header {
                    margin-bottom: 40px;
                }

                .settings-view h3 {
                    font-size: 22px;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text);
                    letter-spacing: -0.5px;
                }

                .settings-view header p {
                    font-size: 14px;
                    color: var(--text-muted);
                    margin: 8px 0 0 0;
                }

                .setting-group {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                }

                .luxury-setting-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-bottom: 25px;
                    border-bottom: 1px solid var(--border-muted);
                }

                .luxury-setting-row:last-child {
                    border-bottom: none;
                }

                .luxury-setting-row .info h4 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text);
                }

                .luxury-setting-row .info p {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin: 4px 0 0 0;
                    max-width: 320px;
                }

                .luxury-setting-row select {
                    background: var(--highlight);
                    border: 1px solid var(--border-muted);
                    color: var(--text);
                    padding: 10px 20px;
                    border-radius: 14px;
                    font-weight: 600;
                    outline: none;
                    cursor: pointer;
                    min-width: 180px;
                }

                .luxury-toggle {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 28px;
                }

                .luxury-toggle input { opacity: 0; width: 0; height: 0; }

                .luxury-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: var(--border-muted);
                    transition: .4s cubic-bezier(0.23, 1, 0.32, 1);
                    border-radius: 34px;
                }

                .luxury-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px; width: 20px;
                    left: 4px; bottom: 4px;
                    background: white;
                    transition: .4s cubic-bezier(0.23, 1, 0.32, 1);
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                input:checked + .luxury-slider { background: var(--secondary); }
                input:checked + .luxury-slider:before { transform: translateX(22px); }

                .settings-footer {
                    margin-top: auto;
                    padding-top: 40px;
                }

                .luxury-save-btn {
                    padding: 16px 32px;
                    background: var(--primary);
                    color: var(--bg-light);
                    border: none;
                    border-radius: 18px;
                    font-weight: 800;
                    font-size: 15px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                }

                .luxury-save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                }
            `}</style>
        </div>
    );
}

export default SettingsPage;