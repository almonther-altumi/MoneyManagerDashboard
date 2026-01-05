
import React, { useEffect, useState, useRef } from 'react';
import '../components/Styles/PagesStyle/ExpensePageStyle.css';
import ExpenseTable from '../components/ExpensePageComponents/ExpenseTable';
import EditableStatCard from '../components/EditableStatCard';
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function ExpensePage() {
    const expenseTableRef = useRef();
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [recurringBills, setRecurringBills] = useState(950);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleAddNewExpense = () => {
        if (expenseTableRef.current) {
            expenseTableRef.current.addNewRow();
        }
    };

    const fetchTotalExpenses = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsRefreshing(true);
        try {
            const expenseRef = collection(db, "users", user.uid, 'expenses');
            const querySnapshot = await getDocs(expenseRef);
            const expenseData = querySnapshot.docs.map(doc => doc.data());
            const total = expenseData.reduce((acc, expense) => {
                return acc + (Number(expense.amount) || 0);
            }, 0);
            setTotalExpenses(total);
        } catch (error) {
            console.error("Error fetching total expenses:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    const fetchRecurringBills = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setRecurringBills(settingsSnap.data().recurringBills || 950);
            }
        } catch (error) {
            console.error("Error fetching recurring bills:", error);
        }
    };

    const handleSaveRecurringBills = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setIsRefreshing(true);
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { recurringBills: Number(newValue) }, { merge: true });
            setRecurringBills(Number(newValue));
        } catch (error) {
            console.error("Error saving recurring bills:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchTotalExpenses();
                fetchRecurringBills(user);
            } else {
                setTotalExpenses(0);
                setRecurringBills(950);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className={`expense-page-root ${isRefreshing ? 'refresh-active' : ''}`}>

            {/* Unified High-Performance Loading Bar */}
            <div className="unified-refresh-overlay">
                <div className="core-loader"></div>
            </div>
            <div className="status-label">Auditing Expenditure</div>

            <div className="expense-content-centered content-blur">
                <header className="expense-header">
                    <h2>Expenditure Control</h2>
                    <p>Monitor your cash outflows and monthly overheads</p>
                </header>

                <div className="expense-stats-row">
                    <div className="stat-card">
                        <span className="label">Total Burn Rate</span>
                        <span className="amount">${totalExpenses.toLocaleString()}</span>
                        <span className="trend down">▼ Optimized</span>
                    </div>
                    <EditableStatCard
                        label="Recurring Overheads"
                        value={recurringBills}
                        trend="Fixed infrastructure"
                        onSave={handleSaveRecurringBills}
                        color="var(--danger)"
                    />
                    <div className="stat-card">
                        <span className="label">Efficiency</span>
                        <span className="amount">94.2%</span>
                        <span className="trend">Budget Adherence</span>
                    </div>
                </div>

                <div className="expense-table-container">
                    <div className="table-header">
                        <h3>Ledger Details</h3>
                        <button className="add-btn-expense" onClick={handleAddNewExpense}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Record Outflow
                        </button>
                    </div>

                    <ExpenseTable ref={expenseTableRef} onDataChange={fetchTotalExpenses} />
                </div>
            </div>
        </div>
    );
}

export default ExpensePage;