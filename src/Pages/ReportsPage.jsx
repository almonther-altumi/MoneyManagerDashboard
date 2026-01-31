import React, { useState } from 'react';
import '../components/Styles/ReportsPageStyles/ReportPageStyle.css';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { useTranslation } from "react-i18next";

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

import { useFinancialData } from '../hooks/useFinancialData';

// Dedicated Professional PDF Template Component (Defined outside to prevent re-creation on render)
const ReportPDFTemplate = ({ pdfTemplateRef, t, i18n, reportData, formatCurrency, formatPercent }) => (
  <div
    ref={pdfTemplateRef}
    className="professional-pdf-template"
    style={{
      display: 'none',
      width: '850px',
      padding: '80px 60px',
      backgroundColor: '#ffffff !important',
      color: '#1a1a1a !important',
      fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
      direction: i18n?.language === 'ar' ? 'rtl' : 'ltr',
      boxSizing: 'border-box',
      letterSpacing: 'normal !important',
      fontFeatureSettings: "'kern' 1, 'liga' 1 !important",
      textRendering: 'optimizeLegibility',
      WebkitFontSmoothing: 'antialiased'
    }}
  >
    <style>
      {`
        .professional-pdf-template * {
          color: #1a1a1a !important;
          background-color: transparent !important;
          border-color: #e2e8f0 !important;
          letter-spacing: normal !important;
          font-feature-settings: "kern" 1, "liga" 1 !important;
        }
        .professional-pdf-template h1, .professional-pdf-template h2, .professional-pdf-template h3 {
          color: #0f172a !important;
        }
      `}
    </style>

    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderBottom: '3px solid #1a1a1a', paddingBottom: '40px', marginBottom: '50px' }}>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('app.title')}</h2>
        <h1 style={{ margin: 0, fontSize: '48px', fontWeight: '900', color: '#1a1a1a', lineHeight: '1.2' }}>{t('reports.title')}</h1>
        <p style={{ margin: '15px 0 0 0', color: '#94a3b8', fontSize: '18px', fontWeight: '600' }}>
          {new Date().toLocaleDateString(i18n?.language === 'ar' ? 'ar-u-nu-latn' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Hero Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginBottom: '60px' }}>
        {[
          { label: t('reports.gross_liquidity'), value: formatCurrency(reportData.totalIncome), color: '#059669', bg: '#f0fdf4', borderColor: '#bbf7d0' },
          { label: t('reports.total_expenditure'), value: formatCurrency(reportData.totalExpenses), color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca' },
          { label: t('reports.net_retained_capital'), value: formatCurrency(reportData.netSavings), color: '#2563eb', bg: '#eff6ff', borderColor: '#bfdbfe' },
          { label: t('reports.capital_preservation_rate'), value: formatPercent(reportData.savingsRate), color: '#475569', bg: '#f4f4f5', borderColor: '#e2e8f0' }
        ].map((stat, idx) => (
          <div key={idx} style={{ padding: '30px', borderRadius: '24px', backgroundColor: `${stat.bg} !important`, border: `1px solid ${stat.borderColor} !important`, textAlign: 'center' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: '36px', fontWeight: '900', color: `${stat.color} !important`, letterSpacing: '-1px' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction Summary Section */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9', color: '#0f172a', textAlign: 'center' }}>
          {t('home.transactions.title')}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '16px 12px', textAlign: i18n?.language === 'ar' ? 'right' : 'left', fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{t('table.date')}</th>
              <th style={{ padding: '16px 12px', textAlign: i18n?.language === 'ar' ? 'right' : 'left', fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{t('table.description')}</th>
              <th style={{ padding: '16px 12px', textAlign: i18n?.language === 'ar' ? 'right' : 'left', fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{t('table.category')}</th>
              <th style={{ padding: '16px 12px', textAlign: 'center', fontSize: '12px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>{t('table.amount')}</th>
            </tr>
          </thead>
          <tbody>
            {[...reportData.incomeList, ...reportData.expenseList]
              .sort((a, b) => b.date - a.date)
              .map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#64748b', whiteSpace: 'nowrap' }}>{item.date?.toLocaleDateString(i18n?.language === 'ar' ? 'ar-u-nu-latn' : 'en-US')}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#0f172a', fontWeight: '700' }}>{item.title || "---"}</td>
                  <td style={{ padding: '16px 12px', fontSize: '14px', color: '#475569' }}>{item.category || "General"}</td>
                  <td style={{ padding: '16px 12px', fontSize: '16px', fontWeight: '900', color: `${item.type === 'Income' ? '#059669' : '#dc2626'} !important`, textAlign: 'center' }}>
                    {item.type === 'Income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ paddingTop: '50px', borderTop: '2px solid #f1f5f9', textAlign: 'center' }}>
        <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.8', fontStyle: 'italic', maxWidth: '600px', margin: '0 auto 30px auto' }}>
          "{t('reports.intro')}"
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '30px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: '700' }}>
            &copy; {new Date().getFullYear()} {t('app.title')}
          </p>
        </div>
      </div>
    </div>
  </div>
);

function ReportsPage() {
  const { t, i18n } = useTranslation();
  const { income: rawIncomeData, expenses: rawExpenseData } = useFinancialData();

  const [sortOrder, setSortOrder] = useState('dateDesc');
  const reportRef = React.useRef(null);
  const pdfTemplateRef = React.useRef(null);

  const formatCurrency = (amount) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount).toLocaleString();
    return isNegative ? `-$${absAmount}` : `$${absAmount}`;
  };

  const formatPercent = (rate) => {
    const isNegative = rate < 0;
    return isNegative ? `-${Math.abs(rate)}%` : `${rate}%`;
  };

  // Derive report data from context using useMemo
  const reportData = React.useMemo(() => {
    // Process and sort data
    const processedIncome = rawIncomeData.map(item => ({
      ...item,
      amount: Number(item.amount) || 0,
      type: 'Income',
      date: item.date?.toDate ? item.date.toDate() : new Date(item.date)
    }));

    const processedExpense = rawExpenseData.map(item => ({
      ...item,
      amount: Number(item.amount) || 0,
      type: 'Expense',
      date: item.date?.toDate ? item.date.toDate() : new Date(item.date)
    }));

    const incomeTotal = processedIncome.reduce((acc, item) => acc + item.amount, 0);
    const expenseTotal = processedExpense.reduce((acc, item) => acc + item.amount, 0);
    const net = incomeTotal - expenseTotal;
    const rate = incomeTotal > 0 ? (net / incomeTotal) * 100 : 0;

    // Monthly Aggregation
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyIncome = {};
    months.forEach(m => monthlyIncome[m] = 0);

    processedIncome.forEach(item => {
      if (item.date && !isNaN(item.date)) {
        const monthName = months[item.date.getMonth()];
        if (monthName) monthlyIncome[monthName] += item.amount;
      }
    });

    return {
      totalIncome: incomeTotal,
      totalExpenses: expenseTotal,
      netSavings: net,
      savingsRate: Math.round(rate),
      incomeList: processedIncome,
      expenseList: processedExpense,
      monthlyIncome
    };
  }, [rawIncomeData, rawExpenseData]);


  const downloadPDF = async () => {
    if (!pdfTemplateRef.current) {
      console.warn("PDF Template reference not found");
      return;
    }

    try {
      console.log("Starting multi-page PDF generation with margins...");
      const element = pdfTemplateRef.current;

      // Ensure clean state for capture
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 850,
        windowWidth: 850
      });

      // Hide template again
      element.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 15; // mm (top & bottom margin for EACH page)
      const contentWidth = pdfWidth;
      const contentHeight = pdfHeight - (2 * margin);

      // Calculate how many canvas pixels fit into the safe content area of one PDF page
      const pxToMm = contentWidth / canvas.width;
      const canvasPageHeight = contentHeight / pxToMm;

      let heightRemaining = canvas.height;
      let offset = 0; // Where we are in the canvas (pixels)

      while (heightRemaining > 0) {
        // Position the current slice in the middle of the PDF page manually
        // We use negative offset to show the correct part of the image
        pdf.addImage(imgData, 'PNG', 0, margin - (offset * pxToMm), pdfWidth, (canvas.height * pxToMm), undefined, 'FAST');

        // Block the top and bottom margins with white rectangles to hide overflow from other pages
        pdf.setFillColor(255, 255, 255);
        pdf.rect(0, 0, pdfWidth, margin, 'F'); // Top margin
        pdf.rect(0, pdfHeight - margin, pdfWidth, margin, 'F'); // Bottom margin

        heightRemaining -= canvasPageHeight;
        offset += canvasPageHeight;

        if (heightRemaining > 0) {
          pdf.addPage();
        }
      }

      pdf.save(`Fiscal_Statement_${new Date().toISOString().split("T")[0]}.pdf`);
      console.log("PDF generation complete.");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check the console for more details.");
    }
  };




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
    <div className="reports-page-root" ref={reportRef}>
      <ReportPDFTemplate
        pdfTemplateRef={pdfTemplateRef}
        t={t}
        i18n={i18n}
        reportData={reportData}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
      />


      <div className="reports-content-centered">
        <header className="reports-header">
          <div className="header-text">
            <h2>{t('reports.title')}</h2>
            <p>{t('reports.intro')}</p>
          </div>

          <div className="reports-date-filter">
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
              <option value="dateDesc">{t('reports.filters.date_desc')}</option>
              <option value="dateAsc">{t('reports.filters.date_asc')}</option>
              <option value="amountAsc">{t('reports.filters.amount_asc')}</option>
              <option value="amountDesc">{t('reports.filters.amount_desc')}</option>
            </select>
          </div>
        </header>

        <div className="reports-stats-row">
          <div className="stat-card">
            <span className="label">{t('reports.gross_liquidity')}</span>
            <span className="amount income">{formatCurrency(reportData.totalIncome)}</span>
          </div>
          <div className="stat-card">
            <span className="label">{t('reports.total_expenditure')}</span>
            <span className="amount expense">{formatCurrency(reportData.totalExpenses)}</span>
          </div>
          <div className="stat-card">
            <span className="label">{t('reports.net_retained_capital')}</span>
            <span className="amount balance">{formatCurrency(reportData.netSavings)}</span>
          </div>
        </div>


        <div className="charts-grid">
          <div className="chart-card">
            <h3>{t('reports.capital_trajectory')}</h3>
            <div className="placeholder-chart">
              <Bar data={chartData} />
            </div>
          </div>

          <div className="chart-card">
            <h3>{t('reports.retention_efficiency')}</h3>
            <div className="metric-radial" style={{ textAlign: 'center', marginTop: '40px' }}>
              <div style={{ fontSize: '64px', fontWeight: 800, color: 'var(--secondary)' }}>
                {formatPercent(reportData.savingsRate)}
              </div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{t('reports.capital_preservation_rate')}</p>
            </div>
            <div style={{ marginTop: 'auto' }}>
              <button className="export-btn-luxury" style={{ width: '100%' }} onClick={downloadPDF} data-html2canvas-ignore>
                {t('reports.download_statement')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
