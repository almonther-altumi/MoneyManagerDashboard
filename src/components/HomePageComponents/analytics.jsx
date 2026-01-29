import { Line } from "react-chartjs-2";
import { useMemo } from "react";
import { auth } from '../../firebase';
import '../Styles/HomePageStyles/analyticsStyle.css';
import { useTranslation } from "react-i18next";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

function Analytics({ data }) {
  const { t } = useTranslation();
  const { income = [], expenses = [] } = data || {};

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartData = useMemo(() => {
    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);

    income.forEach(item => {
      const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
      incomeByMonth[date.getMonth()] += Number(item.amount) || 0;
    });

    expenses.forEach(item => {
      const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
      expenseByMonth[date.getMonth()] += Number(item.amount) || 0;
    });

    return {
      labels,
      datasets: [
        {
          label: t('home.analytics.income'),
          data: incomeByMonth,
          borderColor: "#1d7db9",
          fill: true,
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 6,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(29,151,185,0.4)");
            gradient.addColorStop(1, "rgba(29,151,185,0.05)");
            return gradient;
          }
        },
        {
          label: t('home.analytics.expense'),
          data: expenseByMonth,
          borderColor: "#ea4335",
          fill: true,
          tension: 0.45,
          pointRadius: 3,
          pointHoverRadius: 6,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, "rgba(234,67,53,0.4)");
            gradient.addColorStop(1, "rgba(234,67,53,0.05)");
            return gradient;
          }
        }
      ]
    };
  }, [income, expenses, t]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: 'rgba(32,33,36,0.9)',
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        grid: { color: '#f1f3f4' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  return (
    <section className="analytics-card">
      <h3>{t('home.analytics.title')}</h3>
      {



        <div className="chart-wrapper">

          {data != null ?
            <Line
              key={`${income.length}-${expenses.length}`}
              data={chartData}
              options={options}
            />
            :
            <h2 className="error-fetching-data-message">{auth.currentUser ? t('home.analytics.error_fetching') : t('home.analytics.need_login')}</h2>

          }
        </div>



      }

    </section>
  );
}

export default Analytics;
