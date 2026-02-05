import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../components/Styles/LandingPageStyle.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [faqOpen, setFaqOpen] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const theme = localStorage.getItem('app_theme') || 'dark';
        if (theme === 'auto') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return theme === 'dark';
    });

    useEffect(() => {
        const handleThemeChange = () => {
            const theme = localStorage.getItem('app_theme') || 'dark';
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
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        localStorage.setItem('app_theme', newMode ? 'dark' : 'light');
        window.dispatchEvent(new Event('theme_update'));
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
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
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
                            {t('login.sign_in', 'Sign In')}
                        </button>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-badge">لوحة مالية ذكية لصناعة عادات مالية صحية</div>
                        <h1>
                            إدارة المال ببساطة <br />
                            <span className="gradient-text">وبشكل احترافي</span>
                        </h1>
                        <p>
                            MoneyManager يساعدك تجمع دخلك ومصروفاتك وديونك في مكان واحد مع تقارير واضحة،
                            حتى تعرف وين تروح فلوسك وتتخذ قرارات أفضل بثقة.
                        </p>
                        <div className="hero-actions">
                            <button className="btn-primary" onClick={() => navigate('/login')}>
                                ابدأ مجانًا
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/login')}>
                                تجربة مباشرة
                            </button>
                        </div>
                        <div className="hero-trust">
                            <div>
                                <span className="trust-number">+12</span>
                                <span className="trust-label">لوحات وتقارير</span>
                            </div>
                            <div>
                                <span className="trust-number">100%</span>
                                <span className="trust-label">خصوصية بياناتك</span>
                            </div>
                            <div>
                                <span className="trust-number">0</span>
                                <span className="trust-label">رسوم حالياً</span>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="glass-card bounce-in">
                            <div className="card-header">
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>صافي القيمة</div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>24,500 ر.س</div>
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
                                    الهدف 20%
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
                                    <h4>الدخل</h4>
                                    <p style={{ color: '#10b981' }}>8,240 ر.س</p>
                                </div>
                                <div className="stat-item">
                                    <h4>المصروفات</h4>
                                    <p style={{ color: '#ef4444' }}>3,500 ر.س</p>
                                </div>
                                <div className="stat-item">
                                    <h4>الادخار</h4>
                                    <p style={{ color: '#3b82f6' }}>4,740 ر.س</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About / Founder Section */}
                <section className="about-section fade-up">
                    <div className="about-card">
                        <div className="about-text">
                            <h2>من أنا؟</h2>
                            <p>
                                أنا مطوّر شغوف ببناء أدوات عملية تساعد الناس على فهم أموالهم واتخاذ قرارات أذكى.
                                لاحظت أن كثير من التطبيقات معقدة أو مُرهِقة، فبدأت MoneyManager كحل بسيط واحترافي
                                يركّز على الوضوح وتجربة الاستخدام.
                            </p>
                            <div className="about-highlights">
                                <div>
                                    <span className="highlight-title">الهدف</span>
                                    <span className="highlight-text">تبسيط الإدارة المالية اليومية</span>
                                </div>
                                <div>
                                    <span className="highlight-title">الرؤية</span>
                                    <span className="highlight-text">مساعدة كل شخص على بناء عادة مالية واعية</span>
                                </div>
                            </div>
                        </div>
                        <div className="about-panel">
                            <div className="about-avatar">MM</div>
                            <div className="about-panel-text">
                                أؤمن أن الشفافية والوضوح هما أساس الثقة، لذلك التطبيق يعطيك صورة كاملة بدون تعقيد.
                            </div>
                            <div className="about-tags">
                                <span>مصمّم تجربة</span>
                                <span>مطور واجهات</span>
                                <span>محلل بيانات</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Free Section */}
                <section className="free-section fade-up">
                    <div className="section-header">
                        <h2>لماذا التطبيق مجاني حتى الآن؟</h2>
                        <p>أبني هذه المنصة على مبدأ الوصول العادل، مع خطة واضحة للاستدامة بدون إزعاج المستخدمين.</p>
                    </div>
                    <div className="free-grid">
                        <div className="free-card">
                            <h3>لأن النتائج أهم من الرسوم</h3>
                            <p>
                                هدفي هو تمكين المستخدمين من تحسين سلوكهم المالي أولاً. عندما يتحسن الوضع المالي،
                                يصبح من المنطقي تقديم مزايا إضافية مدفوعة اختيارية فقط.
                            </p>
                        </div>
                        <div className="free-card">
                            <h3>تعلم وتحسين مستمر</h3>
                            <p>
                                الفترة المجانية تساعدني على فهم احتياج المستخدمين الحقيقي وتطوير المزايا التي تخدمهم
                                فعلاً بدل إضافة تعقيدات غير ضرورية.
                            </p>
                        </div>
                        <div className="free-card">
                            <h3>لا بيع للبيانات</h3>
                            <p>
                                التطبيق لا يعتمد على بيع بياناتك. الخصوصية أولوية، وكل قرارات التطوير تُبنى على ذلك.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="features-section fade-up">
                    <div className="section-header">
                        <h2>مميزات التطبيق</h2>
                        <p>أدوات واضحة، تقارير ذكية، وتجربة استخدام احترافية تساعدك فعلاً.</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2V22M17 5H9.5A3.5 3.5 0 0 0 6 8.5A3.5 3.5 0 0 0 9.5 12H14.5A3.5 3.5 0 0 1 18 15.5A3.5 3.5 0 0 1 14.5 19H7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>تتبع ذكي</h3>
                            <p>تسجيل الدخل والمصروفات بسرعة مع تصنيفات مرنة تعطيك صورة دقيقة عن نمط الإنفاق.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8C6 8 6 18 6 18C6 20.209 7.791 22 10 22H14C16.209 22 18 20.209 18 18C18 18 18 8 18 8Z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M2 8V22" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 8V22" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>إدارة الديون</h3>
                            <p>تابع التزاماتك بوضوح وحدد خطة سداد واقعية مع تنبيهات تساعدك على الالتزام.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 18V16C3 14.8954 3.89543 14 5 14H19C20.1046 14 21 14.8954 21 16V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18Z" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3 8V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8C21 9.1046 20.1046 10 19 10H5C3.89543 10 3 9.1046 3 8Z" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>خصوصية وأمان</h3>
                            <p>بياناتك محفوظة بأمان، ولا يتم مشاركتها أو بيعها لأي جهة.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19H20M4 15H20M4 11H20M4 7H20" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>تقارير واضحة</h3>
                            <p>لوحات مرئية تبين الاتجاهات الشهرية، ونقاط القوة والضعف في إدارتك المالية.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12A9 9 0 1 1 12 3" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 12H12" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 12L7 7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>واجهة سريعة</h3>
                            <p>كل شيء متاح بثواني، بدون قوائم معقدة أو خطوات كثيرة.</p>
                        </div>
                        <div className="feature-card">
                            <div className="icon-box">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>تخصيص مرن</h3>
                            <p>تحكم في التصنيفات والعملة وطريقة العرض بما يناسب احتياجك اليومي.</p>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="how-it-works-section fade-up">
                    <div className="section-header">
                        <h2>كيف يعمل التطبيق؟</h2>
                        <p>ثلاث خطوات بسيطة وتبدأ رحلة تنظيم أموالك.</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h3>تسجيل سريع</h3>
                            <p>سجّل بحسابك لتبدأ فورًا بدون نماذج طويلة.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h3>إضافة البيانات</h3>
                            <p>سجّل دخلك ومصروفاتك وديونك بسهولة.</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h3>رؤية أوضح</h3>
                            <p>تابع تقدمك من خلال لوحات وتقارير ذكية.</p>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section fade-up">
                    <div className="section-header">
                        <h2>أسئلة شائعة</h2>
                    </div>
                    <div className="faq-container">
                        {[
                            { q: "هل التطبيق مجاني فعلاً؟", a: "نعم، مجاني بالكامل الآن للاستخدام الشخصي، مع خطة لاحقة لمزايا احترافية اختيارية." },
                            { q: "هل بياناتي آمنة؟", a: "نستخدم Firebase للمصادقة والتخزين، مع أفضل ممارسات الأمان والحماية." },
                            { q: "هل يعمل على الجوال؟", a: "نعم، الواجهة متجاوبة وتعمل بسلاسة على جميع الأجهزة." },
                            { q: "كيف أتواصل؟", a: "تواصل عبر صفحة الإبلاغ عن مشكلة داخل التطبيق." }
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
                        <h2>جاهز تبدأ رحلتك المالية؟</h2>
                        <p>ابدأ الآن مجانًا، وخلي أرقامك تشتغل لصالحك.</p>
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            ابدأ الآن
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
