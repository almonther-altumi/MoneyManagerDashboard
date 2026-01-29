import React, { useState } from 'react';
import '../../components/Styles/DebtsPageStyles/AddDebtModalStyle.css';
import { useTranslation } from 'react-i18next';

const AddDebtModal = ({ onClose, onAdd }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [reason, setReason] = useState('');
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !amount) return;

        setIsLoading(true);
        try {
            await onAdd({
                name,
                reason: reason || 'Personal Loan',
                amount: Number(amount)
            });
            onClose();
        } catch (error) {
            console.error("Failed to add debt", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="add-debt-modal-overlay" onClick={onClose}>
            <div className="add-debt-modal-content" onClick={e => e.stopPropagation()}>
                <div className="add-debt-header">
                    <h2>{t('debts.modal_title')}</h2>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="add-debt-form">
                    <div className="form-group">
                        <label>{t('debts.person_name')}</label>
                        <input
                            type="text"
                            placeholder={t('debts.placeholder_person')}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('debts.reason_title')}</label>
                        <input
                            type="text"
                            placeholder={t('debts.placeholder_reason')}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>{t('debts.total_amount')}</label>
                        <input
                            type="number"
                            placeholder={t('table.placeholder_amount')}
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>{t('debts.cancel')}</button>
                        <button type="submit" className="confirm-btn" disabled={isLoading || !name || !amount}>
                            {isLoading ? t('debts.saving') : t('debts.save_debt')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDebtModal;
