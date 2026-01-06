import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Notification = ({ show, message, type, onClose }) => {
    useEffect(() => {
        if (show) {
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    const jsx = (
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '320px',
                maxWidth: '640px',
                animation: 'slideInDown 0.32s ease-out',
                fontWeight: '500',
                fontSize: '15px',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Bell/Alarm Icon */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                </div>

                {/* Message */}
                <span style={{ flex: 1 }}>{message}</span>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        border: 'none',
                        color: 'white',
                        borderRadius: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    ×
                </button>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes slideInDown {
                    from { 
                    transform: translateY(-18px);
                    transform: translateX(-50%);
                     opacity: 0 }
                    to {
                        transform: translateY(0);
                        transform: translateX(-50%);
                        opacity: 1 }
                }

               
            `}</style>
        </>
    );

    if (typeof document === 'undefined') return jsx;
    return createPortal(jsx, document.body);
};

export default Notification;
