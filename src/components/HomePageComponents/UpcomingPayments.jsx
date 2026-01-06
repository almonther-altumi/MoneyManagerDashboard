
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import '../Styles/UpcomingPaymentsStyle.css';

const UpcomingPayments = ({ debts = [], onDataChange }) => {
    const [completedItems, setCompletedItems] = useState([]);
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
        // optimistic UI
        setCompletedItems(prev =>
            isCurrentlyCompleted ? prev.filter(item => item !== id) : [...prev, id]
        );

        try {
            const ref = doc(db, "users", user.uid, "debts", id);
            if (!isCurrentlyCompleted) {
                // mark settled
                await updateDoc(ref, { settled: true, progress: 100, remaining: 0 });
                showNotification("Payment marked as settled", "success");
            } else {
                // unmark settled
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

            showNotification("Obligation registered successfully", "success");
            setIsModalOpen(false);
            setNewData({ name: "", amount: "", date: new Date().toISOString().split('T')[0] });
            if (onDataChange) onDataChange();
        } catch (error) {
            console.error(error);
            showNotification("Failed to register obligation", "error");
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm('Delete this obligation? This action cannot be undone.');
        if (!ok) return;
        const user = auth.currentUser;
        if (!user) {
            showNotification("You must be signed in", "error");
            return;
        }

        try {
            await deleteDoc(doc(db, "users", user.uid, "debts", id));
            showNotification("Obligation deleted", "success");
            // remove locally if present
            setCompletedItems(prev => prev.filter(i => i !== id));
            if (onDataChange) onDataChange();
        } catch (err) {
            console.error(err);
            showNotification("Failed to delete obligation", "error");
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
                    <h3>Future Obligations</h3>
                    <p>Timeline of upcoming settlements</p>
                </div>
                <div className="header-actions-group">
                    <button className="view-all-text-btn" onClick={() => navigate('/debts')}>View All</button>
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
                                        <div className={`status-pill ${item.status}`}>{item.status}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <button className="mark-settled-btn" onClick={() => toggleComplete(item.id)}>
                                        {isCompleted ? 'Settled ✓' : 'Mark as Settled'}
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(item.id)} title="Delete obligation">✖</button>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="empty-obligations">
                        <div className="empty-sparkle">✨</div>
                        <p>No immediate obligations detected.</p>
                    </div>
                )}
            </div>

            {/* Quick Add Modal */}
            {isModalOpen && (
                <div className="luxury-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="luxury-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 style={{color:"var(--text)"}}>Register Obligation</h3>
                            <button className="close-modal" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        <form onSubmit={handleAddObligation} className="modal-form">
                            <div className="input-group">
                                <label>Description</label>
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
                                    <label>Amount ($)</label>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        required
                                        value={newData.amount}
                                        onChange={e => setNewData({ ...newData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={newData.date}
                                        onChange={e => setNewData({ ...newData, date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="commit-btn">Instantiate Obligation</button>
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
