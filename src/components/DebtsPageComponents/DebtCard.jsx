import React from 'react';
import '../../components/Styles/DebtsPageStyles/DebtCardStyle.css';
import { useTranslation } from 'react-i18next';

const DebtCard = ({ debt, onClick, isSample }) => {
    const { t } = useTranslation();

    // Sanitize values to handle potential string formatted values from DB
    const sanitize = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        // Force Western Arabic numerals by removing everything except digits and dot
        return parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;
    };

    const total = sanitize(debt.amount);
    const remaining = sanitize(debt.remaining);

    // Calculate paid amount
    const paid = Math.max(0, total - remaining);

    const progress = total > 0 ? (paid / total) * 100 : 0;
    const cleanProgress = Math.min(Math.max(progress, 0), 100);

    // Format numbers with Western Arabic numerals regardless of locale
    const formatMoney = (val) => {
        return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    };

    return (
        <div className="debt-horizontal-card" onClick={() => onClick && onClick(debt)}>
            <div className="card-left">
                <div className="avatar-circle">
                    {debt.name ? debt.name.charAt(0).toUpperCase() : '?'}
                </div>
            </div>

            <div className="card-center">
                <div className="debt-main-info">
                    <div className="name-wrapper">
                        <span className="name">{debt.name}</span>
                        {isSample && <span className="sample-badge-mini">Sample</span>}
                    </div>
                    <span className="reason">{debt.reason || "Generic Loan"}</span>
                </div>
            </div>

            <div className="card-right">
                <div className="amount-group">
                    <span className="amount-label">{t('debts.remaining')}</span>
                    <span className="amount-value">${formatMoney(remaining)}</span>
                </div>

                <div className="progress-section">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${cleanProgress}%` }}
                        ></div>
                    </div>
                    {/* Force English digits here for the percentage */}
                    <span className="progress-text">{t('debts.paid_percent', { percent: Math.round(cleanProgress) }).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))}</span>
                </div>
            </div>
            <style>{`
                .sample-badge-mini {
                    background: rgba(var(--secondary-rgb), 0.1);
                    color: var(--secondary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                    margin-inline-start: 12px;
                    vertical-align: middle;
                    border: 1px solid rgba(var(--secondary-rgb), 0.2);
                }
                .debt-main-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
            `}</style>
        </div>
    );
};

export default DebtCard;
