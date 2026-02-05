import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../components/Styles/AnotherPageStyle/LegalPages.css";

const TermsOfService = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="legal-page">
      <div className="legal-card">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          {isRTL ? '→' : '←'} {t('terms.back')}
        </button>

        <h1>{t('terms.title')}</h1>
        <p className="legal-date">{t('terms.last_updated')}</p>

        <section>
          <h2>{t('terms.section1_title')}</h2>
          <p>{t('terms.section1_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section2_title')}</h2>
          <p>{t('terms.section2_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section3_title')}</h2>
          <p>{t('terms.section3_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section4_title')}</h2>
          <p>{t('terms.section4_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section5_title')}</h2>
          <p>{t('terms.section5_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section6_title')}</h2>
          <p>{t('terms.section6_content')}</p>
        </section>

        <section>
          <h2>{t('terms.section7_title')}</h2>
          <p>{t('terms.section7_content')}</p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
