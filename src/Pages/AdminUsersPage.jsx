
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { Search, UserCheck, ShieldOff } from 'lucide-react';
import '../components/Styles/AdminUsersStyle.css';

const AdminUsersPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [banModal, setBanModal] = useState({ isOpen: false, user: null, reason: '' });

    useEffect(() => {
        if (auth.currentUser?.email !== 'monthertumi2025@gmail.com') return;

        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            const userList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(userList);
        });

        return () => unsubscribe();
    }, []);

    const handleAction = async (user, action) => {
        const userRef = doc(db, 'users', user.id);
        if (action === 'unban' || action === 'activate') {
            await updateDoc(userRef, {
                status: 'active',
                statusUpdatedAt: serverTimestamp()
            });
        }
    };

    const confirmBan = async () => {
        if (!banModal.reason) return;
        const userRef = doc(db, 'users', banModal.user.id);
        await updateDoc(userRef, {
            status: 'banned',
            statusReason: banModal.reason,
            statusUpdatedAt: serverTimestamp()
        });
        setBanModal({ isOpen: false, user: null, reason: '' });
    };

    const filteredUsers = users.filter(u =>
        (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (auth.currentUser?.email !== 'monthertumi2025@gmail.com') {
        return <div className="admin-error">Access Denied</div>;
    }

    return (
        <div className="admin-users-root">
            <div className="admin-users-container">
                <header className="admin-users-header">
                    <div>
                        <h1>{t('admin_users.title')}</h1>
                        <p>{t('admin_users.subtitle')}</p>
                    </div>
                    <div className="admin-stats-mini">
                        <div className="stat-box">
                            <span>{t('admin_users.total_users')}</span>
                            <strong>{users.length}</strong>
                        </div>
                        <div className="stat-box banned">
                            <span>{t('admin_users.banned_users')}</span>
                            <strong>{users.filter(u => u.status === 'banned' || u.status === 'suspended').length}</strong>
                        </div>
                    </div>
                </header>

                <div className="search-bar-wrapper">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder={t('admin_users.search_placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="users-table-card">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('admin_users.table_name')}</th>
                                <th>{t('admin_users.table_status')}</th>
                                <th>{t('admin_users.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                <tr key={user.id} className={user.status}>
                                    <td>
                                        <div className="user-info-cell">
                                            <div className="avatar-placeholder">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="user-email">{user.email}</div>
                                                <div className="user-uid">{user.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${user.status || 'active'}`}>
                                            {user.status === 'suspended' ? t('admin_users.status_suspended') :
                                                user.status === 'banned' ? t('admin_users.status_banned') :
                                                    t('admin_users.status_active')}
                                        </span>
                                        {user.statusReason && <div className="reason-hint">{user.statusReason}</div>}
                                    </td>
                                    <td>
                                        <div className="user-actions-btns">
                                            {user.status === 'banned' || user.status === 'suspended' ? (
                                                <button className="unban-btn" onClick={() => handleAction(user, 'activate')}>
                                                    <UserCheck size={16} /> {t('admin_users.unban_btn')}
                                                </button>
                                            ) : (
                                                <button className="ban-btn" onClick={() => setBanModal({ isOpen: true, user, reason: '' })}>
                                                    <ShieldOff size={16} /> {t('admin_users.ban_btn')}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3" className="no-users-row">{t('admin_users.no_users')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {banModal.isOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-content">
                        <h2>{t('admin_users.ban_btn')}</h2>
                        <p>{banModal.user?.email}</p>

                        <div className="form-group">
                            <label>{t('admin_users.reason_label')}</label>
                            <textarea
                                value={banModal.reason}
                                onChange={(e) => setBanModal({ ...banModal, reason: e.target.value })}
                                placeholder={t('admin_users.reason_placeholder')}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setBanModal({ isOpen: false, user: null, reason: '' })}>
                                {t('common.cancel')}
                            </button>
                            <button className="confirm-ban-btn" onClick={confirmBan}>
                                {t('admin_users.confirm_ban')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
