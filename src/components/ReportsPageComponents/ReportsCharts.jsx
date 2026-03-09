
import React, { useMemo, useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function ReportsCharts({ data }) {
    const { income = [], expenses = [] } = data || {};

    const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark-mode'));

    useEffect(() => {
        const handleThemeChange = () => {
            setIsDarkMode(document.body.classList.contains('dark-mode'));
        };

        window.addEventListener('theme_update', handleThemeChange);
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleThemeChange);

        return () => {
            window.removeEventListener('theme_update', handleThemeChange);
            mediaQuery.removeEventListener('change', handleThemeChange);
        };
    }, []);

    // Get CSS variables for colors
    const rootStyles = getComputedStyle(document.documentElement);
    const successColor = rootStyles.getPropertyValue('--success').trim();
    const dangerColor = rootStyles.getPropertyValue('--danger').trim();
    const chartGrid = rootStyles.getPropertyValue('--chart-grid').trim();
    const chartTooltipBg = rootStyles.getPropertyValue('--chart-tooltip-bg').trim();
    const chartTooltipText = rootStyles.getPropertyValue('--chart-tooltip-text').trim();
    const primaryColor = rootStyles.getPropertyValue('--primary').trim();
    const secondaryColor = rootStyles.getPropertyValue('--secondary').trim();
    const warningColor = rootStyles.getPropertyValue('--warning').trim();
    const infoColor = rootStyles.getPropertyValue('--info').trim();

    // Grouping data by month (Jan-Dec)
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const incomeByMonth = useMemo(() => {
        const arr = new Array(12).fill(0);
        income.forEach(item => {
            const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
            const month = date.getMonth();
            if (month >= 0 && month < 12) {
                arr[month] += (Number(item.amount) || 0);
            }
        });
        return arr;
    }, [income]);

    const expenseByMonth = useMemo(() => {
        const arr = new Array(12).fill(0);
        expenses.forEach(item => {
            const date = item.date?.toDate ? item.date.toDate() : new Date(item.date);
            const month = date.getMonth();
            if (month >= 0 && month < 12) {
                arr[month] += (Number(item.amount) || 0);
            }
        });
        return arr;
    }, [expenses]);

    // Grouping expenses by category
    const categoryTotals = useMemo(() => {
        const totals = {};
        expenses.forEach(item => {
            const cat = item.category || 'Other';
            totals[cat] = (totals[cat] || 0) + (Number(item.amount) || 0);
        });
        return totals;
    }, [expenses]);

    const categoryLabels = Object.keys(categoryTotals);
    const categoryValues = Object.values(categoryTotals);

    // Bar Chart Data (Income vs Expense)
    const barData = useMemo(() => ({
        labels: monthLabels,
        datasets: [
            {
                label: 'Income',
                data: incomeByMonth,
                backgroundColor: successColor,
                borderRadius: 4,
            },
            {
                label: 'Expense',
                data: expenseByMonth,
                backgroundColor: dangerColor,
                borderRadius: 4,
            },
        ],
    }), [incomeByMonth, expenseByMonth, successColor, dangerColor]);

    const barOptions = useMemo(() => ({
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, family: 'Inter' },
                    color: isDarkMode ? chartTooltipText : rootStyles.getPropertyValue('--text').trim()
                }
            },
            tooltip: {
                backgroundColor: chartTooltipBg,
                titleColor: chartTooltipText,
                bodyColor: chartTooltipText,
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: chartGrid },
                ticks: { color: isDarkMode ? chartTooltipText : rootStyles.getPropertyValue('--text').trim() }
            },
            x: {
                grid: { display: false },
                ticks: { color: isDarkMode ? chartTooltipText : rootStyles.getPropertyValue('--text').trim() }
            }
        }
    }), [isDarkMode, chartGrid, chartTooltipBg, chartTooltipText, rootStyles]);

    // Doughnut Chart Data (Expense Categories)
    const doughnutData = useMemo(() => ({
        labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
        datasets: [
            {
                label: 'Expenses by Category',
                data: categoryValues.length > 0 ? categoryValues : [1],
                backgroundColor: [
                    primaryColor,
                    dangerColor,
                    warningColor,
                    successColor,
                    secondaryColor,
                    infoColor,
                ],
                borderWidth: 0,
                hoverOffset: 15
            },
        ],
    }), [categoryLabels, categoryValues, primaryColor, dangerColor, warningColor, successColor, secondaryColor, infoColor]);

    const doughnutOptions = useMemo(() => ({
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    color: isDarkMode ? chartTooltipText : rootStyles.getPropertyValue('--text').trim()
                }
            },
            tooltip: {
                backgroundColor: chartTooltipBg,
                titleColor: chartTooltipText,
                bodyColor: chartTooltipText,
                padding: 12,
                cornerRadius: 8
            }
        }
    }), [isDarkMode, chartTooltipBg, chartTooltipText, rootStyles]);

    return (
        <div className="charts-grid">
            <div className="chart-card">
                <h3>Income vs Expense (Monthly)</h3>
                <div style={{ width: '100%', minHeight: '300px' }}>
                    <Bar options={barOptions} data={barData} />
                </div>
            </div>
            <div className="chart-card">
                <h3>Expense Distribution</h3>
                <div style={{ width: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '280px' }}>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportsCharts;
