import React, { useEffect, useRef } from 'react';
import './Styles/NotificationMenuStyle.css';
import { useTranslation } from 'react-i18next';

const NotificationMenu = ({ onClose }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    // Mock Data for "App News"
    const notifications = [
        {
            id: 1,
            title: "New Feature: Dark Mode",
            user: "MoneyManager Team",
            time: "2024/01/22",
            isRead: false,
            avatar: "M" // Placeholder or URL
        },
        {
            id: 2,
            title: "Weekly Summary Available",
            user: "System",
            time: "2024/01/24",
            isRead: true,
            avatar: "S"
        },
        {
            id: 3,
            title: "Security Update",
            user: "Security Team",
            time: "2024/01/23",
            isRead: true,
            avatar: "T"
        },
        {
            id: 4,
            title: "Welcome to Money Manager!",
            user: "Admin",
            time: "2024/01/20",
            isRead: true,
            avatar: "A"
        }
    ];

    const { t } = useTranslation();

    return (
        <div className="notification-dropdown" ref={menuRef}>
            <div className="notification-header">
                <h3>{t('notifications.title')}</h3>
                <button className="settings-btn" onClick={onClose} title={t('common.close', 'Close')}>
                    <svg height="24" viewBox="0 0 24 24" width="24" focusable="false" style={{ pointerEvents: 'none', display: 'block', width: '100%', height: '100%' }}><path d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03 .66.07 .98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" fill="currentColor"></path></svg>
                </button>
            </div>
            <div className="notification-list">
                {notifications.length > 0 ? (
                    <>
                        <div className="notification-section-title">{t('notifications.important')}</div>
                        {notifications.slice(0, 1).map(note => (
                            <div key={note.id} className="notification-item unread">
                                <div className="notification-avatar">{note.avatar}</div>
                                <div className="notification-content">
                                    <p className="notification-text">
                                        <span className="notification-user">{note.user}</span> {t('notifications.uploaded')} {note.title}
                                    </p>
                                    <span className="notification-time">{note.time}</span>
                                </div>
                                <div className="notification-options">
                                    <button className="more-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                                <div className="unread-dot"></div>
                            </div>
                        ))}

                        <div className="notification-section-title">{t('notifications.more')}</div>
                        {notifications.slice(1).map(note => (
                            <div key={note.id} className="notification-item">
                                <div className="notification-avatar">{note.avatar}</div>
                                <div className="notification-content">
                                    <p className="notification-text">
                                        <span className="notification-user">{note.user}</span>: {note.title}
                                    </p>
                                    <span className="notification-time">{note.time}</span>
                                </div>
                                <div className="notification-options">
                                    <button className="more-btn">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>{t('notifications.no_notifications')}</p>
                )}
            </div>
        </div>
    );
};

export default NotificationMenu;
