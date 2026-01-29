import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Styles/AnotherPageStyle/LegalPages.css";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-card">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: January 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using this application, you agree to be bound by these
            Terms of Service. If you do not agree, please discontinue use.
          </p>
        </section>

        <section>
          <h2>2. Description of the Service</h2>
          <p>
            This service provides personal financial tracking, analytics, and
            goal management tools for informational purposes only.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            Authentication is handled via Google Sign-In. You are responsible
            for maintaining the confidentiality of your account.
          </p>
        </section>

        <section>
          <h2>4. User Responsibility</h2>
          <p>
            You are solely responsible for the data you enter and decisions you
            make based on the service.
          </p>
        </section>

        <section>
          <h2>5. Prohibited Use</h2>
          <p>
            Any attempt to misuse, exploit, or disrupt the service is strictly
            prohibited.
          </p>
        </section>

        <section>
          <h2>6. Disclaimer</h2>
          <p>
            The service is provided "as is" without warranties of any kind.
          </p>
        </section>

        <section>
          <h2>7. Changes</h2>
          <p>
            We reserve the right to modify these terms at any time.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
