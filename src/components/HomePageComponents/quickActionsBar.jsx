import "./RightBar/RightSidebar.css";
import DreamGoals from "./RightBar/DreamGoals";
import MonthlySpending from "./RightBar/MonthlySpending";
import CurrencyRates from "./RightBar/CurrencyRates";

function RightSidebar() {
  return (
    <aside className="right-sidebar">
      <DreamGoals />
      <MonthlySpending />
      <CurrencyRates />
    </aside>
  );
}

export default RightSidebar;
