import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const steps = [
    {
        key: 'sidebar',
        titleEn: 'Open the sidebar',
        titleAr: 'افتح القائمة الجانبية',
        descEn: 'Use the menu to access all pages and sections.',
        descAr: 'من خلال القائمة تقدر توصل لكل الصفحات والأقسام بسهولة.',
        selectors: ['.menu-toggle-btn', 'button[aria-label="Toggle Sidebar"]'],
        preferredPlacement: 'bottom'
    },
    {
        key: 'add',
        titleEn: 'Add transactions',
        titleAr: 'أضف المعاملات',
        descEn: 'Start from Income or Expense pages to add entries quickly.',
        descAr: 'ابدأ من صفحات الإيرادات أو المصروفات لإضافة المعاملات بسرعة.',
        selectors: ['a[href="/income"]', '[href="/income"]', 'a[href="/expense"]', '[href="/expense"]', '.add-schedule-btn', '.add-bill-btn', '.add-btn-main', '.add-btn-expense', '.add-btn-debt'],
        preferredPlacement: 'bottom'
    },
    {
        key: 'reports',
        titleEn: 'View reports',
        titleAr: 'شاهد التقارير',
        descEn: 'See insights, trends, and charts about your finances.',
        descAr: 'اطّلع على التحليلات والرسوم لمعرفة وضعك المالي.',
        selectors: ['a[href="/reports"]', '[href="/reports"]']
    },
    {
        key: 'settings',
        titleEn: 'Customize',
        titleAr: 'خصّص الإعدادات',
        descEn: 'Adjust language, theme, and other preferences.',
        descAr: 'غيّر اللغة والثيم وبقية الإعدادات حسب رغبتك.',
        selectors: ['a[href="/settings"]', '[href="/settings"]', '.settings-link']
    }
];

