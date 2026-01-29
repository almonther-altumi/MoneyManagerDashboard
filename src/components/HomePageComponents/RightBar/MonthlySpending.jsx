
import './RightSidebar.css'
import React, { useState, useEffect } from 'react';
import { Pie } from "react-chartjs-2";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { db, auth } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, Legend);

function MonthlySpending() {
  const { t } = useTranslation();
  const [spent, setSpent] = useState(0);
  const [limit, setLimit] = useState(2000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempLimit, setTempLimit] = useState(2000);

  async function fetchMonthlySpent(user) {
    const now = new Date();


    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const expensesRef = collection(db, "users", user.uid, "expenses")
    const q = query(
      expensesRef,
      where("date", ">=", Timestamp.fromDate(startOfMonth)),
      where("date", "<", Timestamp.fromDate(endOfMonth))
    )
    const snapshot = await getDocs(q);
    let total = 0;
    snapshot.forEach((doc) => {
      total += Number(doc.data().amount || 0)
    })

    setSpent(total)

  }
  useEffect(() => {
    const fetchBudget = async (user) => {
      const budgetRef = doc(db, "users", user.uid, "settings", "budget");
      const budgetSnap = await getDoc(budgetRef);
      if (budgetSnap.exists()) {
        const data = budgetSnap.data();
        if (data.limit) {
          setLimit(data.limit);
          setTempLimit(data.limit);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchBudget(user);
        fetchMonthlySpent(user)
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const budgetRef = doc(db, "users", user.uid, "settings", "budget");
      await setDoc(budgetRef, { limit: Number(tempLimit) }, { merge: true });
      setLimit(Number(tempLimit));
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  const remaining = limit - spent;
  const isOverBudget = remaining < 0;

  const data = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        data: [spent, remaining > 0 ? remaining : 0],
        backgroundColor: [isOverBudget ? "var(--danger)" : "var(--secondary)", "var(--border-muted)"],
        borderWidth: 0,
        hoverOffset: 10
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        cornerRadius: 12,
        padding: 12,
        bodyFont: { family: 'Inter', weight: 'bold' }
      }
    },
  };

  return (
    <section className="card monthly-budget-card luxury-card">
      <div className="budget-header-box">
        <h3>{t('monthly_spending.title')}</h3>
        <button className="edit-trigger-icon" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '✕' : '✎'}
        </button>
      </div>

      <div className="pie-wrapper">
        <Pie data={data} options={options} />
        <div className="pie-center-label">
          <span className="percent">{limit > 0 ? Math.round((spent / limit) * 100) : 0}%</span>
          <span className="label">{t('monthly_spending.used')}</span> 
        </div>
      </div>

      <div className="budget-info-footer">
        {isEditing ? (
          <div className="budget-input-group">
            <input
              type="number"
              value={tempLimit}
              onChange={(e) => setTempLimit(e.target.value)}
              className="luxury-input"
              autoFocus
            />
            <button onClick={handleSave} className="luxury-save-btn">{t('monthly_spending.commit')}</button>
          </div>
        ) : (
          <div className="budget-stats-summary">
            <div className="stat">
              <span className="val">${spent.toLocaleString()}</span>
              <span className="lbl">{t('monthly_spending.spent')}</span>
            </div>
            <div className="divider"></div>
            <div className="stat">
              <span className="val">${limit.toLocaleString()}</span>
              <span className="lbl">{t('monthly_spending.limit')}</span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .monthly-budget-card {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .budget-header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .edit-trigger-icon {
            display:flex;
            justify-content: center;
            align-items : center;
            background: var(--highlight);
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 10px;
            cursor: pointer;
            color: var(--text-muted);
            transition: all 0.2s;
        }

        .edit-trigger-icon:hover {
            background: var(--secondary);
            color: white;
        }

        .pie-wrapper {
            position: relative;
            height: 180px;
        }

        .pie-center-label {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .pie-center-label .percent {
            font-size: 28px;
            font-weight: 800;
            color: var(--text);
            letter-spacing: -1px;
        }

        .pie-center-label .label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: var(--text-muted);
            letter-spacing: 1px;
        }

        .budget-stats-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 16px;
            border-top: 1px solid var(--border-muted);
        }

        .budget-stats-summary .stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        .budget-stats-summary .val {
            font-size: 16px;
            font-weight: 800;
            color: var(--text);
        }

        .budget-stats-summary .lbl {
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
        }

        .budget-input-group {
            display: flex;
            gap: 12px;
            width: 100%;
        }

        .luxury-input {
            flex: 1;
            background: var(--bg-dark);
            border: 1px solid var(--border-muted);
            color: var(--text);
            padding: 10px;
            width:15px;
            border-radius: 12px;
            font-weight: 700;
            outline: none;
        }

        .luxury-save-btn {
            background: var(--secondary);
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 12px;
            font-weight: 800;
            cursor: pointer;
        }
      `}</style>
    </section>
  );
}

export default MonthlySpending;
