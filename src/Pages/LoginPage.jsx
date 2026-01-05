
import React, { useState, useEffect } from "react";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import '../components/Styles/PagesStyle/LoginPageStyle.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="login-page-container">
      <div className="login-bg-overlay"></div>

      <button className="back-home-btn" onClick={() => navigate('/')}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Dashboard
      </button>

      <div className="login-card">
        {currentUser ? (
          <div className="profile-card">
            <img src={currentUser.photoURL} alt="User" className="user-avatar-main" />
            <div className="user-info-group">
              <h2>{currentUser.displayName}</h2>
              <p>{currentUser.email}</p>
            </div>

            <div className="login-actions-group">
              <button className="switch-account-btn" onClick={loginWithGoogle}>
                Switch Account
              </button>
              <button className="logout-secondary-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="login-logo">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h1>Welcome Back</h1>
            <p>Elevate your financial journey. Sign in to access your premium analytics and secure your future.</p>

            <button
              className="google-login-btn"
              onClick={loginWithGoogle}
              disabled={loading}
            >
              {loading ? (
                "Authenticating..."
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="google-icon"
                  />
                  Sign in with Google
                </>
              )}
            </button>
          </>
        )}

        <div className="login-footer">
          By signing in, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
