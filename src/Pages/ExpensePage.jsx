
import React, { useEffect, useState, useRef } from 'react';
import '../components/Styles/ExpensePageStyles/ExpensePageStyle.css';
import ExpenseTable from '../components/ExpensePageComponents/ExpenseTable';
import EditableStatCard from '../components/HomePageComponents/EditableStatCard';
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTranslation } from 'react-i18next';

import { useFinancialData } from '../contexts/FinancialContext';

function ExpensePage() {
    const { t } = useTranslation();
    const expenseTableRef = useRef();
    const { expenses } = useFinancialData();
    const [recurringBills, setRecurringBills] = useState(0);

    const totalExpenses = expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const handleAddNewExpense = () => {
        if (expenseTableRef.current) {
            expenseTableRef.current.addNewRow();
        }
    };

    // fetchRecurringBills remains local as it is settings data
    const fetchRecurringBills = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setRecurringBills(settingsSnap.data().recurringBills || 0);
            }
        } catch (error) {
            console.error("Error fetching recurring bills:", error);
        }
    };

    const handleSaveRecurringBills = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { recurringBills: Number(newValue) }, { merge: true });
            setRecurringBills(Number(newValue));
        } catch (error) {
            console.error("Error saving recurring bills:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchRecurringBills(user);
            } else {
                setRecurringBills(950);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="expense-page-root">

            {/* Unified High-Performance Loading Bar */}


            <div className="expense-content-centered">
                <header className="expense-header">
                    <h2>{t('expense.title')}</h2>
                    <p>{t('expense.intro')}</p>
                </header>

                <div className="expense-stats-row">
                    <div className="stat-card">
                        <span className="label">{t('expense.total_burn_rate')}</span>
                        <span className="amount">${totalExpenses.toLocaleString()}</span>
                        <span className="trend down">▼ {t('expense.optimized')}</span>
                    </div>
                    <EditableStatCard
                        label={t('expense.recurring_overheads')}
                        value={recurringBills}
                        trend={t('expense.fixed_infra')}
                        onSave={handleSaveRecurringBills}
                        color="var(--danger)"
                    />
                    <div className="stat-card">
                        <span className="label">{t('expense.efficiency')}</span>
                        <span className="amount">0%</span>
                        <span className="trend">{t('expense.budget_adherence')}</span>
                    </div>
                </div>

                <div className="expense-table-container">
                    <div className="table-header">
                        <h3>{t('expense.ledger_details')}</h3>
                        <button className="add-btn-expense" onClick={handleAddNewExpense}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t('expense.record_outflow')}
                        </button>
                    </div>

                    <ExpenseTable ref={expenseTableRef} />
                </div>
            </div>
        </div>
    );
}

export default ExpensePage;