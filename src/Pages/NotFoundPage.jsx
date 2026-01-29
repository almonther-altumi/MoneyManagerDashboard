import React from 'react'
import '../Styles/PagesStyle/NotFoundPageStyle.css'
import { useTranslation } from "react-i18next";

const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <main className="nn-container" role="main">
      <section className="nn-card" aria-labelledby="nn-title">
        <div className="nn-illustration" aria-hidden="true">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="var(--secondary)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>
            <g className="nn-float">
              <circle cx="60" cy="60" r="34" fill="url(#g1)" opacity="0.95" />
              <circle cx="140" cy="80" r="22" fill="var(--info)" opacity="0.9" />
              <circle cx="100" cy="140" r="14" fill="var(--success)" opacity="0.9" />
            </g>
          </svg>
        </div>

        <h1 id="nn-title" className="nn-title">{t('not_found.title')}</h1>
        <p className="nn-desc">{t('not_found.desc')}</p>

        <div className="nn-actions">
          <button
            className="nn-btn nn-btn-primary"
            onClick={() => (window.location.href = '/')}
          >
            {t('not_found.go_home')}
          </button>
          <button
            className="nn-btn"
            onClick={() => window.history.back()}
          >
            {t('not_found.go_back')}
          </button>
        </div>
      </section>
    </main>
  )
}

export default NotFoundPage