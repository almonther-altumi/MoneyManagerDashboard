
import React from 'react';
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

    // Grouping data by month (Jan-Dec)
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

    // Grouping expenses by category
    const categoryTotals = {};
    expenses.forEach(item => {
        const cat = item.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(item.amount) || 0);
    });

    const categoryLabels = Object.keys(categoryTotals);
    const categoryValues = Object.values(categoryTotals);

    // Bar Chart Data (Income vs Expense)
    const barData = {
        labels: monthLabels,
        datasets: [
            {
                label: 'Income',
                data: incomeByMonth,
                backgroundColor: '#1db954', // Spotify Green / Modern Green
                borderRadius: 4,
            },
            {
                label: 'Expense',
                data: expenseByMonth,
                backgroundColor: '#ef4444', // Red
                borderRadius: 4,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, family: 'Inter' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: 12,
                cornerRadius: 8
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Doughnut Chart Data (Expense Categories)
    const doughnutData = {
        labels: categoryLabels.length > 0 ? categoryLabels : ['No Data'],
        datasets: [
            {
                label: 'Expenses by Category',
                data: categoryValues.length > 0 ? categoryValues : [1],
                backgroundColor: [
                    '#4285f4', // Blue
                    '#d93025', // Red
                    '#f9ab00', // Yellow
                    '#34a853', // Green
                    '#8e24aa', // Purple
                    '#00acc1', // Cyan
                ],
                borderWidth: 0,
                hoverOffset: 15
            },
        ],
    };

    const doughnutOptions = {
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20
                }
            }
        }
    };

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
