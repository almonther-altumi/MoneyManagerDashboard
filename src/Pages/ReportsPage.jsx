

import React, { useState, useEffect } from 'react';
import '../components/Styles/PagesStyle/ReportPageStyle.css';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function ReportsPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [reportData, setReportData] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingsRate: 0,
        incomeList: [],
        expenseList: []
    });

    const generateReport = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsRefreshing(true);
        try {
            const [incomeSnap, expenseSnap] = await Promise.all([
                getDocs(collection(db, "users", user.uid, "income")),
                getDocs(collection(db, "users", user.uid, "expenses"))
            ]);

            const rawIncome = incomeSnap.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                amount: Number(doc.data().amount) || 0,
                type: 'Income'
            }));

            const rawExpense = expenseSnap.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
                amount: Number(doc.data().amount) || 0,
                type: 'Expense'
            }));

            const incomeTotal = rawIncome.reduce((acc, item) => acc + item.amount, 0);
            const expenseTotal = rawExpense.reduce((acc, item) => acc + item.amount, 0);
            const net = incomeTotal - expenseTotal;
            const rate = incomeTotal > 0 ? (net / incomeTotal) * 100 : 0;

            setReportData({
                totalIncome: incomeTotal,
                totalExpenses: expenseTotal,
                netSavings: net,
                savingsRate: Math.round(rate),
                incomeList: rawIncome,
                expenseList: rawExpense
            });
        } catch (error) {
            console.error("Error generating report:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 800);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Header Styling
        doc.setFontSize(22);
        doc.setTextColor(26, 31, 44); // var(--text) equivalent
        doc.text("FISCAL SYNTHESIS STATEMENT", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(112, 117, 122); // var(--text-muted)
        doc.text(`Generated on: ${timestamp}`, 14, 30);
        doc.text("MoneyManager Executive Intelligence Bundle", 14, 35);

        // Summary Section
        doc.setFontSize(14);
        doc.setTextColor(26, 31, 44);
        doc.text("Performance Metrics", 14, 50);

        const summaryData = [
            ["Metric", "Value"],
            ["Gross Liquidity (Income)", `$${reportData.totalIncome.toLocaleString()}`],
            ["Total Expenditure (Expenses)", `$${reportData.totalExpenses.toLocaleString()}`],
            ["Net Retained Capital", `$${reportData.netSavings.toLocaleString()}`],
            ["Capital Preservation Rate", `${reportData.savingsRate}%`]
        ];
        autoTable(doc , {
            startY: 55,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'grid',
            headStyles: { fillStyle: 'var(--secondary)', fillColor: [29, 185, 84] }, // Green
            styles: { fontSize: 10, cellPadding: 5 }
        });

        // Transactions Section
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.text("Transaction Lifecycle Audit", 14, finalY);

        const allTransactions = [...reportData.incomeList, ...reportData.expenseList]
            .sort((a, b) => {
                const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
                const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
                return dateB - dateA;
            })
            .map(t => [
                t.date?.toDate ? t.date.toDate().toLocaleDateString() : new Date(t.date).toLocaleDateString(),
                t.title || "Untitled",
                t.category || "General",
                t.type,
                t.type === 'Income' ? `+$${t.amount.toLocaleString()}` : `-$${t.amount.toLocaleString()}`
            ]);

        autoTable(doc,{
            startY: finalY + 5,
            head: [["Date", "Description", "Category", "Type", "Amount"]],
            body: allTransactions,
            theme: 'striped',
            headStyles: { fillColor: [51, 51, 51] },
            styles: { fontSize: 9 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
            doc.text("CONFIDENTIAL - MoneyManager Dashboard", 14, doc.internal.pageSize.height - 10);
        }

        doc.save(`Fiscal_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                generateReport();
            }
        });
        return () => unsubscribe();
    }, []);

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
                        <select>
                            <option>Current Fiscal Month</option>
                            <option>Previous Quarter</option>
                            <option>Annual Overview</option>
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
                        <div className="placeholder-chart" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--highlight)', borderRadius: '24px', color: 'var(--text-muted)', fontWeight: 700 }}>
                            Synthetic visualization of income vs expenses
                        </div>
                    </div>
                    <div className="chart-card">
                        <h3>Retention Efficiency</h3>
                        <div className="metric-radial" style={{ textAlign: 'center', marginTop: '40px' }}>
                            <div style={{ fontSize: '64px', fontWeight: 800, color: 'var(--secondary)' }}>{reportData.savingsRate}%</div>
                            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Capital Preservation Rate</p>
                        </div>
                        <div style={{ marginTop: 'auto' }}>
                            <button
                                className="export-btn-luxury"
                                style={{ width: '100%' }}
                                onClick={downloadPDF}
                            >
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