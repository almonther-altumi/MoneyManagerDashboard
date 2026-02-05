import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const steps = [
    {
        key: 'sidebar',
        titleEn: 'Open the sidebar',
        titleAr: 'افتح القائمة الجانبية',
        descEn: 'Toggle navigation to access pages and sections.',
        descAr: 'افتح القائمة للوصول إلى الصفحات والأقسام بسهولة.',
        style: { left: 20, top: '40%', transform: 'translateY(-50%)' },
        arrow: { from: { x: 0.22, y: 0.45 }, to: { x: 0.08, y: 0.32 } }
    },
    {
        key: 'add',
        titleEn: 'Add transactions',
        titleAr: 'أضف المعاملات',
        descEn: 'Quickly add income or expenses from forms.',
        descAr: 'أضف الدخل أو المصروفات بسرعة عبر النماذج.',
        style: { left: '50%', top: '28%', transform: 'translateX(-50%)' },
        arrow: { from: { x: 0.54, y: 0.3 }, to: { x: 0.7, y: 0.24 } }
    },
    {
        key: 'reports',
        titleEn: 'View reports',
        titleAr: 'شاهد التقارير',
        descEn: 'See charts and insights about your finances.',
        descAr: 'اطّلع على الرسوم والتحليلات لوضعك المالي.',
        style: { right: 20, top: '20%', textAlign: 'right' },
        arrow: { from: { x: 0.78, y: 0.22 }, to: { x: 0.92, y: 0.16 } }
    },
    {
        key: 'settings',
        titleEn: 'Customize',
        titleAr: 'خصّص الإعدادات',
        descEn: 'Adjust language, theme and other preferences.',
        descAr: 'غيّر اللغة والثيم وبقية الإعدادات.',
        style: { right: 20, bottom: '18%', textAlign: 'right' },
        arrow: { from: { x: 0.78, y: 0.72 }, to: { x: 0.92, y: 0.8 } }
    }
];

const Onboarding = ({ onFinish }) => {
    const { i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        try {
            const seen = sessionStorage.getItem('mm_onboarding_v1');
            if (!seen) setVisible(true);
        } catch (e) {
            setVisible(true);
        }
    }, []);

    const closeAll = () => {
        try { sessionStorage.setItem('mm_onboarding_v1', '1'); } catch (e) {}
        setVisible(false);
        if (onFinish) onFinish();
    };

    if (!visible) return null;

    const isAr = i18n.language === 'ar';
    const step = steps[index];

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 140000, pointerEvents: 'auto' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} onClick={closeAll} />

            <div style={{ position: 'absolute', ...step.style, maxWidth: 360, padding: 16, borderRadius: 14, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border-muted)' }}>
                <h3 style={{ margin: '0 0 6px 0' }}>{isAr ? step.titleAr : step.titleEn}</h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{isAr ? step.descAr : step.descEn}</div>
            </div>

            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }} aria-hidden>
                <defs>
                    <marker id="onboard-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
                    </marker>
                </defs>
                <path
                    d={`M ${step.arrow.from.x * window.innerWidth} ${step.arrow.from.y * window.innerHeight} Q ${((step.arrow.from.x + step.arrow.to.x) / 2) * window.innerWidth} ${(((step.arrow.from.y + step.arrow.to.y) / 2) - 0.04) * window.innerHeight} ${step.arrow.to.x * window.innerWidth} ${step.arrow.to.y * window.innerHeight}`}
                    stroke="var(--primary)"
                    strokeWidth="3"
                    fill="transparent"
                    markerEnd="url(#onboard-arrow)"
                />
            </svg>

            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {steps.map((s, i) => (
                        <div key={s.key} onClick={() => setIndex(i)} style={{ width: 10, height: 10, borderRadius: 6, background: i === index ? 'var(--primary)' : 'rgba(255,255,255,0.18)', cursor: 'pointer' }} />
                    ))}
                </div>

                <div style={{ marginLeft: 12, display: 'flex', gap: 8 }}>
                    {index > 0 && <button onClick={() => setIndex(prev => Math.max(0, prev - 1))} style={smallBtnStyle}>{isAr ? 'السابق' : 'Back'}</button>}
                    {index < steps.length - 1 ? (
                        <button onClick={() => setIndex(prev => Math.min(steps.length - 1, prev + 1))} style={primaryBtnStyle}>{isAr ? 'التالي' : 'Next'}</button>
                    ) : (
                        <button onClick={closeAll} style={primaryBtnStyle}>{isAr ? 'تم' : 'Done'}</button>
                    )}
                    <button onClick={closeAll} style={{ ...smallBtnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.12)' }}>{isAr ? 'تخطي' : 'Skip'}</button>
                </div>
            </div>
        </div>
    );
};

const primaryBtnStyle = {
    background: 'var(--primary)',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700
};

const smallBtnStyle = {
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    border: 'none',
    padding: '8px 10px',
    borderRadius: 10,
    cursor: 'pointer'
};

export default Onboarding;
