import "../Styles/HomePageStyles/quickInfoStyle.css";
import { useTranslation } from "react-i18next";

// Icons
import Arrow_rise from '../Icons/Profit_Icons/DollarIcon';
import DishIcon from "../Icons/Profit_Icons/YearlyIncomeIcone";
import WalletIcon from '../Icons/Profit_Icons/walletIcon';
import BankIcon from '../Icons/Profit_Icons/bankIcon';

function QuickInfo({ data }) {
    const { t } = useTranslation();
    // Safe destructuring
    const { income = [], expenses = [] } = data || {};



    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // ---- Helper: normalize Firestore date ----
    const getDate = (item) => {
        if (!item) return null;

        // Adjust field name here if needed (date / createdAt / timestamp)
        const rawDate = item.date || item.createdAt || item.timestamp;
        if (!rawDate) return null;

        if (rawDate.toDate) return rawDate.toDate(); // Firestore Timestamp
        const parsed = new Date(rawDate);
        return isNaN(parsed) ? null : parsed;
    };

    // ---- Monthly Income ----
    const monthlyIncome = income.reduce((acc, item) => {
        const date = getDate(item);
        if (!date) return acc;

        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {
            return acc + Number(item.amount || 0);
        }
        return acc;
    }, 0);

    // ---- Yearly Income ----
    const yearlyIncome = income.reduce((acc, item) => {
        const date = getDate(item);
        if (!date) return acc;

        if (date.getFullYear() === currentYear) {
            return acc + Number(item.amount || 0);
        }
        return acc;
    }, 0);

    // ---- Yearly Expense ----
    const yearlyExpense = expenses.reduce((acc, item) => {
        const date = getDate(item);
        if (!date) return acc;

        if (date.getFullYear() === currentYear) {
            return acc + Number(item.amount || 0);
        }
        return acc;
    }, 0);

    // ---- Accurate Monthly Averages ----
    const uniqueIncomeMonths = new Set(
        income
            .map(i => {
                const d = getDate(i);
                return d ? `${d.getFullYear()}-${d.getMonth()}` : null;
            })
            .filter(Boolean)
    ).size || 1;

    const uniqueExpenseMonths = new Set(
        expenses
            .map(e => {
                const d = getDate(e);
                return d ? `${d.getFullYear()}-${d.getMonth()}` : null;
            })
            .filter(Boolean)
    ).size || 1;

    const avgMonthlyIncome = (yearlyIncome / uniqueIncomeMonths) || 0;
    const avgMonthlyExpense = (yearlyExpense / uniqueExpenseMonths) || 0;

    return (
        <section className="profit-section">

            <div className="summeryMoneyBox green">
                <Arrow_rise className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">
                        ${monthlyIncome.toLocaleString()}
                    </h2>
                    <p className="profit-description">{t('home.quick_info.income_this_month')}</p>
                </div>
            </div>

            <div className="summeryMoneyBox blue">
                <DishIcon className="profit-icon yearlyIncomeIcon" />
                <div className="profit-info">
                    <h2 className="profit-amount">
                        ${yearlyIncome.toLocaleString()}
                    </h2>
                    <p className="profit-description">{t('home.quick_info.yearly_income')}</p>
                </div>
            </div>

            <div className="summeryMoneyBox purple">
                <BankIcon className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">
                        ${Math.round(avgMonthlyExpense).toLocaleString()}
                    </h2>
                    <p className="profit-description">{t('home.quick_info.avg_monthly_expense')}</p>
                </div>
            </div>

            <div className="summeryMoneyBox red">
                <WalletIcon className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">
                        ${Math.round(avgMonthlyIncome).toLocaleString()}
                    </h2>
                    <p className="profit-description">{t('home.quick_info.avg_monthly_income')}</p>
                </div>
            </div>

        </section>
    );
}

export default QuickInfo;