const Onboarding2 = ({ onFinish }) => {
    const { i18n } = useTranslation();
    const [visible, setVisible] = useState(false);
    const [index, setIndex] = useState(0);
    const [rect, setRect] = useState(null);
    const [placement, setPlacement] = useState('top');
    const [tooltipRect, setTooltipRect] = useState(null);
    const tooltipRef = useRef(null);
    const autoOpenedRef = useRef(false);

    useEffect(() => {
        try {
            const seen = sessionStorage.getItem('mm_onboarding_v1');
            if (!seen) setVisible(true);
        } catch (e) {
            setVisible(true);
        }
    }, []);

    useEffect(() => {
        if (!visible) return;
        const update = () => {
            const step = steps[index];
            let target = null;
            if (step.selectors && step.selectors.length) {
                for (const sel of step.selectors) {
                    try {
                        const el = document.querySelector(sel);
                        if (el && isElementVisible(el)) {
                            target = el;
                            break;
                        }
                    } catch (e) {}
                }
            }
            if (target) {
                const r = target.getBoundingClientRect();
                setRect(r);
                const vh = window.innerHeight;
                const vw = window.innerWidth;
                const isMobile = vw <= 640;
                const canTop = r.top > 180;
                const canBottom = (vh - r.bottom) > 180;
                const canLeft = r.left > 320;
                const canRight = (vw - r.right) > 320;

                if (isMobile) {
                    setPlacement('bottom');
                } else if (step.preferredPlacement) {
                    if (step.preferredPlacement === 'right' && canRight) setPlacement('right');
                    else if (step.preferredPlacement === 'left' && canLeft) setPlacement('left');
                    else if (step.preferredPlacement === 'top' && canTop) setPlacement('top');
                    else if (step.preferredPlacement === 'bottom' && canBottom) setPlacement('bottom');
                    else if (canBottom) setPlacement('bottom');
                    else if (canTop) setPlacement('top');
                    else if (canRight) setPlacement('right');
                    else if (canLeft) setPlacement('left');
                    else setPlacement('bottom');
                } else if (index === 0) {
                    setPlacement(canRight ? 'right' : (canBottom ? 'bottom' : 'top'));
                } else if (index === 1) {
                    setPlacement(canLeft ? 'left' : (canBottom ? 'bottom' : 'top'));
                } else if (canTop) {
                    setPlacement('top');
                } else if (canBottom) {
                    setPlacement('bottom');
                } else if (canRight) {
                    setPlacement('right');
                } else if (canLeft) {
                    setPlacement('left');
                } else {
                    setPlacement('bottom');
                }

                target.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
            } else {
                setRect(null);
            }
        };

        update();
        const intervalId = setInterval(update, 700);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            clearInterval(intervalId);
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [index, visible]);

    useEffect(() => {
        if (!visible) return;
        const onKey = (e) => {
            if (e.key === 'Escape') closeAll();
            else if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (index < steps.length - 1) setIndex(i => i + 1);
                else closeAll();
            } else if (e.key === 'ArrowRight') {
                if (index < steps.length - 1) setIndex(i => i + 1);
            } else if (e.key === 'ArrowLeft') {
                if (index > 0) setIndex(i => i - 1);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [visible, index]);

    useEffect(() => {
        if (!visible) return;
        const isMobile = window.innerWidth <= 640;
        if (!isMobile || autoOpenedRef.current) return;
        if (index === 1) {
            const appRoot = document.querySelector('.app-root');
            const isClosed = appRoot ? appRoot.classList.contains('sidebar-closed') : document.body.classList.contains('sidebar-closed');
            if (isClosed) {
                const toggleBtn = document.querySelector('.menu-toggle-btn');
                if (toggleBtn) {
                    toggleBtn.click();
                    autoOpenedRef.current = true;
                }
            }
        }
    }, [visible, index]);

    useEffect(() => {
        if (!visible) return;
        const raf = requestAnimationFrame(() => {
            if (tooltipRef.current) {
                setTooltipRect(tooltipRef.current.getBoundingClientRect());
            }
        });
        return () => cancelAnimationFrame(raf);
    }, [visible, rect, placement, index]);

    const closeAll = () => {
        try { sessionStorage.setItem('mm_onboarding_v1', '1'); } catch (e) {}
        setVisible(false);
        if (onFinish) onFinish();
    };

    if (!visible) return null;

    const isAr = i18n.language === 'ar';
    const step = steps[index];
    const tooltipStyle = rect ? computeTooltipStyle(rect, placement) : { right: '20px', top: '20px' };
    const arrow = rect && tooltipRect ? buildArrow(rect, tooltipRect) : null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 140000, pointerEvents: 'auto' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(3,7,18,0.35)' }} />

            {rect && (
                <div
                    aria-hidden
                    style={{
                        position: 'fixed',
                        left: rect.left - 8,
                        top: rect.top - 8,
                        width: rect.width + 16,
                        height: rect.height + 16,
                        borderRadius: 16,
                        border: '2px solid var(--primary)',
                        pointerEvents: 'none'
                    }}
                />
            )}

            <div
                ref={tooltipRef}
                role="dialog"
                aria-modal="true"
                style={{
                    position: 'absolute',
                    ...tooltipStyle,
                    maxWidth: 380,
                    padding: 16,
                    borderRadius: 14,
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    border: '1px solid var(--border-muted)',
                    transformOrigin: 'center',
                    animation: 'onboardIn 420ms cubic-bezier(.2,.9,.26,1)',
                    transition: 'transform 240ms ease'
                }}
            >
                <h3 style={{ margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 6, background: 'var(--primary)' }} />
                    {isAr ? step.titleAr : step.titleEn}
                </h3>
                <div style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{isAr ? step.descAr : step.descEn}</div>
                <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
                    {isAr ? `الخطوة ${index + 1} من ${steps.length}` : `Step ${index + 1} of ${steps.length}`}
                </div>
            </div>

            {arrow && (
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
                    style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
                    aria-hidden
                >
                    <defs>
                        <marker id="onboard-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
                            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--primary)" />
                        </marker>
                    </defs>
                    <path
                        d={`M ${arrow.x1} ${arrow.y1} Q ${arrow.cx} ${arrow.cy} ${arrow.x2} ${arrow.y2}`}
                        stroke="var(--primary)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="transparent"
                        markerEnd="url(#onboard-arrowhead)"
                    />
                </svg>
            )}

            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', gap: 12, alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {steps.map((s, i) => (
                        <div key={s.key} onClick={() => setIndex(i)} style={{ width: 10, height: 10, borderRadius: 6, background: i === index ? 'var(--primary)' : 'rgba(255,255,255,0.12)', cursor: 'pointer' }} />
                    ))}
                </div>

                <div style={{ marginLeft: 12, display: 'flex', gap: 8 }}>
                    {index > 0 && <button onClick={() => setIndex(prev => Math.max(0, prev - 1))} style={smallBtnStyle}>{isAr ? 'السابق' : 'Back'}</button>}
                    {index < steps.length - 1 ? (
                        <button onClick={() => setIndex(prev => Math.min(steps.length - 1, prev + 1))} style={primaryBtnStyle}>{isAr ? 'التالي' : 'Next (Space/Enter)'}</button>
                    ) : (
                        <button onClick={closeAll} style={primaryBtnStyle}>{isAr ? 'تم' : 'Done'}</button>
                    )}
                    <button onClick={closeAll} style={{ ...smallBtnStyle, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)' }}>{isAr ? 'تخطي (Esc)' : 'Skip (Esc)'}</button>
                </div>
            </div>

            <style>{`
                @keyframes onboardIn {
                    from { opacity: 0; transform: translateY(6px) rotate(-2deg) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
                }
            `}</style>
        </div>
    );
};

