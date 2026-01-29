
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import '../Styles/HomePageStyles/UpcomingPaymentsStyle.css';
import { useTranslation } from "react-i18next";

const UpcomingPayments = ({ debts = [], onDataChange }) => {
    const { t } = useTranslation();
    const [completedItems, setCompletedItems] = useState([]);
    const [updatingIds, setUpdatingIds] = useState([]);
    const [deletingIds, setDeletingIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newData, setNewData] = useState({
        name: "",
        amount: "",
        date: new Date().toISOString().split('T')[0]
    });

    const { notification, showNotification, hideNotification } = useNotification();
    const navigate = useNavigate();

    const toggleComplete = async (id) => {
        const user = auth.currentUser;
        if (!user) {
            showNotification("You must be signed in", "error");
            return;
        }
        const isCurrentlyCompleted = completedItems.includes(id);
        if (updatingIds.includes(id)) return; // already in-flight

        // optimistic UI + mark in-flight
        setUpdatingIds(prev => [...prev, id]);
        setCompletedItems(prev =>
            isCurrentlyCompleted ? prev.filter(item => item !== id) : [...prev, id]
        );

        try {
            const ref = doc(db, "users", user.uid, "debts", id);
            if (!isCurrentlyCompleted) {
                await updateDoc(ref, { settled: true, progress: 100, remaining: 0 });
                showNotification(t('upcoming.success_update'), "success");
            } else {
                await updateDoc(ref, { settled: false, progress: 0 });
                showNotification("Payment marked as unsettled", "info");
            }
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error(err);
            showNotification("Failed to update payment status", "error");
            // revert optimistic UI on failure
            setCompletedItems(prev =>
                isCurrentlyCompleted ? [...prev, id] : prev.filter(item => item !== id)
            );
        } finally {
            setUpdatingIds(prev => prev.filter(i => i !== id));
        }
    };

    const getStatus = (debt) => {
        if (!debt.nextPayment) return "scheduled";
        const today = new Date();
        const dueDate = new Date(debt.nextPayment);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) return "urgent";
        if (diffDays <= 7) return "pending";
        return "scheduled";
    };

    const getIcon = (name = "none") => {

        const n = name.toLowerCase();
        if (n.includes('card') || n.includes('visa')) return '💳';
        if (n.includes('bank') || n.includes('loan')) return '🏦';
        if (n.includes('rent') || n.includes('home')) return '🏠';
        if (n.includes('phone') || n.includes('net')) return '🌐';
        return '💸';
    };

    const handleAddObligation = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) return;

        try {
            await addDoc(collection(db, "users", user.uid, "debts"), {
                name: newData.name,
                amount: Number(newData.amount),
                remaining: Number(newData.amount),
                nextPayment: newData.date,
                progress: 0,
                settled: false,
                createdAt: new Date()
            });

            showNotification(t('upcoming.success_add'), "success");
            setIsModalOpen(false);
            setNewData({ name: "", amount: "", date: new Date().toISOString().split('T')[0] });
            if (onDataChange) onDataChange();
        } catch (error) {
            console.error(error);
            showNotification(t('upcoming.error_add'), "error");
        }
    };

    const handleDelete = async (id) => {

        const user = auth.currentUser;
        if (!user) {
            showNotification("You must be signed in", "error");
            return;
        }

        if (deletingIds.includes(id)) return;
        setDeletingIds(prev => [...prev, id]);

        try {
            await deleteDoc(doc(db, "users", user.uid, "debts", id));
            showNotification(t('upcoming.success_delete'), "success");
            // remove locally if present
            setCompletedItems(prev => prev.filter(i => i !== id));
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error(err);
            showNotification("Failed to delete obligation", "error");
        } finally {
            setDeletingIds(prev => prev.filter(i => i !== id));
        }
    }

    // initialize completedItems from incoming debts (persisted settled state)
    useEffect(() => {
        if (!debts || debts.length === 0) return;
        const settledIds = debts.filter(d => d.settled).map(d => d.id);
        setCompletedItems(settledIds);
    }, [debts]);

    const payments = debts.map(debt => ({
        id: debt.id,
        name: debt.name,
        amount: debt.amount || debt.remaining,
        date: debt.nextPayment || 'Monthly recurring',
        status: getStatus(debt),
        icon: getIcon(debt.name)
    })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);

    return (
        <section className="upcoming-payments-card">
            <div className="payments-header">
                <div className="header-info">
                    <h3>{t('upcoming.title')}</h3>
                    <p>{t('upcoming.subtitle')}</p>
                </div>
                <div className="header-actions-group">
                    <button className="view-all-text-btn" onClick={() => navigate('/debts')}>{t('upcoming.view_all')}</button>
                    <button className="add-schedule-btn" title="Add Schedule" onClick={() => setIsModalOpen(true)}>+</button>
                </div>
            </div>

            <div className="payments-timeline">
                {payments.length > 0 ? payments.map((item) => {
                    const isCompleted = completedItems.includes(item.id);
                    return (
                        <div key={item.id} className={`payment-timeline-item ${isCompleted ? 'completed' : ''} ${item.status}`}>
                            <div className="timeline-node">
                                <div className="node-dot"></div>
                                <div className="node-line"></div>
                            </div>

                            <div className="payment-content">
                                <div className="payment-main-row">
                                    <div className="payment-identity">
                                        <div className="payment-icon-small">{item.icon}</div>
                                        <div className="payment-text">
                                            <h4>{item.name}</h4>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                    <div className="payment-finance">
                                        <div className="payment-val">${Number(item.amount).toLocaleString()}</div>
                                        <div className={`status-pill ${item.status}`}>{t(`upcoming.status_${item.status}`)}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {
                                        (() => {
                                            const isUpdating = updatingIds.includes(item.id);
                                            const isDeleting = deletingIds.includes(item.id);
                                            return (
                                                <>
                                                    <button
                                                        className={`mark-settled-btn ${isCompleted ? 'settled' : ''}`}
                                                        onClick={() => toggleComplete(item.id)}
                                                        disabled={isUpdating || isDeleting}
                                                        aria-pressed={isCompleted}
                                                    >
                                                        {isUpdating ? <span className="btn-spinner" /> : (isCompleted ? `${t('upcoming.settled')} ✓` : t('upcoming.mark_settled'))}
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Delete obligation"
                                                        aria-label={`Delete ${item.name}`}
                                                        disabled={isDeleting || isUpdating}
                                                    >
                                                        {isDeleting ? <span className="btn-spinner" /> : '✖'}
                                                    </button>
                                                </>
                                            );
                                        })()
                                    }
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="empty-obligations">
                        {/* <div className="empty-sparkle">✨</div> */}
                        <p>{t('upcoming.no_obligations')}</p>
                    </div>
                )}
            </div>

            {/* Quick Add Modal */}
            {isModalOpen && (
                <div className="luxury-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="luxury-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{ color: "var(--text)" }}>{t('upcoming.register_obligation')}</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddObligation} className="modal-form">
                            <div className="input-group">
                                <label>{t('upcoming.description')}</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly Rent"
                                    required
                                    value={newData.name}
                                    onChange={e => setNewData({ ...newData, name: e.target.value })}
                                    autoFocus
                                />
                            </div>
                            <div className="input-row">
                                <div className="input-group">
                                    <label>{t('upcoming.amount')}</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        value={newData.amount}
                                        onChange={e => setNewData({ ...newData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>{t('upcoming.due_date')}</label>
                                    <input
                                        type="date"
                                        required
                                        value={newData.date}
                                        onChange={e => setNewData({ ...newData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="commit-btn">{t('upcoming.instantiate_obligation')}</button>
                        </form>
                    </div>
                </div>
            )}

            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />
        </section>
    );
};

export default UpcomingPayments;
