
import React, { useEffect, useState, useRef } from 'react';
import '../components/Styles/IncomePageStyles/IncomePageStyle.css';
import IncomeTable from '../components/IncomePageComponents/IncomeTable';
import EditableStatCard from '../components/HomePageComponents/EditableStatCard';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTranslation } from 'react-i18next';

import { useFinancialData } from '../hooks/useFinancialData';

function IncomePage() {
    const { t } = useTranslation();
    const incomeTableRef = useRef();
    const { income } = useFinancialData(); // Get cached data
    const [projectedIncome, setProjectedIncome] = useState(0);

    // Calculate total from cached data
    const totalIncome = income.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const handleAddNewIncome = () => {
        if (incomeTableRef.current) {
            incomeTableRef.current.addNewRow();
        }
    };

    // fetchProjectedIncome remains purely local for now as it's a setting, not main data
    const fetchProjectedIncome = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setProjectedIncome(settingsSnap.data().projectedIncome ?? 0);
            }
        } catch (error) {
            console.error("Error fetching projected income:", error);
        }
    };

    const handleSaveProjectedIncome = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { projectedIncome: Number(newValue) }, { merge: true });
            setProjectedIncome(Number(newValue));
        } catch (error) {
            console.error("Error saving projected income:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchProjectedIncome(user);
            } else {
                setProjectedIncome(15000);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="income-page-root">

            {/* Unified High-Performance Loading Bar */}


            <div className="income-content-centered">
                <header className="income-header">
                    <h2>{t('income.title')}</h2>
                    <p>{t('income.intro')}</p>
                </header>

                <div className="income-stats-row">
                    <div className="stat-card">
                        <span className="label">{t('income.monthly_total')}</span>
                        <span className="amount">${totalIncome.toLocaleString()}</span>
                        <span className="trend-up">▲ {t('income.real_time')}</span>
                    </div>
                    <EditableStatCard
                        label={t('income.projected_revenue')}
                        value={projectedIncome}
                        trend={t('income.based_on_goals')}
                        onSave={handleSaveProjectedIncome}
                        color="var(--secondary)"
                    />
                    <div className="stat-card">
                        <span className="label">{t('income.growth_rate')}</span>
                        <span className="amount">0%</span>
                        <span className="trend">{t('income.your_comparison')}</span>
                    </div>
                </div>

                <div className="income-table-container">
                    <div className="table-header">
                        <h3>{t('income.transaction_history')}</h3>
                        <button className="add-btn-main" onClick={handleAddNewIncome}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t('income.add_source')}
                        </button>
                    </div>

                    <IncomeTable ref={incomeTableRef} />
                </div>
            </div>
        </div>
    );
}
export default IncomePage;