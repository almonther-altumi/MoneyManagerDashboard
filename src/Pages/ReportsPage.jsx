import React, { useState } from 'react';
import '../components/Styles/ReportsPageStyles/ReportPageStyle.css';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { useTranslation } from "react-i18next";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

import { useFinancialData } from '../hooks/useFinancialData';

// Dedicated Professional PDF Template Component (Defined outside to prevent re-creation on render)
const ReportPDFTemplate = ({ pdfTemplateRef, t, i18n, reportData, formatCurrency, formatPercent, chartImage, locationInfo, investmentSuggestion }) => (
  <div
    ref={pdfTemplateRef}
    className="professional-pdf-template"
    style={{
      display: 'none',
      width: '850px',
      padding: '80px 60px',
      backgroundColor: '#ffffff !important',
      color: '#1a1a1a !important',
      fontFamily: "'Manrope', 'Segoe UI', Tahoma, Arial, sans-serif",
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
          font-family: "Playfair Display", "Cormorant Garamond", serif !important;
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

      {/* Strategic Insights */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9', color: '#0f172a', textAlign: 'center' }}>
          {t('reports.insights.title')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
              {t('reports.insights.top_spending')}
            </p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{reportData.topExpenseMonth}</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#dc2626', fontWeight: '700' }}>{formatCurrency(reportData.topExpenseAmount)}</p>
          </div>
          <div style={{ padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
              {t('reports.insights.top_income')}
            </p>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{reportData.topIncomeMonth}</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#059669', fontWeight: '700' }}>{formatCurrency(reportData.topIncomeAmount)}</p>
          </div>
          <div style={{ padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#94a3b8' }}>
              {t('reports.insights.remaining_balance')}
            </p>
            <p style={{ margin: 0, fontSize: '26px', fontWeight: '900', color: reportData.netSavings >= 0 ? '#0f172a' : '#dc2626' }}>
              {formatCurrency(reportData.netSavings)}
            </p>
          </div>
        </div>
      </div>

      {/* Location & Investment */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '50px' }}>
        <div style={{ padding: '26px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#ffffff' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 16px 0' }}>{t('reports.insights.location_snapshot')}</h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '14px', color: '#334155' }}>
            <p style={{ margin: 0, fontWeight: '700' }}>
              {locationInfo.status === 'loading' && t('reports.insights.location_loading')}
              {locationInfo.status === 'denied' && t('reports.insights.location_denied')}
              {locationInfo.status === 'unsupported' && t('reports.insights.location_unsupported')}
              {locationInfo.status === 'unavailable' && t('reports.insights.location_unavailable')}
              {locationInfo.status === 'granted' && t('reports.insights.location_ready')}
            </p>
            <p style={{ margin: 0 }}>
              <strong>{t('reports.insights.location_timezone')}:</strong> {locationInfo.timeZone || 'UTC'} ({locationInfo.utcOffset})
            </p>
            <p style={{ margin: 0 }}>
              <strong>{t('reports.insights.location_locale')}:</strong> {locationInfo.locale}
            </p>
            <p style={{ margin: 0 }}>
              <strong>{t('reports.insights.location_coords')}:</strong> {locationInfo.coords || t('reports.insights.coordinates_unknown')}
            </p>
            {locationInfo.accuracy && (
              <p style={{ margin: 0 }}>
                <strong>{t('reports.insights.location_accuracy')}:</strong> {locationInfo.accuracy}
              </p>
            )}
          </div>
        </div>
        <div style={{ padding: '26px', borderRadius: '20px', border: '1px solid #f5e9d5', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0' }}>{t('reports.investment.title')}</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
            {investmentSuggestion.title}
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.7' }}>
            {investmentSuggestion.body}
          </p>
          <p style={{ margin: '14px 0 0 0', fontSize: '12px', color: '#9a3412', fontWeight: '700' }}>
            {t('reports.investment.disclaimer')}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', textAlign: 'center' }}>{t('reports.charts.monthly_performance')}</h3>
        <div style={{ borderRadius: '22px', border: '1px solid #e2e8f0', background: '#ffffff', padding: '20px' }}>
          {chartImage ? (
            <img src={chartImage} alt="Monthly performance chart" style={{ width: '100%', height: 'auto', borderRadius: '16px' }} />
          ) : (
            <div style={{ padding: '80px 20px', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
              {t('reports.charts.generating')}
            </div>
          )}
        </div>
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
  const [chartImage, setChartImage] = useState(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 640;
  });
  const [chartHalf, setChartHalf] = useState('first');
  const [chartTone, setChartTone] = useState(() => ({
    line: '#5b6cff',
    fillTop: 'rgba(91, 108, 255, 0.35)',
    fillBottom: 'rgba(91, 108, 255, 0.05)'
  }));
  const [locationInfo, setLocationInfo] = useState(() => ({
    status: 'idle',
    coords: null,
    accuracy: null,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    utcOffset: 'UTC+00:00',
    locale: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
    capturedAt: null,
    error: null
  }));
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

  const formatUtcOffset = React.useCallback((offsetMinutes) => {
    const totalMinutes = Math.abs(offsetMinutes);
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    const sign = offsetMinutes <= 0 ? '+' : '-';
    return `UTC${sign}${hours}:${minutes}`;
  }, []);

  React.useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    setLocationInfo(prev => ({
      ...prev,
      utcOffset: formatUtcOffset(offset),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || prev.timeZone
    }));

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationInfo(prev => ({ ...prev, status: 'unsupported' }));
      return;
    }

    setLocationInfo(prev => ({ ...prev, status: 'loading' }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        setLocationInfo(prev => ({
          ...prev,
          status: 'granted',
          coords: `${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
          accuracy: `${Math.round(coords.accuracy)}m`,
          capturedAt: position.timestamp
        }));
      },
      (error) => {
        const status = error.code === 1 ? 'denied' : 'unavailable';
        setLocationInfo(prev => ({
          ...prev,
          status,
          error: error.message
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000
      }
    );
  }, [formatUtcOffset]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (!isMobile) {
      setChartHalf('first');
    }
  }, [isMobile]);

  const toRgba = React.useCallback((color, alpha) => {
    const value = String(color || '').trim();
    if (!value) return `rgba(91, 108, 255, ${alpha})`;
    if (value.startsWith('rgb')) {
      const match = value.match(/rgba?\(([^)]+)\)/i);
      if (!match) return `rgba(91, 108, 255, ${alpha})`;
      const parts = match[1].split(',').map(part => part.trim());
      const r = Number.parseInt(parts[0], 10);
      const g = Number.parseInt(parts[1], 10);
      const b = Number.parseInt(parts[2], 10);
      if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
        return `rgba(91, 108, 255, ${alpha})`;
      }
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (value.startsWith('#')) {
      let hex = value.slice(1);
      if (hex.length === 3) {
        hex = hex.split('').map(ch => ch + ch).join('');
      }
      if (hex.length >= 6) {
        const r = Number.parseInt(hex.slice(0, 2), 16);
        const g = Number.parseInt(hex.slice(2, 4), 16);
        const b = Number.parseInt(hex.slice(4, 6), 16);
        if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
      }
    }
    if (value.startsWith('hsl')) {
      const match = value.match(/hsla?\(([^)]+)\)/i);
      if (match) {
        const parts = match[1]
          .replace(/%/g, '')
          .split(/[\s,\/]+/)
          .filter(Boolean);
        const h = Number.parseFloat(parts[0]);
        const s = Number.parseFloat(parts[1]) / 100;
        const l = Number.parseFloat(parts[2]) / 100;
        if (!Number.isNaN(h) && !Number.isNaN(s) && !Number.isNaN(l)) {
          const c = (1 - Math.abs(2 * l - 1)) * s;
          const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
          const m = l - c / 2;
          let r1 = 0;
          let g1 = 0;
          let b1 = 0;
          if (h >= 0 && h < 60) {
            r1 = c; g1 = x; b1 = 0;
          } else if (h >= 60 && h < 120) {
            r1 = x; g1 = c; b1 = 0;
          } else if (h >= 120 && h < 180) {
            r1 = 0; g1 = c; b1 = x;
          } else if (h >= 180 && h < 240) {
            r1 = 0; g1 = x; b1 = c;
          } else if (h >= 240 && h < 300) {
            r1 = x; g1 = 0; b1 = c;
          } else if (h >= 300 && h < 360) {
            r1 = c; g1 = 0; b1 = x;
          }
          const r = Math.round((r1 + m) * 255);
          const g = Math.round((g1 + m) * 255);
          const b = Math.round((b1 + m) * 255);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
      }
    }
    return `rgba(91, 108, 255, ${alpha})`;
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = document.documentElement;
    const updateTone = () => {
      const primary = getComputedStyle(root).getPropertyValue('--primary').trim() || '#5b6cff';
      setChartTone({
        line: primary,
        fillTop: toRgba(primary, 0.35),
        fillBottom: toRgba(primary, 0.05)
      });
    };
    updateTone();
    if (!window.MutationObserver) return undefined;
    const observer = new MutationObserver(updateTone);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    if (document.body) {
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
    return () => observer.disconnect();
  }, [toRgba]);

  const monthLabels = React.useMemo(() => {
    const locale = i18n?.language === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });
    return Array.from({ length: 12 }, (_, idx) => formatter.format(new Date(2024, idx, 1)));
  }, [i18n?.language]);

  const monthLabelsLong = React.useMemo(() => {
    const locale = i18n?.language === 'ar' ? 'ar-u-nu-latn' : 'en-US';
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, idx) => formatter.format(new Date(2024, idx, 1)));
  }, [i18n?.language]);

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
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpenses = new Array(12).fill(0);
    processedIncome.forEach(item => {
      if (item.date && !isNaN(item.date)) {
        const monthIndex = item.date.getMonth();
        monthlyIncome[monthIndex] += item.amount;
      }
    });
    processedExpense.forEach(item => {
      if (item.date && !isNaN(item.date)) {
        const monthIndex = item.date.getMonth();
        monthlyExpenses[monthIndex] += item.amount;
      }
    });

    const hasIncome = monthlyIncome.some(amount => amount > 0);
    const hasExpense = monthlyExpenses.some(amount => amount > 0);
    const topIncomeIndex = hasIncome ? monthlyIncome.indexOf(Math.max(...monthlyIncome)) : -1;
    const topExpenseIndex = hasExpense ? monthlyExpenses.indexOf(Math.max(...monthlyExpenses)) : -1;

    return {
      totalIncome: incomeTotal,
      totalExpenses: expenseTotal,
      netSavings: net,
      savingsRate: Math.round(rate),
      incomeList: processedIncome,
      expenseList: processedExpense,
      monthlyIncome,
      monthlyExpenses,
      topIncomeMonth: hasIncome ? monthLabelsLong[topIncomeIndex] : t('reports.insights.no_data'),
      topExpenseMonth: hasExpense ? monthLabelsLong[topExpenseIndex] : t('reports.insights.no_data'),
      topIncomeAmount: hasIncome ? monthlyIncome[topIncomeIndex] : 0,
      topExpenseAmount: hasExpense ? monthlyExpenses[topExpenseIndex] : 0
    };
  }, [rawIncomeData, rawExpenseData, monthLabelsLong, t]);

  const monthlyNet = React.useMemo(() => (
    reportData.monthlyIncome.map((income, idx) => income - reportData.monthlyExpenses[idx])
  ), [reportData.monthlyIncome, reportData.monthlyExpenses]);

  const investmentSuggestion = React.useMemo(() => {
    if (reportData.netSavings <= 0) {
      return {
        title: t('reports.investment.stabilize_title'),
        body: t('reports.investment.stabilize_body')
      };
    }
    if (reportData.savingsRate < 10) {
      return {
        title: t('reports.investment.buffer_title'),
        body: t('reports.investment.buffer_body')
      };
    }
    if (reportData.savingsRate < 25) {
      return {
        title: t('reports.investment.balanced_title'),
        body: t('reports.investment.balanced_body')
      };
    }
    return {
      title: t('reports.investment.growth_title'),
      body: t('reports.investment.growth_body')
    };
  }, [reportData.netSavings, reportData.savingsRate, t]);

  const buildChartImage = React.useCallback(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const chartInstance = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: t('reports.charts.monthly_income'),
            data: reportData.monthlyIncome,
            backgroundColor: 'rgba(5, 150, 105, 0.8)',
            borderRadius: 8,
            barThickness: 18
          },
          {
            label: t('reports.charts.monthly_expense'),
            data: reportData.monthlyExpenses,
            backgroundColor: 'rgba(220, 38, 38, 0.75)',
            borderRadius: 8,
            barThickness: 18
          }
        ]
      },
      options: {
        responsive: false,
        animation: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#0f172a',
              font: { family: 'Manrope, Segoe UI, sans-serif', size: 12, weight: '700' }
            }
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#475569',
              font: { family: 'Manrope, Segoe UI, sans-serif', size: 11 }
            }
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.3)' },
            ticks: {
              color: '#475569',
              font: { family: 'Manrope, Segoe UI, sans-serif', size: 11 }
            }
          }
        }
      }
    });
    const dataUrl = chartInstance.toBase64Image();
    chartInstance.destroy();
    return dataUrl;
  }, [monthLabels, reportData.monthlyIncome, reportData.monthlyExpenses, t]);

  React.useEffect(() => {
    const image = buildChartImage();
    if (image) {
      setChartImage(image);
    }
  }, [buildChartImage]);


  const downloadPDF = async () => {
    if (!pdfTemplateRef.current) {
      console.warn("PDF Template reference not found");
      return;
    }

    try {
      console.log("Starting multi-page PDF generation with margins...");
      const element = pdfTemplateRef.current;
      if (!chartImage) {
        const image = buildChartImage();
        if (image) {
          setChartImage(image);
        }
      }

      // Ensure clean state for capture
      element.style.display = 'block';
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      element.style.top = '0';

      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => setTimeout(resolve, 40));

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
  const chartLabels = React.useMemo(() => {
    if (!isMobile) return monthLabels;
    return chartHalf === 'second' ? monthLabels.slice(6) : monthLabels.slice(0, 6);
  }, [chartHalf, isMobile, monthLabels]);

  const chartSeries = React.useMemo(() => {
    if (!isMobile) return monthlyNet;
    return chartHalf === 'second' ? monthlyNet.slice(6) : monthlyNet.slice(0, 6);
  }, [chartHalf, isMobile, monthlyNet]);

  const chartData = React.useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        label: t('reports.capital_trajectory'),
        data: chartSeries,
        borderColor: chartTone.line,
        borderWidth: 3,
        pointRadius: 2,
        pointHoverRadius: 4,
        tension: 0.45,
        fill: true,
        backgroundColor: (context) => {
          const { chart } = context;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return chartTone.fillTop;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, chartTone.fillTop);
          gradient.addColorStop(1, chartTone.fillBottom);
          return gradient;
        }
      }
    ]
  }), [chartLabels, chartSeries, chartTone, t]);

  const chartOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'inherit', size: 12, weight: '700' },
        bodyFont: { family: 'inherit', size: 12 }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: 'rgba(148, 163, 184, 0.75)',
          font: { size: 11, weight: '600' }
        }
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: {
          color: 'rgba(148, 163, 184, 0.75)',
          font: { size: 11, weight: '600' },
          callback: (value) => `${value}`
        }
      }
    }
  }), []);

  return (
    <div className="reports-page-root" ref={reportRef}>
      <ReportPDFTemplate
        pdfTemplateRef={pdfTemplateRef}
        t={t}
        i18n={i18n}
        reportData={reportData}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
        chartImage={chartImage}
        locationInfo={locationInfo}
        investmentSuggestion={investmentSuggestion}
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

        <div className="reports-insights-grid">
          <div className="insight-card">
            <span className="insight-label">{t('reports.insights.top_spending')}</span>
            <div className="insight-value">{reportData.topExpenseMonth}</div>
            <div className="insight-meta negative">{formatCurrency(reportData.topExpenseAmount)}</div>
          </div>
          <div className="insight-card">
            <span className="insight-label">{t('reports.insights.top_income')}</span>
            <div className="insight-value">{reportData.topIncomeMonth}</div>
            <div className="insight-meta positive">{formatCurrency(reportData.topIncomeAmount)}</div>
          </div>
          <div className="insight-card">
            <span className="insight-label">{t('reports.insights.remaining_balance')}</span>
            <div className={`insight-value ${reportData.netSavings < 0 ? 'negative' : 'positive'}`}>
              {formatCurrency(reportData.netSavings)}
            </div>
            <div className="insight-sub">{t('reports.net_retained_capital')}</div>
          </div>
          <div className="insight-card location-card">
            <span className="insight-label">{t('reports.insights.location_snapshot')}</span>
            <div className="location-status">
              {locationInfo.status === 'loading' && t('reports.insights.location_loading')}
              {locationInfo.status === 'denied' && t('reports.insights.location_denied')}
              {locationInfo.status === 'unsupported' && t('reports.insights.location_unsupported')}
              {locationInfo.status === 'unavailable' && t('reports.insights.location_unavailable')}
              {locationInfo.status === 'granted' && t('reports.insights.location_ready')}
            </div>
            <div className="location-grid">
              <div>
                <span>{t('reports.insights.location_timezone')}</span>
                <strong>{locationInfo.timeZone} ({locationInfo.utcOffset})</strong>
              </div>
              <div>
                <span>{t('reports.insights.location_locale')}</span>
                <strong>{locationInfo.locale}</strong>
              </div>
              <div>
                <span>{t('reports.insights.location_coords')}</span>
                <strong>{locationInfo.coords || t('reports.insights.coordinates_unknown')}</strong>
              </div>
              {locationInfo.accuracy && (
                <div>
                  <span>{t('reports.insights.location_accuracy')}</span>
                  <strong>{locationInfo.accuracy}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="reports-investment-card">
          <div>
            <h3>{t('reports.investment.title')}</h3>
            <p className="investment-title">{investmentSuggestion.title}</p>
            <p className="investment-body">{investmentSuggestion.body}</p>
          </div>
          <div className="investment-disclaimer">{t('reports.investment.disclaimer')}</div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <h3>{t('reports.capital_trajectory')}</h3>
              {isMobile && (
                <div className="chart-toggle">
                  <button
                    type="button"
                    className={`chart-toggle-btn ${chartHalf === 'first' ? 'active' : ''}`}
                    onClick={() => setChartHalf('first')}
                  >
                    {`${monthLabels[0]} - ${monthLabels[5]}`}
                  </button>
                  <button
                    type="button"
                    className={`chart-toggle-btn ${chartHalf === 'second' ? 'active' : ''}`}
                    onClick={() => setChartHalf('second')}
                  >
                    {`${monthLabels[6]} - ${monthLabels[11]}`}
                  </button>
                </div>
              )}
            </div>
            <div className="placeholder-chart">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>{t('reports.retention_efficiency')}</h3>
            <div className="metric-radial">
              <div className="metric-value">{formatPercent(reportData.savingsRate)}</div>
              <p className="metric-label">{t('reports.capital_preservation_rate')}</p>
            </div>
            <div className="chart-actions">
              <button className="export-btn-luxury" onClick={downloadPDF} data-html2canvas-ignore>
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
