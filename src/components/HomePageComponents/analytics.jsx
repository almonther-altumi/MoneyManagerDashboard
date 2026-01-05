
import { Line } from "react-chartjs-2"
import '../Styles/analyticsStyle.css'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  Tooltip,
  PointElement,
  Legend
);

function Analytics({ data }) {
  const { income = [], expenses = [] } = data || {};

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const incomeByMonth = new Array(12).fill(0);
  const expenseByMonth = new Array(12).fill(0);

  income.forEach(item => {
    const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const month = date.getMonth();
    if (month >= 0 && month < 12) {
      incomeByMonth[month] += (Number(item.amount) || 0);
    }
  });

  expenses.forEach(item => {
    const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
    const month = date.getMonth();
    if (month >= 0 && month < 12) {
      expenseByMonth[month] += (Number(item.amount) || 0);
    }
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Income',
        data: incomeByMonth,
        borderColor: '#1db954', // Green
        backgroundColor: '#1db954',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Expense',
        data: expenseByMonth,
        borderColor: '#ea4335', // Red
        backgroundColor: '#ea4335',
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          color: '#5f6368',
          font: { size: 12, family: 'Inter' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(32, 33, 36, 0.9)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: {
          color: '#f1f3f4',
          borderDash: [5, 5]
        },
        ticks: {
          color: '#9aa0a6',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#9aa0a6',
          font: { size: 11 }
        }
      }
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <section className="analytics-card">
      <div className="analytics-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Analytics Overview</h3>
      </div>

      <div className="chart-wrapper">
        <Line data={chartData} options={options} />
      </div>
    </section>
  )
}

export default Analytics;
