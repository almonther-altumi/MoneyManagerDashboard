import { Line } from "react-chartjs-2";
import { useMemo, useEffect, useState } from "react";
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
  const [themeKey, setThemeKey] = useState(0);

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    const handleTheme = () => setThemeKey((prev) => prev + 1);
    window.addEventListener('theme_update', handleTheme);
    window.addEventListener('storage', handleTheme);
    return () => {
      window.removeEventListener('theme_update', handleTheme);
      window.removeEventListener('storage', handleTheme);
    };
  }, []);

  const chartTheme = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        line1: '#5b61f6',
        line2: '#7a84f7',
        fill1Start: 'rgba(91, 97, 246, 0.35)',
        fill1End: 'rgba(91, 97, 246, 0.02)',
        fill2Start: 'rgba(122, 132, 247, 0.25)',
        fill2End: 'rgba(122, 132, 247, 0.02)',
        grid: 'rgba(148, 163, 184, 0.35)',
        axis: '#6b7280',
        tooltipBg: 'rgba(15, 23, 42, 0.9)',
        tooltipText: '#f8fafc'
      };
    }

    const styles = getComputedStyle(document.documentElement);
    const get = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

    return {
      line1: get('--chart-line-1', '#5b61f6'),
      line2: get('--chart-line-2', '#7a84f7'),
      fill1Start: get('--chart-fill-1-start', 'rgba(91, 97, 246, 0.35)'),
      fill1End: get('--chart-fill-1-end', 'rgba(91, 97, 246, 0.02)'),
      fill2Start: get('--chart-fill-2-start', 'rgba(122, 132, 247, 0.25)'),
      fill2End: get('--chart-fill-2-end', 'rgba(122, 132, 247, 0.02)'),
      grid: get('--chart-grid', 'rgba(148, 163, 184, 0.35)'),
      axis: get('--chart-axis', '#6b7280'),
      tooltipBg: get('--chart-tooltip-bg', 'rgba(15, 23, 42, 0.9)'),
      tooltipText: get('--chart-tooltip-text', '#f8fafc')
    };
  }, [themeKey]);

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
          borderColor: chartTheme.line1,
          borderWidth: 3,
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHitRadius: 14,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return chartTheme.fill1Start;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, chartTheme.fill1Start);
            gradient.addColorStop(1, chartTheme.fill1End);
            return gradient;
          }
        },
        {
          label: t('home.analytics.expense'),
          data: expenseByMonth,
          borderColor: chartTheme.line2,
          borderWidth: 2.5,
          fill: true,
          tension: 0.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHitRadius: 12,
          borderCapStyle: 'round',
          borderJoinStyle: 'round',
          backgroundColor: (context) => {
            const { chart } = context;
            const { ctx, chartArea } = chart;
            if (!chartArea) return chartTheme.fill2Start;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, chartTheme.fill2Start);
            gradient.addColorStop(1, chartTheme.fill2End);
            return gradient;
          }
        }
      ]
    };
  }, [income, expenses, t, chartTheme]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        cornerRadius: 10,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: {
          color: chartTheme.grid,
          drawBorder: false
        },
        ticks: {
          font: { size: 11, weight: 500 },
          color: chartTheme.axis,
          padding: 6
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, weight: 500 },
          color: chartTheme.axis
        }
      }
    },
    elements: {
      line: {
        tension: 0.5
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
