import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Styles/AnotherPageStyle/LegalPages.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-card">
        <button className="legal-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: January 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We collect basic account information such as name, email, and profile
            image through Google Authentication.
          </p>
        </section>

        <section>
          <h2>2. How We Use Data</h2>
          <p>
            Data is used solely to provide authentication, store user preferences,
            and improve the application experience.
          </p>
        </section>

        <section>
          <h2>3. Data Storage</h2>
          <p>
            All data is securely stored using Firebase services.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>
            We rely on Google and Firebase services, which operate under their own
            privacy policies.
          </p>
        </section>

        <section>
          <h2>5. User Rights</h2>
          <p>
            You may request data deletion or stop using the service at any time.
          </p>
        </section>

        <section>
          <h2>6. Updates</h2>
          <p>
            This policy may be updated periodically.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
