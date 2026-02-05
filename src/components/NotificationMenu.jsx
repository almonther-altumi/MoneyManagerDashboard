import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import './Styles/NotificationMenuStyle.css';
import { useTranslation } from 'react-i18next';

const NotificationMenu = ({ onClose, user }) => {
    const menuRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const { t, i18n } = useTranslation();

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

    useEffect(() => {
        if (!user) return; // only fetch global notifications for authenticated users

        const q = query(
            collection(db, 'global_notifications'),
            orderBy('time', 'desc'),
            limit(4)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notes = snapshot.docs.map(doc => {
                const data = doc.data();
                const currentLang = i18n.language === 'ar' ? 'ar' : 'en';

                return {
                    id: doc.id,
                    ...data,
                    displayTitle: data[`title_${currentLang}`] || data.title || '...',
                    displayMessage: data[`message_${currentLang}`] || data.message || '...',
                    displayTime: data.time?.toDate ?
                        new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(data.time.toDate()) :
                        data.createdAt || '...'
                };
            });
            setNotifications(notes);
        }, (err) => {
            console.warn('NotificationMenu listener error:', err);
        });

        return () => unsubscribe();
    }, [i18n.language, user]);

    return (
        <div className="notification-dropdown" ref={menuRef}>
            <div className="notification-header">
                <h3>{t('notifications.title')}</h3>
                <button className="close-menu-btn" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="notification-list">
                {notifications.length > 0 ? (
                    <>
                        {notifications.map((note, index) => (
                            <React.Fragment key={note.id}>
                                {index === 0 && <div className="notification-section-title">{t('notifications.important')}</div>}
                                {index === 1 && <div className="notification-section-title">{t('notifications.more')}</div>}
                                <div className={`notification-item ${index === 0 ? 'unread' : ''}`}>
                                    <div className="notification-avatar">{note.avatar}</div>
                                    <div className="notification-content">
                                        <p className="notification-text">
                                            <span className="notification-user">{note.user}</span>: {note.displayTitle}
                                        </p>
                                        <p className="notification-desc" style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0' }}>
                                            {note.displayMessage}
                                        </p>
                                        <span className="notification-time">{note.displayTime}</span>
                                    </div>
                                    {index === 0 && <div className="unread-dot"></div>}
                                </div>
                            </React.Fragment>
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
