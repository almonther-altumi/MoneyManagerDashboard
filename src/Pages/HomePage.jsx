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
import { useFinancialData } from '../hooks/useFinancialData';

const HomePage = () => {
  const { t } = useTranslation();

  // Access global context data
  const { income, expenses, debts, refreshData, isDemoMode, toggleDemoMode } = useFinancialData();

  // Check if account is actually empty (no real data)
  const isEmptyAccount = income.length === 0 && expenses.length === 0 && debts.length === 0 && !isDemoMode;

  // Construct data object for children
  const financialData = {
    income,
    expenses,
    debts
  };

  return (
    <div className="home-page-root">
      {isEmptyAccount && (
        <div className="welcome-demo-banner">
          <div className="banner-content">
            <div className="text-side">
              <h2>{t('home.welcome_title') || 'Welcome!'}</h2>
              <p>{t('home.empty_dashboard_hint') || 'Your dashboard is empty. Want to see how it looks with some sample data?'}</p>
            </div>
            <button className="demo-btn" onClick={() => toggleDemoMode(true)}>
              {t('home.try_demo') || 'Try Demo Mode'}
            </button>
          </div>
        </div>
      )}

      {isDemoMode && (
        <div className="demo-mode-active-bar">
          <p>{t('home.demo_mode_notice') || 'Viewing sample data. Your actual records are safe.'}</p>
          <button className="exit-demo-btn" onClick={() => toggleDemoMode(false)}>
            {t('home.exit_demo') || 'Exit Demo'}
          </button>
        </div>
      )}

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