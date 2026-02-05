import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../components/Styles/AnotherPageStyle/LegalPages.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="legal-page">
      <div className="legal-card">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          {isRTL ? '→' : '←'} {t('privacy.back')}
        </button>

        <h1>{t('privacy.title')}</h1>
        <p className="legal-date">{t('privacy.last_updated')}</p>

        <section>
          <h2>{t('privacy.section1_title')}</h2>
          <p>{t('privacy.section1_content')}</p>
        </section>

        <section>
          <h2>{t('privacy.section2_title')}</h2>
          <p>{t('privacy.section2_content')}</p>
        </section>

        <section>
          <h2>{t('privacy.section3_title')}</h2>
          <p>{t('privacy.section3_content')}</p>
        </section>

        <section>
          <h2>{t('privacy.section4_title')}</h2>
          <p>{t('privacy.section4_content')}</p>
        </section>

        <section>
          <h2>{t('privacy.section5_title')}</h2>
          <p>{t('privacy.section5_content')}</p>
        </section>

        <section>
          <h2>{t('privacy.section6_title')}</h2>
          <p>{t('privacy.section6_content')}</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
