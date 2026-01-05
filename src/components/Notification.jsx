import React, { useEffect } from 'react';

const Notification = ({ show, message, type, onClose }) => {
    useEffect(() => {
        if (show) {
            // Play notification sound using Web Audio API
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                // Create a pleasant notification sound
                oscillator.frequency.value = 800; // Hz
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            } catch (e) {
                console.log('Audio not supported:', e);
            }
            document.addEventListener('click', () => {
                audioContext.resume();
            });
            // Auto-hide after 3 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <>
            <div style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '16px 24px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '320px',
                maxWidth: '400px',
                animation: 'slideInLeft 0.3s ease-out, shake 0.5s ease-in-out',
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
                    flexShrink: 0,
                    animation: 'ring 0.8s ease-in-out'
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
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: 'white',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                        e.target.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.transform = 'rotate(0deg)';
                    }}
                >
                    ×
                </button>
            </div>

            {/* Animations */}
            <style>{`
                @keyframes slideInLeft {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }

                @keyframes ring {
                    0%, 100% { transform: rotate(0deg); }
                    10%, 30% { transform: rotate(-10deg); }
                    20%, 40% { transform: rotate(10deg); }
                }
            `}</style>
        </>
    );
};

export default Notification;