function computeTooltipStyle(rect, placement) {
    const margin = 12;
    const style = {};
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
        style.left = 12;
        style.right = 12;
        style.top = rect ? Math.min(window.innerHeight - 180, rect.bottom + margin) : 20;
        return style;
    }
    if (placement === 'top') {
        style.left = Math.min(window.innerWidth - 400, Math.max(12, rect.left + rect.width / 2 - 180));
        style.top = Math.max(12, rect.top - 150);
    } else if (placement === 'bottom') {
        style.left = Math.min(window.innerWidth - 400, Math.max(12, rect.left + rect.width / 2 - 180));
        style.top = rect.bottom + margin;
    } else if (placement === 'left') {
        style.left = Math.max(12, rect.left - 420);
        style.top = Math.max(12, rect.top + rect.height / 2 - 60);
    } else {
        style.left = Math.min(window.innerWidth - 400, rect.right + margin);
        style.top = Math.max(12, rect.top + rect.height / 2 - 60);
    }
    return style;
}

function buildArrow(rect, tooltipRect) {
    const isMobile = window.innerWidth <= 640;
    const t = {
        left: tooltipRect.left,
        right: tooltipRect.right,
        top: tooltipRect.top,
        bottom: tooltipRect.bottom,
        width: tooltipRect.width,
        height: tooltipRect.height
    };
    const r = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    };

    const tCenter = { x: t.left + t.width / 2, y: t.top + t.height / 2 };
    const rCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };

    const start = edgePoint(tCenter, rCenter, t);
    const end = edgePoint(rCenter, tCenter, r);

    let dx = end.x - start.x;
    let dy = end.y - start.y;
    let norm = Math.hypot(dx, dy) || 1;
    const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
    const offset = isMobile ? 10 : Math.min(60, norm / 3);
    const perp = { x: -dy / norm, y: dx / norm };

    const cx = mid.x + perp.x * offset;
    const cy = mid.y + perp.y * offset;

    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y, cx, cy };
}

function edgePoint(from, to, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const halfW = rect.width / 2;
    const halfH = rect.height / 2;
    const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
    const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
    const scale = Math.min(scaleX, scaleY);
    return { x: cx + dx * scale, y: cy + dy * scale };
}

function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    if (rect.bottom < 0 || rect.right < 0 || rect.top > window.innerHeight || rect.left > window.innerWidth) {
        return false;
    }
    return true;
}

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

export default Onboarding2;
