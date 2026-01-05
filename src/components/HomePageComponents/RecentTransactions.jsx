
import React from 'react';
import '../Styles/RecentTransactionsStyle.css';

function RecentTransactions({ income = [], expenses = [] }) {
    // Combine and sort by date
    const allTransactions = [
        ...income.map(item => ({
            id: item.id,
            title: item.title || item.source,
            date: item.date?.toDate ? item.date.toDate() : new Date(item.date),
            amount: `+$${Number(item.amount).toLocaleString()}`,
            type: "income",
            status: "Completed"
        })),
        ...expenses.map(item => ({
            id: item.id,
            title: item.title,
            date: item.date?.toDate ? item.date.toDate() : new Date(item.date),
            amount: `-$${Number(item.amount).toLocaleString()}`,
            type: "expense",
            status: "Completed"
        }))
    ].sort((a, b) => b.date - a.date).slice(0, 5);

    return (
        <section className="transactions-card">
            <div className="card-header">
                <h3>Recent Transactions</h3>
                <button className="view-all-btn">View All</button>
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
                            <span className={`status-tag ${item.status.toLowerCase()}`}>{item.status}</span>
                        </div>
                        <div className={`transaction-amount ${item.type}`}>
                            {item.amount}
                        </div>
                    </div>
                )) : (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No transactions found</p>
                )}
            </div>
        </section>
    );
}

export default RecentTransactions;
