import React from 'react';
import '../components/Styles/HomePageStyles/HomePageStyle.css';
import QuickInfo from '../components/HomePageComponents/quickInfo';
import Analytics from '../components/HomePageComponents/analytics';
import QuickActionBar from '../components/HomePageComponents/quickActionsBar';
import RecentTransactions from '../components/HomePageComponents/RecentTransactions';
import MyCards from '../components/HomePageComponents/MyCards';
import UpcomingPayments from '../components/HomePageComponents/UpcomingPayments';

// Import all required sub-component styles
import '../components/Styles/HomePageStyles/MyCardsStyle.css';
import '../components/Styles/HomePageStyles/quickInfoStyle.css';
import '../components/HomePageComponents/RightBar/RightSidebar.css';
import Notification from '../components/Notification';

import { useTranslation } from "react-i18next";
import { useFinancialData } from '../contexts/FinancialContext';

const HomePage = () => {
  const { t } = useTranslation();

  // Access global context data
  const { income, expenses, debts, refreshData } = useFinancialData();

  // Construct data object for children
  const financialData = {
    income,
    expenses,
    debts
  };

  function internetChecker() {
    if (window.onoffline) {
      Notification("now",);
    }
  }
  internetChecker();

  return (
    <div className="home-page-root">



      <div className="home-layout-wrapper">
        <dialog>
        <p>Are You Sure You Want To Delete This Debt ?</p>
        <form method='dialog'>
          <button>OK</button>
        </form>
      </dialog>
        {/* Main Dashboard Workspace */}
        <div className="dashboard-content">
          <header className="dashboard-intro">
            <h1>{t('home.executive_overview')}</h1>
            <p>{t('home.global_financial_state')}</p>
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
              <UpcomingPayments debts={financialData.debts} onDataChange={refreshData} />
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