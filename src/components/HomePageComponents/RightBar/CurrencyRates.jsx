
import React, { useState, useEffect } from 'react';
import { db, auth } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function CurrencyRates() {
  const [rates, setRates] = useState({
    official: 4.88,
    blackMarket: 6.95,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempRates, setTempRates] = useState({ official: 4.88, blackMarket: 6.95 });

  const fetchOfficialRate = async () => {
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      if (data.rates && data.rates.LYD) {
        setRates(prev => ({ ...prev, official: data.rates.LYD }));
        setTempRates(prev => ({ ...prev, official: data.rates.LYD }));
      }
    } catch (error) {
      console.error("Error fetching official rate:", error);
    }
  };

  const fetchSavedRates = async (user) => {
    try {
      const ratesRef = doc(db, "users", user.uid, "settings", "rates");
      const ratesSnap = await getDoc(ratesRef);
      if (ratesSnap.exists()) {
        const data = ratesSnap.data();
        setRates(prev => ({
          ...prev,
          blackMarket: data.blackMarket || prev.blackMarket,
          official: data.official || prev.official
        }));
        setTempRates(prev => ({
          ...prev,
          blackMarket: data.blackMarket || prev.blackMarket,
          official: data.official || prev.official
        }));
      }
    } catch (error) {
      console.error("Error fetching saved rates:", error);
    }
  };

  useEffect(() => {
    fetchOfficialRate();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchSavedRates(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const ratesRef = doc(db, "users", user.uid, "settings", "rates");
      await setDoc(ratesRef, {
        official: Number(tempRates.official),
        blackMarket: Number(tempRates.blackMarket),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      setRates({
        official: Number(tempRates.official),
        blackMarket: Number(tempRates.blackMarket)
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving rates:", error);
    }
  };

  return (
    <section className="card currency-card luxury-card">
      <div className="budget-header-box">
        <h3>Monetary Ticker</h3>
        <button className="edit-trigger-icon" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? '✕' : '✎'}
        </button>
      </div>

      <div className="rates-stack">
        <div className="rate-item-modern">
          <div className="rate-meta">
            <span className="rate-title">Central Bank</span>
            <span className="rate-sub">Official Fix</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={tempRates.official}
              onChange={(e) => setTempRates({ ...tempRates, official: e.target.value })}
              className="luxury-rate-input"
            />
          ) : (
            <div className="rate-value-box">
              <span className="rate-val">{rates.official.toFixed(3)}</span>
              <span className="rate-trend up">↑</span>
            </div>
          )}
        </div>

        <div className="rate-item-modern highlight-market">
          <div className="rate-meta">
            <span className="rate-title">Parallel Market</span>
            <span className="rate-sub">Real-time Liquidity</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={tempRates.blackMarket}
              onChange={(e) => setTempRates({ ...tempRates, blackMarket: e.target.value })}
              className="luxury-rate-input"
            />
          ) : (
            <div className="rate-value-box">
              <span className="rate-val market">{rates.blackMarket.toFixed(2)}</span>
              <span className="rate-trend steady">→</span>
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <button onClick={handleSave} className="luxury-commit-btn">Update Ledger</button>
      )}

      <style>{`
        .rates-stack {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .rate-item-modern {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: var(--bg);
            border-radius: 20px;
            border: 1px solid var(--border-muted);
            transition: all 0.3s ease;
        }

        .rate-item-modern:hover {
            border-color: var(--secondary);
            transform: scale(1.02);
        }

        .rate-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .rate-title {
            font-size: 13px;
            font-weight: 800;
            color: var(--text);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .rate-sub {
            font-size: 10px;
            font-weight: 600;
            color: var(--text-muted);
        }

        .rate-value-box {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .rate-val {
            font-size: 18px;
            font-weight: 800;
            color: var(--text);
            letter-spacing: -0.5px;
        }

        .rate-val.market {
            color: var(--secondary);
        }

        .rate-trend {
            font-size: 14px;
            font-weight: 800;
        }

        .rate-trend.up { color: var(--success); }
        .rate-trend.steady { color: var(--text-muted); }

        .luxury-rate-input {
            width: 80px;
            background: var(--bg-dark);
            border: 1px solid var(--border-muted);
            color: var(--text);
            padding: 8px;
            border-radius: 10px;
            text-align: right;
            font-weight: 800;
            outline: none;
        }

        .luxury-commit-btn {
            margin-top: 8px;
            background: var(--secondary);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 16px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
        }

        .luxury-commit-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }
      `}</style>
    </section>
  );
}

export default CurrencyRates;
