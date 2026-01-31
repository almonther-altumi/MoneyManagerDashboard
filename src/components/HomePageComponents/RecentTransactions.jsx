import React from 'react';
import '../Styles/HomePageStyles/RecentTransactionsStyle.css';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function RecentTransactions({ income = [], expenses = [] }) {
    const { t } = useTranslation();
    // Combine and sort by date
    const allTransactions = [
        ...income.map(item => ({
            id: item.id,
            title: item.title || item.source,
            date: item.date?.toDate ? item.date.toDate() : new Date(item.date),
            amount: `+$${(Number(item.amount) || 0).toLocaleString()}`,
            type: "income",
            status: t('home.transactions.status_completed')
        })),
        ...expenses.map(item => ({
            id: item.id,
            title: item.title,
            date: item.date?.toDate ? item.date.toDate() : new Date(item.date),
            amount: `-$${(Number(item.amount) || 0).toLocaleString()}`,
            type: "expense",
            status: t('home.transactions.status_completed')
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);
    const navigate = useNavigate();
    return (
        <section className="transactions-card">
            <div className="card-header">
                <h3>{t('home.transactions.title')}</h3>
                <button className="view-all-btn" onClick={() => navigate('/income')}>{t('home.transactions.view_all')}</button>
            </div>

            <div className="transactions-list">
                {allTransactions.length > 0 ? allTransactions.map(item => (
                    <div key={item.id} className="transaction-item">
                        <div className={`icon-box ${item.type}`}>
                            {item.type === 'income' ? '$' : '−'}
                        </div>
                        <div className="transaction-details">
                            <p className="t-title">{item.title}</p>
                            <p className="t-date">{item.date.toLocaleDateString()}</p>
                        </div>
                        <div className="transaction-status">
                            <span className={`status-tag ${item.status === 'Completed' ? 'completed' : 'completed'}`}>{item.status}</span>
                        </div>
                        <div className={`transaction-amount ${item.type}`}>
                            {item.amount}
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>{t('home.transactions.no_transactions')}</p>
                )}
            </div>
        </section>
    );
}

export default RecentTransactions;
