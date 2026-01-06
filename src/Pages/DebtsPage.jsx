import React, { useEffect, useState, useRef } from 'react';
import '../components/Styles/PagesStyle/DebtsPageStyle.css';
import DebtsTable from '../components/DebtsPageComponents/DebtsTable';
import EditableStatCard from '../components/EditableStatCard';
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function DebtsPage() {
    const debtsTableRef = useRef();
    const [debtStats, setDebtStats] = useState({
        totalRemaining: 0,
        totalPaid: 0,
        overallProgress: 0
    });
    const [monthlyRepayment, setMonthlyRepayment] = useState(2400);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // إضافة دين جديد عبر الجدول
    const handleAddNewDebt = () => {
        if (debtsTableRef.current) {
            debtsTableRef.current.addNewRow();
        }
    };

    // جلب احصاءات الديون
    const fetchDebtStats = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsRefreshing(true);
        try {
            const debtsRef = collection(db, "users", user.uid, 'debts');
            const querySnapshot = await getDocs(debtsRef);
            const debtsData = querySnapshot.docs.map(doc => doc.data());

            let totalRemaining = 0;
            let totalPaid = 0;
            let totalInitial = 0;

            debtsData.forEach(debt => {
                totalRemaining += Number(debt.remaining) || 0;
                totalInitial += Number(debt.amount) || 0;
            });

            totalPaid = totalInitial - totalRemaining;
            const overallProgress = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;

            setDebtStats({
                totalRemaining,
                totalPaid,
                overallProgress: Math.round(overallProgress)
            });
        } catch (error) {
            console.error("Error fetching debt stats:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    // جلب مبلغ السداد الشهري
    const fetchRepaymentAmount = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setMonthlyRepayment(settingsSnap.data().monthlyRepayment || 2400);
            }
        } catch (error) {
            console.error("Error fetching repayment amount:", error);
        }
    };

    // حفظ مبلغ السداد الشهري
    const handleSaveRepayment = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setIsRefreshing(true);
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { monthlyRepayment: Number(newValue) }, { merge: true });
            setMonthlyRepayment(Number(newValue));
        } catch (error) {
            console.error("Error saving repayment amount:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchDebtStats();
                fetchRepaymentAmount(user);
            } else {
                setDebtStats({ totalRemaining: 0, totalPaid: 0, overallProgress: 0 });
                setMonthlyRepayment(2400);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className={`debts-page-root ${isRefreshing ? 'refresh-active' : ''}`}>

            {/* Overlay loading */}
            <div className="unified-refresh-overlay">
                <div className="core-loader"></div>
            </div>
            <div className="status-label">Evaluating Obligations</div>

            <div className="debts-content-centered content-blur">
                <header className="debts-header">
                    <h2>Debt Management</h2>
                    <p>Strategic oversight of liabilities and repayment progress</p>
                </header>

                <div className="debts-stats-row">
                    <div className="stat-card">
                        <span className="label">Total Liabilities</span>
                        <span className="amount">${debtStats.totalRemaining.toLocaleString()}</span>
                        <span className="trend">Remaining Balance</span>
                    </div>
                    <EditableStatCard
                        label="Monthly Strategy"
                        value={monthlyRepayment}
                        trend="Settlement Target"
                        onSave={handleSaveRepayment}
                        color="var(--secondary)"
                    />
                    <div className="stat-card">
                        <span className="label">Settled Assets</span>
                        <span className="amount">{debtStats.overallProgress}%</span>
                        <div className="progress-bar-mini">
                            <div className="progress-fill" style={{ width: `${debtStats.overallProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* الجدول */}
                <div className="debts-table-container">
                    <div className="table-header">
                        <h3>Portfolio Ledger</h3>
                        <button className="add-btn-debt" onClick={handleAddNewDebt}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Register Liability
                        </button>
                    </div>

                    {/* تمرير ref لدعم إضافة صف جديد مباشرة */}
                    <DebtsTable ref={debtsTableRef} onDataChange={fetchDebtStats} />
                </div>
            </div>
        </div>
    );
}

export default DebtsPage;
