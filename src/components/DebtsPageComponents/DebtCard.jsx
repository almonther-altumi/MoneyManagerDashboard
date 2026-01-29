import React from 'react';
import '../../components/Styles/DebtsPageStyles/DebtCardStyle.css';

const DebtCard = ({ debt, onClick }) => {
    const total = Number(debt.amount) || 0;
    const remaining = Number(debt.remaining) || 0;
    const paid = total - remaining;

    const progress = total > 0 ? (paid / total) * 100 : 0;
    const cleanProgress = Math.min(Math.max(progress, 0), 100);

    return (
        <div className="debt-horizontal-card" onClick={() => onClick(debt)}>
            <div className="card-left">
                <div className="avatar-circle">
                    {debt.name ? debt.name.charAt(0).toUpperCase() : '?'}
                </div>
            </div>

            <div className="card-center">
                <div className="debt-main-info">
                    <h3 className="name">{debt.name}</h3>
                    <span className="reason">{debt.reason || "Generic Loan"}</span>
                </div>
                {/* Mobile View: Progress moves here usually, or keep simple */}
            </div>

            <div className="card-right">
                <div className="financial-stack">
                    <div className="amount-group">
                        <span className="amount-label">Remaining</span>
                        <span className="amount-value">${remaining.toLocaleString()}</span>
                    </div>
                </div>

                <div className="progress-section">
                    <div className="progress-bar-bg">
                        <div
                            className="progress-bar-fill"
                            style={{ width: `${cleanProgress}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">{Math.round(cleanProgress)}% Paid</span>
                </div>
            </div>
        </div>
    );
};

export default DebtCard;
