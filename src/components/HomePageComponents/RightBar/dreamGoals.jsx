
import React, { useState, useEffect } from 'react';
import { db, auth } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function DreamGoals() {
  const [goals, setGoals] = useState([
    { id: 'car', name: 'Premium Segment Vehicle', current: 2000, target: 100000, icon: 'car' },
    { id: 'house', name: 'Primary Estate Acquisition', current: 15000, target: 300000, icon: 'house' }
  ]);
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({ current: 0, target: 0 });

  useEffect(() => {
    const fetchGoals = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const goalsRef = doc(db, "users", user.uid, "settings", "goals");
      const goalsSnap = await getDoc(goalsRef);
      if (goalsSnap.exists()) {
        const data = goalsSnap.data();
        setGoals(prev => prev.map(g => ({
          ...g,
          current: data[g.id]?.current ?? g.current,
          target: data[g.id]?.target ?? g.target
        })));
      }
    };
    const unsubscribe = auth.onAuthStateChanged((u) => u && fetchGoals());
    return () => unsubscribe();
  }, []);

  const handleSave = async (id) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const goalsRef = doc(db, "users", user.uid, "settings", "goals");
      const updated = goals.map(g => g.id === id ? { ...g, ...tempData } : g);
      const updateData = {};
      updated.forEach(g => updateData[g.id] = { current: Number(g.current), target: Number(g.target) });
      await setDoc(goalsRef, updateData, { merge: true });
      setGoals(updated);
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="card dream-card luxury-card">
      <div className="budget-header-box">
        <h3>Capital Aspirations</h3>
      </div>

      <div className="goals-stack">
        {goals.map(goal => {
          const percent = Math.round((goal.current / goal.target) * 100);
          return (
            <div className="goal-item" key={goal.id}>
              <div className="goal-info-row">
                <span className="goal-label">{goal.name}</span>
                {editingId === goal.id ? (
                  <div className="goal-actions">
                    <button onClick={() => handleSave(goal.id)}>✓</button>
                    <button onClick={() => setEditingId(null)}>✕</button>
                  </div>
                ) : (
                  <button className="edit-btn-mini" onClick={() => {
                    setEditingId(goal.id);
                    setTempData({ current: goal.current, target: goal.target });
                  }}>✎</button>
                )}
              </div>

              {editingId === goal.id ? (
                <div className="goal-inputs">
                  <input type="number" value={tempData.current} onChange={e => setTempData({ ...tempData, current: e.target.value })} />
                  <span>/</span>
                  <input type="number" value={tempData.target} onChange={e => setTempData({ ...tempData, target: e.target.value })} />
                </div>
              ) : (
                <>
                  <div className="progress-container">
                    <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="goal-metrics">
                    <span>${Number(goal.current).toLocaleString()}</span>
                    <span>{percent}% Complete</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .goal-actions > button{
          margin: 5px;
        }
        .goals-stack {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .goal-item {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .goal-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .goal-label {
            font-size: 14px;
            font-weight: 700;
            color: var(--text);
        }

        .progress-container {
            width: 100%;
            height: 8px;
            background: var(--border-muted);
            border-radius: 10px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--secondary);
            border-radius: 10px;
            transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .goal-metrics {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .edit-btn-mini {
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.2s;
        }

        .goal-item:hover .edit-btn-mini {
            opacity: 1;
        }

        .goal-inputs {
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .goal-inputs input {
            flex: 1;
            background: var(--bg-dark);
            border: 1px solid var(--border-muted);
            color: var(--text);
            padding: 4px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            width: 80px;
        }
      `}</style>
    </section>
  );
}

export default DreamGoals;
