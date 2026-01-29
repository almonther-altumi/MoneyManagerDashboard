import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../components/Styles/LandingPageStyle.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [faqOpen, setFaqOpen] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(true);

    useEffect(() => {
        // Initialize theme from local storage or default
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setIsDarkMode(savedTheme === 'dark');
        if (savedTheme === 'dark') {
            document.getElementById('root').classList.add('dark-mode');
        } else {
            document.getElementById('root').classList.remove('dark-mode');
        }
    }, []);

    const toggleTheme = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        if (newMode) {
            document.getElementById('root').classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.getElementById('root').classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    const toggleFaq = (index) => {
        setFaqOpen(faqOpen === index ? null : index);
    };

    return (
        <div className="landing-page-root">
            <div className="landing-container">
                {/* Navigation */}
                <nav className="landing-nav">
                    <div className="nav-logo">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span>MoneyManager</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--border-muted)',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--text)',
                                cursor: 'pointer'
                            }}
                        >
                            {isDarkMode ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                            )}
                        </button>

                        <button className="nav-cta" onClick={() => navigate('/login')}>
                            {/* We can use translation keys if they exist, or fallback to English */}
                            {t('login.sign_in', 'Sign In')}
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1>
                            Master Your Money <br />
                            <span className="gradient-text">Build Your Future</span>
                        </h1>
                        <p>
                            Take control of your finances with our intuitive dashboard. Track income, expenses, and debts in real-time. The smartest way to manage your cost accounting.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary" onClick={() => navigate('/login')}>
                                Get Started Free
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/login')}>
                                Live Demo
                            </button>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="glass-card bounce-in">
                            <div className="card-header">
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Net Worth</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>$24,500.00</div>
                                </div>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.2)',
                                    color: '#10b981',
                                    padding: '4px 12px',
                                    borderRadius: '99px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    height: 'fit-content'
                                }}>
                                    Target 20%
                                </div>
                            </div>

                            <div className="chart-placeholder">
                                <div className="bar" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                                <div className="bar" style={{ height: '70%', animationDelay: '0.2s' }}></div>
                                <div className="bar" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                                <div className="bar" style={{ height: '90%', animationDelay: '0.4s' }}></div>
                                <div className="bar" style={{ height: '60%', animationDelay: '0.5s' }}></div>
                                <div className="bar" style={{ height: '80%', animationDelay: '0.6s' }}></div>
                            </div>

                            <div className="stat-row">
                                <div className="stat-item">
                                    <h4>Income</h4>
                                    <p style={{ color: '#10b981' }}>$8,240</p>
                                </div>
                                <div className="stat-item">
                                    <h4>Expenses</h4>
                                    <p style={{ color: '#ef4444' }}>$3,500</p>
                                </div>
                                <div className="stat-item">
                                    <h4>Savings</h4>
                                    <p style={{ color: '#3b82f6' }}>$4,740</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="features-section fade-up">
                    <div className="section-header">
                        <h2>Why Choose MoneyManager?</h2>
                        <p>Everything you need to manage your personal finances in one place.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2V22M17 5H9.5A3.5 3.5 0 0 0 6 8.5A3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5A3.5 3.5 0 0 1 14.5 19H7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Smart Tracking</h3>
                            <p>Automatically categorize your expenses and visual spending habits with beautiful charts.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8C6 8 6 18 6 18C6 20.209 7.791 22 10 22H14C16.209 22 18 20.209 18 18C18 18 18 8 18 8Z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 8V22" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 8V22" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Debt Management</h3>
                            <p>Keep track of what you owe and create repayment plans that actually work.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 18V16C3 14.8954 3.89543 14 5 14H19C20.1046 14 21 14.8954 21 16V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18Z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 8V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8C21 9.1046 20.1046 10 19 10H5C3.89543 10 3 9.1046 3 8Z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>Secure & Private</h3>
                            <p>Your financial data is encrypted and stored securely. We never share your personal information.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works-section fade-up">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Get started in minutes and take control of your financial future.</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h3>Sign Up</h3>
                            <p>Create a free account using your Google profile in seconds.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h3>Add Data</h3>
                            <p>Input your income, expenses, and debts easily.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h3>Visualize</h3>
                            <p>See your financial health at a glance with our smart dashboard.</p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section fade-up">
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                    </div>
                    <div className="faq-container">
                        {[
                            { q: "Is it really free?", a: "Yes, MoneyManager is completely free to use for personal finance tracking." },
                            { q: "Is my data safe?", a: "Absolutely. We use Google Firebase for authentication and data storage, ensuring bank-grade security." },
                            { q: "Can I use it on mobile?", a: "Yes! Our dashboard is fully responsive and works great on all devices." },
                            { q: "Get in touch?", a: "You can reach us at support@moneymanager.com." }
                        ].map((item, index) => (
                            <div className={`faq-item ${faqOpen === index ? 'open' : ''}`} key={index} onClick={() => toggleFaq(index)}>
                                <div className="faq-question">
                                    {item.q}
                                    <span className="faq-icon">+</span>
                                </div>
                                <div className="faq-answer">
                                    {item.a}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section">
                    <div className="cta-content glass-card">
                        <h2>Ready to master your money?</h2>
                        <p>Join thousands of users who are already tracking their finances smarter.</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Start Your Journey
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="landing-footer">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <span>MoneyManager</span>
                        </div>
                        <div className="footer-links">
                            <button onClick={() => navigate('/privacy')}>Privacy Policy</button>
                            <button onClick={() => navigate('/terms')}>Terms of Service</button>
                            <span>© 2026 MoneyManager. All rights reserved.</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default LandingPage;
