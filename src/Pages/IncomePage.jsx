
import React, { useEffect, useState, useRef } from 'react';
import '../components/Styles/PagesStyle/IncomePageStyle.css';
import IncomeTable from '../components/IncomePageComponents/IncomeTable';
import EditableStatCard from '../components/EditableStatCard';
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function IncomePage() {
    const incomeTableRef = useRef();
    const [totalIncome, setTotalIncome] = useState(0);
    const [projectedIncome, setProjectedIncome] = useState(15000);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleAddNewIncome = () => {
        if (incomeTableRef.current) {
            incomeTableRef.current.addNewRow();
        }
    };

    async function fetchTotalIncome() {
        const user = auth.currentUser;
        if (!user) return 0;

        setIsRefreshing(true);
        try {
            const incomeRef = collection(db, "users", user.uid, 'income');
            const querySnapshot = await getDocs(incomeRef);
            const incomeData = querySnapshot.docs.map(doc => doc.data());
            const total = incomeData.reduce((acc, income) => {
                return acc + (Number(income.amount) || 0);
            }, 0);
            return total;
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    }

    const fetchProjectedIncome = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setProjectedIncome(settingsSnap.data().projectedIncome || 15000);
            }
        } catch (error) {
            console.error("Error fetching projected income:", error);
        }
    };

    const handleSaveProjectedIncome = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setIsRefreshing(true);
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { projectedIncome: Number(newValue) }, { merge: true });
            setProjectedIncome(Number(newValue));
        } catch (error) {
            console.error("Error saving projected income:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchTotalIncome().then((income) => setTotalIncome(income));
                fetchProjectedIncome(user);
            } else {
                setTotalIncome(0);
                setProjectedIncome(15000);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className={`income-page-root ${isRefreshing ? 'refresh-active' : ''}`}>

            {/* Unified High-Performance Loading Bar */}
            <div className="unified-refresh-overlay">
                <div className="core-loader"></div>
            </div>
            <div className="status-label">Analyzing Liquidity</div>

            <div className="income-content-centered content-blur">
                <header className="income-header">
                    <h2>Income Streams</h2>
                    <p>Track your revenue sources and financial intake</p>
                </header>

                <div className="income-stats-row">
                    <div className="stat-card">
                        <span className="label">Monthly Total</span>
                        <span className="amount">${totalIncome.toLocaleString()}</span>
                        <span className="trend-up">▲ Real-time</span>
                    </div>
                    <EditableStatCard
                        label="Projected Revenue"
                        value={projectedIncome}
                        trend="Based on quarterly goals"
                        onSave={handleSaveProjectedIncome}
                        color="var(--secondary)"
                    />
                    <div className="stat-card">
                        <span className="label">Growth Rate</span>
                        <span className="amount">14.8%</span>
                        <span className="trend">Your Comparison</span>
                    </div>
                </div>

                <div className="income-table-container">
                    <div className="table-header">
                        <h3>Transaction History</h3>
                        <button className="add-btn-main" onClick={handleAddNewIncome}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Add Source
                        </button>
                    </div>

                    <IncomeTable ref={incomeTableRef} onDataChange={() => fetchTotalIncome().then(income => setTotalIncome(income))} />
                </div>
            </div>
        </div>
    );
}
export default IncomePage;