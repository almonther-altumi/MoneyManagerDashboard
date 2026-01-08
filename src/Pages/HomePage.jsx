
import React, { useState, useEffect } from 'react';
import '../components/Styles/HomePageStyle.css';

import QuickInfo from '../components/HomePageComponents/quickInfo';
import Analytics from '../components/HomePageComponents/analytics';
import QuickActionBar from '../components/HomePageComponents/quickActionsBar';
import RecentTransactions from '../components/HomePageComponents/RecentTransactions';
import MyCards from '../components/HomePageComponents/MyCards';
import UpcomingPayments from '../components/HomePageComponents/UpcomingPayments';

import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Import all required sub-component styles
import '../components/Styles/MyCardsStyle.css';
import '../components/Styles/quickInfoStyle.css';
import '../components/HomePageComponents/RightBar/RightSidebar.css';
import Notification from '../components/Notification';

const HomePage = () => {
  function internetChecker()
  {
    if(window.onoffline)
      {
        Notification("now" ,);
      }    
  }
  internetChecker()
  const [financialData, setFinancialData] = useState({
    income: [],
    expenses: [],
    debts: []
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const [incomeSnap, expenseSnap, debtSnap] = await Promise.all([
        getDocs(collection(db, "users", user.uid, "income")),
        getDocs(collection(db, "users", user.uid, "expenses")),
        getDocs(collection(db, "users", user.uid, "debts"))
      ]);

      const income = incomeSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const expenses = expenseSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      const debts = debtSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      setFinancialData({ income, expenses, debts });
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchData();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={`home-page-root ${isRefreshing ? 'refresh-active' : ''}`}>

      {/* Unified High-Performance Loading Bar */}
      <div className="unified-refresh-overlay">
        <div className="core-loader"></div>
      </div>
      <div className="status-label">Synchronizing Core</div>

      <div className="home-layout-wrapper">
        {/* Main Dashboard Workspace */}
        <div className="dashboard-content content-blur">
          <header className="dashboard-intro">
            <h1>Executive Overview</h1>
            <p>Global financial state and liquidity analytics.</p>
          </header>

          {/* Top Level Quick Metrics */}
          <div className="metrics-container">
            <QuickInfo data={financialData} />
          </div>

          <div className="main-dashboard-grid">
            {/* Primary Analytical Workspace */}
            <div className="dashboard-primary-column">
              <Analytics data={financialData} />
              <RecentTransactions income={financialData.income} expenses={financialData.expenses} />
            </div>

            {/* Secure Details & Obligations */}
            <div className="dashboard-secondary-column">
              <MyCards />
              <UpcomingPayments debts={financialData.debts} onDataChange={fetchData} />
            </div>
          </div>
        </div>

        {/* Right Contextual Utilities */}
        <QuickActionBar />
      </div>
    </div>
  )
}

export default HomePage;