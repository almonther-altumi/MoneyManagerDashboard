import React, { useState, useEffect } from 'react';
import '../components/Styles/PagesStyle/ReportPageStyle.css';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
  Legend,
  Filler
);

function ReportsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    savingsRate: 0,
    incomeList: [],
    expenseList: [],
    monthlyIncome: {} // { Jan: 0, Feb: 0, ... }
  });

  const [sortOrder, setSortOrder] = useState('dateDesc');

  const generateReport = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsRefreshing(true);
    try {
      // جلب الدخل والمصروفات
      const [incomeSnap, expenseSnap] = await Promise.all([
        getDocs(query(collection(db, "users", user.uid, "income"), orderBy("date", "asc"))),
        getDocs(query(collection(db, "users", user.uid, "expenses"), orderBy("date", "asc")))
      ]);

      const rawIncome = incomeSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        amount: Number(doc.data().amount) || 0,
        type: 'Income',
        date: doc.data().date?.toDate()
      }));

      const rawExpense = expenseSnap.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        amount: Number(doc.data().amount) || 0,
        type: 'Expense',
        date: doc.data().date?.toDate()
      }));

      const incomeTotal = rawIncome.reduce((acc, item) => acc + item.amount, 0);
      const expenseTotal = rawExpense.reduce((acc, item) => acc + item.amount, 0);
      const net = incomeTotal - expenseTotal;
      const rate = incomeTotal > 0 ? (net / incomeTotal) * 100 : 0;

      // تجميع الدخل حسب الشهر
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthlyIncome = {};
      months.forEach(m => monthlyIncome[m] = 0);
      rawIncome.forEach(item => {
        if (item.date) {
          const monthName = months[item.date.getMonth()];
          monthlyIncome[monthName] += item.amount;
        }
      });

      setReportData({
        totalIncome: incomeTotal,
        totalExpenses: expenseTotal,
        netSavings: net,
        savingsRate: Math.round(rate),
        incomeList: rawIncome,
        expenseList: rawExpense,
        monthlyIncome
      });

    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const getSortedTransactions = () => {
    const allTransactions = [...reportData.incomeList, ...reportData.expenseList];

    switch (sortOrder) {
      case 'dateAsc':
        return allTransactions.sort((a,b) => a.date - b.date);
      case 'dateDesc':
        return allTransactions.sort((a,b) => b.date - a.date);
      case 'amountAsc':
        return allTransactions.sort((a,b) => a.amount - b.amount);
      case 'amountDesc':
        return allTransactions.sort((a,b) => b.amount - a.amount);
      default:
        return allTransactions;
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFontSize(22);
    doc.text("FISCAL SYNTHESIS STATEMENT", 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${timestamp}`, 14, 30);

    const summaryData = [
      ["Metric","Value"],
      ["Gross Liquidity (Income)", `$${reportData.totalIncome.toLocaleString()}`],
      ["Total Expenditure (Expenses)", `$${reportData.totalExpenses.toLocaleString()}`],
      ["Net Retained Capital", `$${reportData.netSavings.toLocaleString()}`],
      ["Capital Preservation Rate", `${reportData.savingsRate}%`]
    ];

    autoTable(doc,{
      startY: 40,
      head:[summaryData[0]],
      body: summaryData.slice(1),
      theme:'grid',
      headStyles:{ fillColor:[29,185,84] },
      styles:{ fontSize:10, cellPadding:5 }
    });

    // Transactions Table
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.text("Transaction Lifecycle Audit", 14, finalY);
    const sortedTransactions = getSortedTransactions().map(t => [
      t.date?.toLocaleDateString() || "N/A",
      t.title || "Untitled",
      t.category || "General",
      t.type,
      t.type === "Income" ? `+$${t.amount.toLocaleString()}` : `-$${t.amount.toLocaleString()}`
    ]);

    autoTable(doc,{
      startY: finalY+5,
      head:[["Date","Description","Category","Type","Amount"]],
      body: sortedTransactions,
      theme:'striped',
      headStyles:{ fillColor:[51,51,51] },
      styles:{ fontSize:9 }
    });

    doc.save(`Fiscal_Statement_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if(user) generateReport();
    });
    return () => unsubscribe();
  }, []);

  // إعداد بيانات المخطط من Firestore
  const chartData = React.useMemo(() => ({
    labels: Object.keys(reportData.monthlyIncome),
    datasets: [{
      label: "Monthly Income",
      data: Object.values(reportData.monthlyIncome),
      backgroundColor: '#237ece',
      borderRadius: 8,
      barThickness: 30
    }]
  }), [reportData.monthlyIncome]);

  return (
    <div className={`reports-page-root ${isRefreshing ? 'refresh-active' : ''}`}>
      <div className="unified-refresh-overlay">
        <div className="core-loader"></div>
      </div>

      <div className="status-label">Synthesizing Analytics</div>

      <div className="reports-content-centered content-blur">
        <header className="reports-header">
          <div className="header-text">
            <h2>Fiscal Synthesis</h2>
            <p>A comprehensive audit of your global capital lifecycle.</p>
          </div>

          <div className="reports-date-filter">
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="dateDesc">Date Descending</option>
              <option value="dateAsc">Date Ascending</option>
              <option value="amountAsc">Amount Ascending</option>
              <option value="amountDesc">Amount Descending</option>
            </select>
          </div>
        </header>

        <div className="reports-stats-row">
          <div className="stat-card">
            <span className="label">Gross Liquidity</span>
            <span className="amount income">${reportData.totalIncome.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="label">Total Expenditure</span>
            <span className="amount expense">${reportData.totalExpenses.toLocaleString()}</span>
          </div>
          <div className="stat-card">
            <span className="label">Net Retained Capital</span>
            <span className="amount balance">${reportData.netSavings.toLocaleString()}</span>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Capital Trajectory</h3>
            <div className="placeholder-chart">
              <Bar data={chartData} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Retention Efficiency</h3>
            <div className="metric-radial" style={{ textAlign:'center', marginTop:'40px' }}>
              <div style={{ fontSize:'64px', fontWeight:800, color:'var(--secondary)' }}>
                {reportData.savingsRate}%
              </div>
              <p style={{ color:'var(--text-muted)', fontWeight:600 }}>Capital Preservation Rate</p>
            </div>
            <div style={{ marginTop:'auto' }}>
              <button className="export-btn-luxury" style={{ width:'100%' }} onClick={downloadPDF}>
                Download Statement
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
