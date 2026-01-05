
import "../Styles/quickInfoStyle.css";
// icons 
import Arrow_rise from '../Icons/Profit_Icons/DollarIcon'
import DishIcon from "../Icons/Profit_Icons/YearlyIncomeIcone";
import WalletIcon from '../Icons/Profit_Icons/walletIcon'
import BankIcon from '../Icons/Profit_Icons/bankIcon'

function QuickInfo({ data }) {
    const { income = [], expenses = [] } = data || {};

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate monthly income
    const monthlyIncome = income.reduce((acc, curr) => {
        const date = curr.date?.toDate ? curr.date.toDate() : new Date(curr.date);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            return acc + (Number(curr.amount) || 0);
        }
        return acc;
    }, 0);

    // Calculate yearly income
    const yearlyIncome = income.reduce((acc, curr) => {
        const date = curr.date?.toDate ? curr.date.toDate() : new Date(curr.date);
        if (date.getFullYear() === currentYear) {
            return acc + (Number(curr.amount) || 0);
        }
        return acc;
    }, 0);

    // Calculate average income
    const avgIncome = income.length > 0 ? (yearlyIncome / (currentMonth + 1)) : 0;

    // Calculate average expense
    const yearlyExpense = expenses.reduce((acc, curr) => {
        const date = curr.date?.toDate ? curr.date.toDate() : new Date(curr.date);
        if (date.getFullYear() === currentYear) {
            return acc + (Number(curr.amount) || 0);
        }
        return acc;
    }, 0);
    const avgExpense = expenses.length > 0 ? (yearlyExpense / (currentMonth + 1)) : 0;

    return (
        <section className="profit-section">
            <div className="summeryMoneyBox green">
                <Arrow_rise className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">${monthlyIncome.toLocaleString()}</h2>
                    <p className="profit-description"> Income In Month</p>
                </div>
            </div>
            <div className="summeryMoneyBox blue">
                <DishIcon className="profit-icon yearlyIncomeIcon" />
                <div className="profit-info">
                    <h2 className="profit-amount">${yearlyIncome.toLocaleString()}</h2>
                    <p className="profit-description">Yearly Income</p>
                </div>
            </div>

            <div className="summeryMoneyBox purple">
                <BankIcon className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">${Math.round(avgExpense).toLocaleString()}</h2>
                    <p className="profit-description">Avg. Monthly Expense</p>
                </div>
            </div>

            <div className="summeryMoneyBox red">
                <WalletIcon className="profit-icon" />
                <div className="profit-info">
                    <h2 className="profit-amount">${Math.round(avgIncome).toLocaleString()}</h2>
                    <p className="profit-description">Avg. Monthly Income</p>
                </div>
            </div>
        </section>
    )
}
export default QuickInfo;