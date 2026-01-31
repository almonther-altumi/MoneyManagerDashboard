import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Trash2, Edit3, X, Send } from 'lucide-react';
import '../components/Styles/AdminNotificationsStyle.css';

const AdminNotificationsPage = () => {
    const { t, i18n } = useTranslation();
    const [titleEn, setTitleEn] = useState('');
    const [titleAr, setTitleAr] = useState('');
    const [messageEn, setMessageEn] = useState('');
    const [messageAr, setMessageAr] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [recentNotifications, setRecentNotifications] = useState([]);

    useEffect(() => {
        if (auth.currentUser?.email !== 'monthertumi2025@gmail.com') return;

        const q = query(
            collection(db, 'global_notifications'),
            orderBy('time', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRecentNotifications(docs);
        });

        return () => unsubscribe();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!titleEn || !titleAr || !messageEn || !messageAr) return;

        setLoading(true);
        setStatus({ type: '', msg: '' });

        try {
            if (editingId) {
                // Update existing
                const docRef = doc(db, 'global_notifications', editingId);
                await updateDoc(docRef, {
                    title_en: titleEn,
                    title_ar: titleAr,
                    message_en: messageEn,
                    message_ar: messageAr,
                    lastModified: serverTimestamp()
                });
                setStatus({ type: 'success', msg: t('admin.update_success') });
                setEditingId(null);
            } else {
                // Add new
                await addDoc(collection(db, 'global_notifications'), {
                    title_en: titleEn,
                    title_ar: titleAr,
                    message_en: messageEn,
                    message_ar: messageAr,
                    user: 'Admin',
                    avatar: 'A',
                    time: serverTimestamp(),
                    createdAt: new Date().toISOString(),
                    isRead: false
                });
                setStatus({ type: 'success', msg: t('admin.success') });
            }

            resetForm();
        } catch (error) {
            console.error('Error with notification:', error);
            setStatus({ type: 'error', msg: t('admin.error') });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (note) => {
        setEditingId(note.id);
        setTitleEn(note.title_en || '');
        setTitleAr(note.title_ar || '');
        setMessageEn(note.message_en || '');
        setMessageAr(note.message_ar || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('common.confirm_delete', 'Are you sure you want to delete this?'))) return;
        try {
            await deleteDoc(doc(db, 'global_notifications', id));
            setStatus({ type: 'success', msg: t('admin.delete_success') });
        } catch (error) {
            console.error('Error deleting:', error);
        }
    };

    const resetForm = () => {
        setTitleEn('');
        setTitleAr('');
        setMessageEn('');
        setMessageAr('');
        setEditingId(null);
    };

    if (auth.currentUser?.email !== 'monthertumi2025@gmail.com') {
        return <div className="admin-error">Access Denied</div>;
    }

    return (
        <div className="admin-page-root">
            <div className="admin-container">
                <header className="admin-header">
                    <h1>{t('admin.title')}</h1>
                    <p>{t('admin.subtitle')}</p>
                </header>

                <form className="admin-form" onSubmit={handleSend}>
                    <div className="admin-grid">
                        <div className="form-group">
                            <label>{t('admin.title_label_en')}</label>
                            <input
                                type="text"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                placeholder={t('admin.title_placeholder_en')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('admin.title_label_ar')}</label>
                            <input
                                type="text"
                                value={titleAr}
                                onChange={(e) => setTitleAr(e.target.value)}
                                placeholder={t('admin.title_placeholder_ar')}
                                required
                                dir="rtl"
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('admin.message_label_en')}</label>
                            <textarea
                                value={messageEn}
                                onChange={(e) => setMessageEn(e.target.value)}
                                placeholder={t('admin.message_placeholder_en')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>{t('admin.message_label_ar')}</label>
                            <textarea
                                value={messageAr}
                                onChange={(e) => setMessageAr(e.target.value)}
                                placeholder={t('admin.message_placeholder_ar')}
                                required
                                dir="rtl"
                            />
                        </div>
                    </div>

                    {status.msg && (
                        <div className={`status-msg ${status.type}`}>
                            {status.msg}
                        </div>
                    )}

                    <div className="admin-actions">
                        <button type="submit" className={`send-btn ${editingId ? 'update' : ''}`} disabled={loading}>
                            {loading ? '...' : (editingId ? t('admin.update_btn') : t('admin.send_btn'))}
                        </button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={resetForm}>
                                {t('admin.cancel_btn')}
                            </button>
                        )}
                    </div>
                </form>

                <div className="recent-notifications">
                    <h2 className="section-title">{t('admin.recent_title')}</h2>
                    <div className="notes-list">
                        {recentNotifications.map(note => (
                            <div key={note.id} className="note-item">
                                <div className="note-info">
                                    <h3>{i18n.language === 'ar' ? note.title_ar : note.title_en}</h3>
                                    <p>{i18n.language === 'ar' ? note.message_ar : note.message_en}</p>
                                </div>
                                <div className="note-actions">
                                    <button onClick={() => handleEdit(note)} className="edit-action" title={t('admin.edit_btn')}>
                                        <Edit3 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(note.id)} className="delete-action" title={t('admin.delete_btn')}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminNotificationsPage;
