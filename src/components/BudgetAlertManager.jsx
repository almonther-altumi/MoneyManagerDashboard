import React, { useEffect } from 'react';
import { useFinancialData } from '../hooks/useFinancialData';
import { useNotification } from '../hooks/useNotification';
import Notification from './Notification';
import { useTranslation } from 'react-i18next';

const BudgetAlertManager = () => {
    const { monthlySpent, budgetLimit } = useFinancialData();
    const { notification, showNotification, hideNotification } = useNotification();
    const { t } = useTranslation();

    useEffect(() => {
        if (!budgetLimit || budgetLimit <= 0) return;

        const usagePercent = (monthlySpent / budgetLimit) * 100;
        const currentMonth = new Date().getMonth();
        const year = new Date().getFullYear();
        const key = `budget_alert_${year}_${currentMonth}`;

        // Get stored notified levels for this month
        const stored = JSON.parse(localStorage.getItem(key) || '[]');

        let newLevel = 0;
        let message = "";

        if (usagePercent >= 100) {
            newLevel = 100;
            message = t('settings.notifications.budget_critical', { percent: 100 });
        } else if (usagePercent >= 80) {
            newLevel = 80;
            message = t('settings.notifications.budget_warning', { percent: 80 });
        } else if (usagePercent >= 50) {
            newLevel = 50;
            message = t('settings.notifications.budget_info', { percent: 50 });
        }

        if (newLevel > 0 && !stored.includes(newLevel)) {
            showNotification(message, newLevel >= 80 ? 'error' : 'success');
            const updated = [...stored, newLevel];
            localStorage.setItem(key, JSON.stringify(updated));
        }
    }, [monthlySpent, budgetLimit, t, showNotification]);

    return (
        <Notification
            show={notification.show}
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
        />
    );
};

export default BudgetAlertManager;
