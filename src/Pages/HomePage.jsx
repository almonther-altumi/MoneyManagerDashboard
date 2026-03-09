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
import { useNavigate } from 'react-router-dom';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isSubscribed = useSubscriptionStatus();

  // Access global context data
  const { income, expenses, debts, refreshData, isDemoMode, toggleDemoMode } = useFinancialData();

  const totalIncome = React.useMemo(
    () => income.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [income]
  );
  const totalExpenses = React.useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );
  const netBalance = totalIncome - totalExpenses;
  const activityCount = income.length + expenses.length;

  const formatCurrency = (amount) => {
    const absAmount = Math.abs(amount).toLocaleString();
    return amount < 0 ? `-$${absAmount}` : `$${absAmount}`;
  };

  const renderSubscriberLock = () => (
    <div className="subscriber-lock-overlay">
      <div className="subscriber-lock-card">
        <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
        <h5>{t('home.premium.locked_title')}</h5>
        <p>{t('home.premium.locked_body')}</p>
        <button
          className="subscriber-cta-btn premium-fire"
          onClick={() => navigate('/subscription')}
        >
          {t('home.premium.cta')}
        </button>
      </div>
    </div>
  );

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
            <div className="hint-title">
              <h1>{t('home.executive_overview')}</h1>
              <span
                className="hint hint-icon"
                data-hint={t('home.hints.executive_overview')}
                tabIndex="0"
              >
                ?
              </span>
            </div>
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

          <section className="subscriber-section dashboard-subscriber-section">
            <div className="subscriber-section-header">
              <div>
                <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                <div className="hint-title">
                  <h3>{t('home.premium.title')}</h3>
                  <span
                    className="hint hint-icon"
                    data-hint={t('home.hints.premium_hub')}
                    tabIndex="0"
                  >
                    ?
                  </span>
                </div>
                <p>{t('home.premium.subtitle')}</p>
              </div>
              {isSubscribed ? (
                <span className="premium-badge premium-fire">{t('subscription.active')}</span>
              ) : (
                <button
                  className="subscriber-cta-btn premium-fire"
                  onClick={() => navigate('/subscription')}
                >
                  {t('home.premium.cta')}
                </button>
              )}
            </div>

            <div className="subscriber-grid">
              <div className={`subscriber-card ${isSubscribed ? '' : 'is-locked'}`}>
                <div className="subscriber-card-header">
                  <div className="subscriber-card-title">
                    <span className="premium-badge premium-fire subscriber-mini">{t('subscription.badge')}</span>
                    <h4>{t('home.premium.cards.radar_title')}</h4>
                  </div>
                  <span className="subscriber-chip">{t('home.premium.labels.net')}</span>
                </div>
                <div className="subscriber-card-body">
                  <div className={`subscriber-value ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                    {(income.length + expenses.length) > 0 ? formatCurrency(netBalance) : '--'}
                  </div>
                  <div className="subscriber-meta">{t('home.premium.cards.radar_desc')}</div>
                </div>
                {!isSubscribed && renderSubscriberLock()}
              </div>

              <div className={`subscriber-card ${isSubscribed ? '' : 'is-locked'}`}>
                <div className="subscriber-card-header">
                  <div className="subscriber-card-title">
                    <span className="premium-badge premium-fire subscriber-mini">{t('subscription.badge')}</span>
                    <h4>{t('home.premium.cards.signals_title')}</h4>
                  </div>
                  <span className="subscriber-chip">{t('home.premium.labels.signals')}</span>
                </div>
                <div className="subscriber-card-body">
                  <div className="subscriber-value">{activityCount}</div>
                  <div className="subscriber-meta">{t('home.premium.cards.signals_desc')}</div>
                </div>
                {!isSubscribed && renderSubscriberLock()}
              </div>

              <div className={`subscriber-card ${isSubscribed ? '' : 'is-locked'}`}>
                <div className="subscriber-card-header">
                  <div className="subscriber-card-title">
                    <span className="premium-badge premium-fire subscriber-mini">{t('subscription.badge')}</span>
                    <h4>{t('home.premium.cards.queue_title')}</h4>
                  </div>
                  <span className="subscriber-chip">{t('home.premium.labels.queue')}</span>
                </div>
                <div className="subscriber-card-body">
                  <div className="subscriber-value">{debts.length}</div>
                  <div className="subscriber-meta">{t('home.premium.cards.queue_desc')}</div>
                </div>
                {!isSubscribed && renderSubscriberLock()}
              </div>
            </div>
          </section>
        </div>

        {/* Right Contextual Utilities */}
        <QuickActionBar />
      </div>
    </div>
  )
}

export default HomePage;
