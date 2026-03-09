
import React, { useState, useEffect } from 'react';
import { db, auth } from "../../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { useTranslation } from 'react-i18next';

const DEFAULT_GOALS = [
  { id: 'car', labelKey: 'car', current: 2000, target: 100000, monthly: 0, icon: 'car' },
  { id: 'house', labelKey: 'house', current: 15000, target: 300000, monthly: 0, icon: 'house' }
];
const MAX_GOALS = 5;

function DreamGoals() {
  const { t, i18n } = useTranslation();
  const [goals, setGoals] = useState(DEFAULT_GOALS);
  const [editingId, setEditingId] = useState(null);
  const [tempData, setTempData] = useState({ label: '', current: 0, target: 0, monthly: 0 });

  const normalizeGoal = (goal) => ({
    id: goal.id || `goal_${Date.now()}`,
    label: typeof goal.label === 'string' ? goal.label : '',
    labelKey: goal.labelKey || null,
    current: Number(goal.current) || 0,
    target: Number(goal.target) || 0,
    monthly: Number(goal.monthly) || 0,
    icon: goal.icon || 'target'
  });

  const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`;

  const getGoalLabel = (goal) => {
    const customLabel = (goal.label || '').trim();
    if (customLabel) return customLabel;
    if (goal.labelKey) return t(`dream.${goal.labelKey}`);
    return t('dream.unnamed_goal');
  };

  const addMonths = (date, months) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
  };

  const getEstimateText = (goal) => {
    const current = Number(goal.current) || 0;
    const target = Number(goal.target) || 0;
    const monthly = Number(goal.monthly) || 0;
    if (target <= 0) return t('dream.estimate_unavailable');
    if (current >= target) return t('dream.goal_achieved');
    if (monthly <= 0) return t('dream.estimate_unavailable');
    const remaining = Math.max(0, target - current);
    const months = Math.max(1, Math.ceil(remaining / monthly));
    const estimatedDate = addMonths(new Date(), months);
    const formattedDate = estimatedDate.toLocaleDateString(
      i18n?.language === 'ar' ? 'ar-u-nu-latn' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
    return t('dream.estimate_text', {
      date: formattedDate,
      amount: formatCurrency(monthly)
    });
  };

  const persistGoals = async (nextGoals) => {
    const user = auth.currentUser;
    if (!user) return;
    const goalsRef = doc(db, "users", user.uid, "settings", "goals");
    const items = nextGoals.map(({ isNew, ...goal }) => ({
      ...normalizeGoal(goal)
    }));
    await setDoc(goalsRef, { items }, { merge: true });
  };

  useEffect(() => {
    const fetchGoals = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const goalsRef = doc(db, "users", user.uid, "settings", "goals");
      const goalsSnap = await getDoc(goalsRef);
      if (goalsSnap.exists()) {
        const data = goalsSnap.data();
        if (Array.isArray(data.items)) {
          const normalized = data.items.map(normalizeGoal);
          setGoals(normalized.length ? normalized : DEFAULT_GOALS);
        } else {
          const legacy = DEFAULT_GOALS.map(goal => {
            const stored = data[goal.id] || {};
            return normalizeGoal({
              ...goal,
              current: stored.current ?? goal.current,
              target: stored.target ?? goal.target,
              monthly: stored.monthly ?? goal.monthly,
              label: stored.label ?? goal.label
            });
          });
          setGoals(legacy);
        }
      }
    };
    const unsubscribe = auth.onAuthStateChanged((u) => u && fetchGoals());// subscrive
    return () => unsubscribe();
  }, []);

  const handleSave = async (id) => {
    try {
      const updated = goals.map(g => {
        if (g.id !== id) return g;
        return {
          ...g,
          label: (tempData.label || '').trim(),
          current: Number(tempData.current) || 0,
          target: Number(tempData.target) || 0,
          monthly: Number(tempData.monthly) || 0,
          isNew: false
        };
      });
      await persistGoals(updated);
      setGoals(updated.map(({ isNew, ...goal }) => goal));
      setEditingId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddGoal = async () => {
    if (goals.length >= MAX_GOALS) return;
    const newGoal = {
      id: `goal_${Date.now()}`,
      label: '',
      labelKey: null,
      current: 0,
      target: 0,
      monthly: 0,
      icon: 'target',
      isNew: true
    };
    const nextGoals = [...goals, newGoal];
    setGoals(nextGoals);
    setEditingId(newGoal.id);
    setTempData({ label: '', current: 0, target: 0, monthly: 0 });
    try {
      await persistGoals(nextGoals);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelEdit = async () => {
    const goal = goals.find(g => g.id === editingId);
    if (goal?.isNew) {
      const updated = goals.filter(g => g.id !== editingId);
      setGoals(updated);
      try {
        await persistGoals(updated);
      } catch (e) {
        console.error(e);
      }
    }
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    try {
      const updated = goals.filter(g => g.id !== id);
      setGoals(updated);
      if (editingId === id) setEditingId(null);
      await persistGoals(updated);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="card dream-card luxury-card">
      <div className="budget-header-box goals-header">
        <h3>{t('dream.title')}</h3>
        <button
          className="goal-add-btn"
          type="button"
          onClick={handleAddGoal}
          disabled={goals.length >= MAX_GOALS}
        >
          + {t('dream.add_goal')}
        </button>
      </div>

      <div className="goals-stack">
        {goals.map(goal => {
          const target = Number(goal.target) || 0;
          const current = Number(goal.current) || 0;
          const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
          const estimateText = getEstimateText(goal);

          return (
            <div className="goal-item" key={goal.id}>
              <div className="goal-info-row">
                <span className="goal-label">{getGoalLabel(goal)}</span>
                {editingId === goal.id ? (
                  <div className="goal-actions">
                    <button
                      className="goal-action-btn save"
                      type="button"
                      title={t('dream.save')}
                      aria-label={t('dream.save')}
                      onClick={() => handleSave(goal.id)}
                    >
                      {t('dream.save')}
                    </button>
                    <button
                      className="goal-action-btn cancel"
                      type="button"
                      title={t('dream.cancel')}
                      aria-label={t('dream.cancel')}
                      onClick={handleCancelEdit}
                    >
                      {t('dream.cancel')}
                    </button>
                  </div>
                ) : (
                  <div className="goal-actions">
                    <button
                      className="goal-action-btn edit"
                      type="button"
                      title={t('dream.edit')}
                      aria-label={t('dream.edit')}
                      onClick={() => {
                        setEditingId(goal.id);
                        setTempData({
                          label: goal.label || '',
                          current: goal.current,
                          target: goal.target,
                          monthly: goal.monthly || 0
                        });
                      }}
                    >
                      {t('dream.edit')}
                    </button>
                    <button
                      className="goal-action-btn delete"
                      type="button"
                      title={t('dream.delete')}
                      aria-label={t('dream.delete')}
                      onClick={() => handleDelete(goal.id)}
                    >
                      {t('dream.delete')}
                    </button>
                  </div>
                )}
              </div>

              {editingId === goal.id ? (
                <div className="goal-inputs">
                  <label>
                    <span>{t('dream.goal_name')}</span>
                    <input
                      type="text"
                      value={tempData.label}
                      placeholder={getGoalLabel(goal)}
                      onChange={e => setTempData({ ...tempData, label: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>{t('dream.current_amount')}</span>
                    <input
                      type="number"
                      value={tempData.current}
                      onChange={e => setTempData({ ...tempData, current: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>{t('dream.target_amount')}</span>
                    <input
                      type="number"
                      value={tempData.target}
                      onChange={e => setTempData({ ...tempData, target: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>{t('dream.monthly_amount')}</span>
                    <input
                      type="number"
                      value={tempData.monthly}
                      onChange={e => setTempData({ ...tempData, monthly: e.target.value })}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className="progress-container">
                    <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                  </div>
                  <div className="goal-metrics">
                    <span>{formatCurrency(goal.current)}</span>
                    <span>{t('dream.complete', { percent })} {percent}%</span>
                  </div>
                  <div className="goal-subtext">
                    <span>{t('dream.monthly_amount')}: {formatCurrency(goal.monthly)}</span>
                  </div>
                  <div className="goal-estimate">{estimateText}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .goals-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        [dir="rtl"] .goals-header {
            flex-direction: row-reverse;
        }

        .goal-add-btn {
            background: var(--primary);
            color: var(--bg-light);
            border: none;
            padding: 6px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.2s ease, background 0.2s ease;
        }

        .goal-add-btn:hover {
            transform: translateY(-1px);
            background: var(--secondary);
        }
        .goal-add-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
            transform: none;
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
            gap: 10px;
        }

        .goal-label {
            font-size: 14px;
            font-weight: 700;
            color: var(--text);
        }

        .goal-actions {
            display: flex;
            gap: 6px;
        }

        .goal-action-btn {
            background: transparent;
            border: 1px solid var(--border-muted);
            color: var(--text-muted);
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .goal-action-btn:hover {
            border-color: var(--primary);
            color: var(--primary);
            background: rgba(15, 23, 42, 0.05);
        }

        .goal-action-btn.save {
            background: var(--primary);
            color: var(--bg-light);
            border-color: transparent;
        }

        .goal-action-btn.save:hover {
            background: var(--secondary);
            color: var(--bg-light);
        }

        .goal-action-btn.delete:hover {
            border-color: var(--danger);
            color: var(--danger);
            background: rgba(220, 38, 38, 0.08);
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
            letter-spacing: 0.4px;
        }

        .goal-subtext {
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .goal-estimate {
            font-size: 12px;
            font-weight: 600;
            color: var(--text-muted);
            line-height: 1.5;
        }

        .goal-inputs {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
        }

        .goal-inputs label {
            display: flex;
            flex-direction: column;
            gap: 4px;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
        }

        .goal-inputs input {
            background: var(--bg-dark);
            border: 1px solid var(--border-muted);
            color: var(--text);
            padding: 6px 8px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 700;
            width: 100%;
        }

        @media (max-width: 640px) {
            .goal-inputs {
                grid-template-columns: 1fr;
            }
        }
      `}</style>
    </section>
  );
}

export default DreamGoals;
