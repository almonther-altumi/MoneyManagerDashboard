import React, { useState } from 'react';
import '../../components/Styles/DebtsPageStyles/DebtHistoryModalStyle.css';
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import ConfirmationModal from './ConfirmationModal'; // Import the custom modal
import { useTranslation } from 'react-i18next';

const DebtHistoryModal = ({ debt, onClose, onUpdate, onDelete }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for local item deletion confirmation
    const [itemToDelete, setItemToDelete] = useState(null);

    const history = debt.history || [];

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount) return;
        setIsSubmitting(true);
        try {
            const val = Number(amount);
            const newRemaining = (Number(debt.remaining) || 0) - val;

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
            setIsSubmitting(false);
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (item) => {
        setItemToDelete(item);
    };

    const confirmDeleteItem = async () => {
        if (!itemToDelete) return;
        try {
            const val = Number(itemToDelete.amount);
            // Revert balance (add back the paid amount)
            const newRemaining = (Number(debt.remaining) || 0) + val;

            await onUpdate(debt.id, {
                remaining: newRemaining,
                history: arrayRemove(itemToDelete)
            });
            setItemToDelete(null); // Close modal
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="debt-modal-overlay" onClick={onClose}>
            <div className="debt-modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header-simple">
                    <h2>{debt.name}</h2>
                    <span className="subtitle">{debt.reason}</span>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <div className="modal-body-simple">
                    <div className="history-list">
                        <h4>{t('debts.transaction_history')}</h4>
                        {history.length === 0 ? <p className="empty-text">{t('debts.no_history')}</p> : (
                            history.map((h, i) => (
                                <div key={i} className="history-row-simple">
                                    <div className="row-left">
                                        <span className="date">
                                            {h.date?.toDate ? h.date.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                                        </span>
                                        <span className="amount success">-${Number(h.amount).toLocaleString()}</span>
                                    </div>
                                    <button
                                        className="delete-item-btn"
                                        onClick={() => handleDeleteClick(h)}
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
                                autoFocus
                            />
                            <button className="pay-confirm-btn" onClick={handlePayment} disabled={isSubmitting}>
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

            {/* Custom Confirmation for Item Deletion */}
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
