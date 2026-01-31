import React, { useEffect, useState } from 'react';
import '../components/Styles/DebtsPageStyles/DebtsPageStyle.css';
import DebtCard from '../components/DebtsPageComponents/DebtCard';
import DebtHistoryModal from '../components/DebtsPageComponents/DebtHistoryModal';
import AddDebtModal from '../components/DebtsPageComponents/AddDebtModal';
import ConfirmationModal from '../components/DebtsPageComponents/ConfirmationModal';
import EditableStatCard from '../components/HomePageComponents/EditableStatCard';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useTranslation } from 'react-i18next';
import { useFinancialData } from '../hooks/useFinancialData';

function DebtsPage() {
    const { t } = useTranslation();
    const { debts, refreshData, loading } = useFinancialData();
    const [monthlyRepayment, setMonthlyRepayment] = useState(2400);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortOrder, setSortOrder] = useState('highest');
    const [deletedDebtIds, setDeletedDebtIds] = useState([]); // Track deleted debts for optimistic UI

    // Confirmation Modal State
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        isOpen: false,
        debtId: null
    });

    // Sort debts and filter out deleted ones
    const sortedDebts = [...debts]
        .filter(debt => !deletedDebtIds.includes(debt.id)) // Exclude deleted debts
        .sort((a, b) => {
            const remainingA = Number(a.remaining) || 0;
            const remainingB = Number(b.remaining) || 0;
            if (sortOrder === 'highest') return remainingB - remainingA;
            return remainingA - remainingB;
        });

    // Calculate debt stats (excluding deleted debts)
    const debtStats = (() => {
        let totalRemaining = 0;
        let totalInitial = 0;
        debts
            .filter(debt => !deletedDebtIds.includes(debt.id))
            .forEach(debt => {
                totalRemaining += Number(debt.remaining) || 0;
                totalInitial += Number(debt.amount) || 0;
            });
        const totalPaid = totalInitial - totalRemaining;
        const overallProgress = totalInitial > 0 ? (totalPaid / totalInitial) * 100 : 0;
        return { totalRemaining, totalPaid, overallProgress: Math.round(overallProgress) };
    })();

    const handleCardClick = (debt) => {
        setSelectedDebt(debt);
        setIsHistoryOpen(true);
    };

    const handleCloseHistory = () => {
        setIsHistoryOpen(false);
        setSelectedDebt(null);
    };

    const fetchRepaymentAmount = async (user) => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            const settingsSnap = await getDoc(settingsRef);
            if (settingsSnap.exists()) {
                setMonthlyRepayment(settingsSnap.data().monthlyRepayment || 2400);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSaveRepayment = async (newValue) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "stats");
            await setDoc(settingsRef, { monthlyRepayment: Number(newValue) }, { merge: true });
            setMonthlyRepayment(Number(newValue));
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateDebt = async (debtId, newData) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const debtRef = doc(db, "users", user.uid, "debts", debtId);
            await updateDoc(debtRef, newData);
            if (refreshData) refreshData();
        } catch (error) {
            console.error(error);
            alert("Update failed");
        }
    };

    // 1. Trigger Modal
    const handleDeleteDebt = (debtId) => {
        setDeleteConfirmation({ isOpen: true, debtId });
    };

    // 2. Confirm Delete
    const confirmDeleteDebt = async () => {
        const user = auth.currentUser;
        if (!user || !deleteConfirmation.debtId) return;

        const debtIdToDelete = deleteConfirmation.debtId;

        try {
            // Optimistic UI update: hide the debt immediately
            setDeletedDebtIds(prev => [...prev, debtIdToDelete]);
            setDeleteConfirmation({ isOpen: false, debtId: null });
            setIsHistoryOpen(false);

            // Perform actual deletion
            const debtRef = doc(db, "users", user.uid, "debts", debtIdToDelete);
            await deleteDoc(debtRef);

            // Refresh data from server
            if (refreshData) {
                await refreshData();
                // Clear deleted IDs after refresh completes
                setDeletedDebtIds(prev => prev.filter(id => id !== debtIdToDelete));
            }
        } catch (error) {
            console.error("Error deleting debt:", error);
            alert("Failed to delete debt");
            // Revert optimistic update on error
            setDeletedDebtIds(prev => prev.filter(id => id !== debtIdToDelete));
        }
    };

    // Add New Debt
    const handleAddNewDebt = async ({ name, reason, amount }) => {
        const user = auth.currentUser;
        if (!user) return;
        try {
            const { collection, addDoc } = await import("firebase/firestore");
            const debtsRef = collection(db, "users", user.uid, "debts");
            await addDoc(debtsRef, {
                name,
                reason,
                amount,
                remaining: amount,
                history: []
            });
            if (refreshData) refreshData();
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchRepaymentAmount(user);
            } else {
                setMonthlyRepayment(2400);
            }
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="debts-page-root">
            <div className="debts-content-centered">
                <header className="debts-header">
                    <h2>{t('debts.title')}</h2>
                    <p>{t('debts.intro')}</p>
                </header>

                <div className="debts-stats-row">
                    <div className="stat-card">
                        <span className="label">{t('debts.total_liabilities')}</span>
                        <span className="amount">${debtStats.totalRemaining.toLocaleString()}</span>
                        <span className="trend">{t('debts.remaining_balance')}</span>
                    </div>
                    <EditableStatCard
                        label={t('debts.monthly_strategy')}
                        value={monthlyRepayment}
                        trend={t('debts.settlement_target')}
                        onSave={handleSaveRepayment}
                        color="var(--secondary)"
                    />
                    <div className="stat-card">
                        <span className="label">{t('debts.settled_assets')}</span>
                        <span className="amount">{debtStats.overallProgress}%</span>
                        <div className="progress-bar-mini">
                            <div className="progress-fill" style={{ width: `${debtStats.overallProgress}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="debts-view-container">
                    <div className="section-header-grid">
                        <div className="header-left-actions">
                            <h3>{t('debts.my_debts')}</h3>
                            <button className="sort-btn" onClick={() => setSortOrder(prev => prev === 'highest' ? 'lowest' : 'highest')}>
                                {t('debts.sort_label')}: {sortOrder === 'highest' ? t('debts.high_to_low') : t('debts.low_to_high')}
                            </button>
                        </div>
                        <button className="add-btn-grid" onClick={() => setIsAddModalOpen(true)}>
                            {t('debts.new_debt')}
                        </button>
                    </div>

                    <div className="debts-grid-squares">
                        {loading ? (
                            /* Loading Skeletons */
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="skeleton-card">
                                    <div className="skeleton-avatar"></div>
                                    <div className="skeleton-info">
                                        <div className="skeleton-line title"></div>
                                        <div className="skeleton-line detail"></div>
                                    </div>
                                    <div className="skeleton-right">
                                        <div className="skeleton-line amount"></div>
                                        <div className="skeleton-progress"></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {sortedDebts.map(debt => (
                                    <DebtCard
                                        key={debt.id}
                                        debt={debt}
                                        onClick={handleCardClick}
                                    />
                                ))}
                                {debts.length === 0 && (
                                    <div className="empty-state-grid">
                                        <p>{t('debts.no_active_debts')}</p>
                                        <button onClick={() => setIsAddModalOpen(true)}>{t('debts.add_one')}</button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isHistoryOpen && selectedDebt && (
                <DebtHistoryModal
                    debt={selectedDebt}
                    onClose={handleCloseHistory}
                    onUpdate={handleUpdateDebt}
                    onDelete={handleDeleteDebt}
                />
            )}

            {isAddModalOpen && (
                <AddDebtModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAdd={handleAddNewDebt}
                />
            )}

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                title={t('debts.delete_title')}
                message={t('debts.delete_message')}
                onConfirm={confirmDeleteDebt}
                onCancel={() => setDeleteConfirmation({ isOpen: false, debtId: null })}
                confirmText={t('debts.confirm_delete')}
                cancelText={t('debts.cancel')}
                isDanger={true}
            />

            <style>{`
                .debts-view-container {
                    margin-top: 40px;
                }

                .section-header-grid {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .header-left-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .section-header-grid h3 {
                    margin: 0;
                    color: var(--text);
                }

                .sort-btn {
                    background: var(--bg-light);
                    border: 1px solid var(--border-muted);
                    color: var(--text-muted);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }
                .sort-btn:hover {
                    color: var(--text);
                    border-color: var(--primary);
                    background: var(--bg);
                }

                .add-btn-grid {
                    background: var(--primary);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                /* RESPONSIVE GRID LAYOUT */
                .debts-grid-squares {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(clamp(320px, 100%, 400px), 1fr));
                    gap: 32px;
                    width: 100%;
                    box-sizing: border-box;
                }

                @media (max-width: 1024px) {
                    .debts-grid-squares {
                        grid-template-columns: 1fr;
                    }
                }

                .empty-state-grid {
                    grid-column: 1 / -1;
                    padding: 40px;
                    text-align: center;
                    background: var(--bg-light);
                    border-radius: 20px;
                    color: var(--text-muted);
                }
                .empty-state-grid button {
                    margin-top: 10px;
                    background: transparent;
                    border: 1px solid var(--border-muted);
                    padding: 8px 16px;
                    border-radius: 8px;
                    color: var(--primary);
                    cursor: pointer;
                }
                
                @media (max-width: 768px) {
                    .debts-grid-squares {
                        grid-template-columns: 1fr !important;
                        gap: 16px;
                    }
                    .section-header-grid {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .header-left-actions {
                        justify-content: space-between;
                        width: 100%;
                    }
                    .add-btn-grid {
                        width: 100%;
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
}

export default DebtsPage;
