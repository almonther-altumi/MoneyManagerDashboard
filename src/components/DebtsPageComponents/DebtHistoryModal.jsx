import React, { useState } from 'react';
import '../../components/Styles/DebtsPageStyles/DebtHistoryModalStyle.css';
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import ConfirmationModal from './ConfirmationModal'; // Import the custom modal
import { useTranslation } from 'react-i18next';

const DebtHistoryModal = ({ debt, onClose, onUpdate, onDelete }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isEditingTotal, setIsEditingTotal] = useState(false);
    const [newTotalValue, setNewTotalValue] = useState('');

    // State for local item deletion confirmation
    const [itemToDelete, setItemToDelete] = useState(null);

    const history = debt.history || [];

    // Force numeric conversion for reliability
    const parseCurrency = (val) => {
        if (typeof val === 'number') return val;
        return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        const val = parseFloat(amount);
        if (!val || isNaN(val) || val <= 0) return;

        setIsSubmitting(true);
        try {
            const currentRemaining = parseCurrency(debt.remaining);
            const newRemaining = Math.max(0, currentRemaining - val);

            // Update database and parent state
            await onUpdate(debt.id, {
                remaining: newRemaining,
                history: arrayUnion({
                    amount: val,
                    type: 'payment',
                    date: Timestamp.now(),
                    note: 'Manual Payment'
                })
            });
            setAmount('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            const val = parseCurrency(itemToDelete.amount);
            const currentRemaining = parseCurrency(debt.remaining);
            const newRemaining = currentRemaining + val;

            await onUpdate(debt.id, {
                remaining: newRemaining,
                history: arrayRemove(itemToDelete)
            });
            setItemToDelete(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateTotalAmount = async () => {
        const newVal = parseFloat(newTotalValue);
        if (isNaN(newVal) || newVal < 0) return;

        try {
            const oldTotal = parseCurrency(debt.amount);
            const oldRemaining = parseCurrency(debt.remaining);
            const diff = newVal - oldTotal;
            const newRemaining = Math.max(0, oldRemaining + diff);

            await onUpdate(debt.id, {
                amount: newVal,
                remaining: newRemaining
            });
            setIsEditingTotal(false);
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateObj) => {
        const date = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj);
        // Force Western Arabic numerals while keeping the Arabic text for the month/day if needed
        return date.toLocaleDateString('ar-EG-u-nu-latn', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatMoney = (val) => {
        return Number(val).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    return (
        <div className="debt-modal-overlay" onClick={onClose}>
            <div className="debt-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header-simple">
                    <div className="title-group">
                        <h2>{debt.name}</h2>
                        <span className="subtitle">{debt.reason}</span>
                    </div>

                    <div className="total-amount-edit-box">
                        {isEditingTotal ? (
                            <div className="edit-input-wrapper">
                                <input
                                    type="number"
                                    value={newTotalValue}
                                    onChange={(e) => setNewTotalValue(e.target.value)}
                                    className="total-edit-input"
                                    placeholder={t('debts.total_amount')}
                                    autoFocus
                                />
                                <button className="save-total-btn" onClick={handleUpdateTotalAmount}>✓</button>
                                <button className="cancel-total-btn" onClick={() => setIsEditingTotal(false)}>✕</button>
                            </div>
                        ) : (
                            <div className="display-total-wrapper">
                                <span className="label">{t('debts.total_amount')}:</span>
                                <span className="value">${formatMoney(debt.amount)}</span>
                                <button className="edit-total-trigger" onClick={() => {
                                    setNewTotalValue(parseCurrency(debt.amount));
                                    setIsEditingTotal(true);
                                }} title={t('debts.edit_total')}>✎</button>
                            </div>
                        )}
                    </div>

                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body-simple">
                    <div className="history-list">
                        <h4>{t('debts.transaction_history')}</h4>
                        {history.length === 0 ? <p className="empty-text">{t('debts.no_history')}</p> : (
                            history.slice().reverse().map((h, i) => (
                                <div key={i} className="history-row-simple" style={{ marginBottom: '8px' }}>
                                    <div className="row-left">
                                        <span className="date">{formatDate(h.date)}</span>
                                        <span className="amount success">-${formatMoney(h.amount)}</span>
                                    </div>
                                    <button
                                        className="delete-item-btn"
                                        onClick={() => setItemToDelete(h)}
                                        title="Delete Record"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="quick-pay-form">
                        <h4>{t('debts.make_payment')}</h4>
                        <div className="pay-input-group">
                            <input
                                type="number"
                                placeholder={t('debts.placeholder_payment')}
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handlePayment(e)}
                            />
                            <button className="pay-confirm-btn" onClick={handlePayment} disabled={isSubmitting || !amount}>
                                {isSubmitting ? t('debts.paying') : t('debts.confirm_payment')}
                            </button>
                        </div>
                    </div>

                    <div className="modal-actions-footer">
                        <button className="delete-debt-btn" onClick={() => onDelete(debt.id)}>
                            {t('debts.delete_entire')}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!itemToDelete}
                title={t('debts.delete_payment_title')}
                message={t('debts.delete_payment_msg')}
                onConfirm={confirmDeleteItem}
                onCancel={() => setItemToDelete(null)}
                confirmText={t('debts.delete_payment_confirm')}
                cancelText={t('debts.cancel')}
                isDanger={true}
            />
        </div>
    );
};

export default DebtHistoryModal;
