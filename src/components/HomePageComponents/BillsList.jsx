
import React from 'react';
import '../Styles/BillsListStyle.css';

function BillsList({ debts = [] }) {
    // Map debts to bill format
    const bills = debts.map(debt => ({
        id: debt.id,
        name: debt.name,
        amount: debt.remaining,
        dueDate: debt.nextPayment || 'Monthly',
        icon: '🛡️',
        isPaid: false
    })).slice(0, 5);

    return (
        <section className="bills-card">
            <div className="bills-header">
                <h3>Upcoming Payments</h3>
                <button className="add-bill-btn">+</button>
            </div>

            <ul className="bills-list">
                {bills.length > 0 ? bills.map(bill => (
                    <li key={bill.id} className={`bill-item ${bill.isPaid ? 'paid' : ''}`}>
                        <div className="checkbox-wrapper">
                            {bill.isPaid && <span className="checkmark">✔</span>}
                        </div>

                        <div className="bill-icon-box">
                            {bill.icon}
                        </div>

                        <div className="bill-info">
                            <h4 className="bill-name">{bill.name}</h4>
                            <span className="bill-date">{bill.dueDate}</span>
                        </div>

                        <div className="bill-amount">
                            ${Number(bill.amount).toLocaleString()}
                        </div>
                    </li>
                )) : (
                    <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No upcoming payments</p>
                )}
            </ul>
        </section>
    );
}

export default BillsList;
