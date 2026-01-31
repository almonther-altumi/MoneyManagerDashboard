import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import { useTranslation } from "react-i18next";


import "../Styles/DebtsPageStyles/DebtsTableStyle.css"
import { useFinancialData } from "../../hooks/useFinancialData";

const DebtsTable = forwardRef((props, ref) => {
    const { t } = useTranslation();
    // Access global context data
    const { debts: debtsData, refreshData } = useFinancialData();

    // State for local UI
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowData, setNewRowData] = useState({ date: "", title: "", amount: "", remaining: "" });

    const [editingId, setEditingId] = useState(null);
    const [editRowData, setEditRowData] = useState({});

    const { notification, showNotification, hideNotification } = useNotification();
    const inputRefs = useRef({});

    // fetchDebtsData removed

    // Adding a new debt to database
    const AddDebt = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const payoffStatus = ((parseFloat(newRowData.amount) - parseFloat(newRowData.remaining)) / parseFloat(newRowData.amount)) * 100;

            await addDoc(collection(db, "users", user.uid, "debts"), {
                ...newRowData,

                amount: parseFloat(newRowData.amount) ?? 0,
                remaining: parseFloat(newRowData.remaining) ?? 1,
                progress: Math.max(0, Math.min(100, payoffStatus)),

            });

            showNotification("Debt recorded successfully!", "success");
            setIsAddingNew(false);
            setNewRowData({ date: "", title: "", amount: "", remaining: "" });

            refreshData();
            // if (props.onDataChange) props.onDataChange();
        } catch (e) {
            showNotification("Failed to record debt", "error");
            console.log('field to record bro the error is : ' + e)
        }
    };

    // حذف صف
    const deleteDebtRow = async (id) => {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "debts", id));
        showNotification("Debt cleared", "success");
        refreshData();
        // if (props.onDataChange) props.onDataChange();
    };

    // بدء التعديل على صف
    const startEditing = (debt) => {
        setEditingId(debt.id);
        setEditRowData({ ...debt });
    };

    // تعديل القيم داخل الصف
    const handleEditChange = (field, value) => {
        setEditRowData(prev => ({ ...prev, [field]: value }));
    };

    // حفظ التعديل
    const updateDebtRow = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const debtRef = doc(db, "users", user.uid, "debts", editingId);
            const progress = ((editRowData.amount - editRowData.remaining) / editRowData.amount) * 100;

            await updateDoc(debtRef, {
                ...editRowData,
                amount: parseFloat(editRowData.amount),
                remaining: parseFloat(editRowData.remaining),
                progress: Math.max(0, Math.min(100, progress))
            });

            showNotification("Debt updated successfully!", "success");
            setEditingId(null);
            refreshData();
            // if (props.onDataChange) props.onDataChange();
        } catch (e) {
            console.log("Failed to update debt : ", e)
            showNotification("Failed to update debt", "error");
        }
    };

    // when pressing Enter go to next column 
    const handleKeyPress = (e, currentField) => {
        if (e.key === 'Enter') {
            const fields = ['date', 'title', 'amount', 'remaining']; // four columns 
            const idx = fields.indexOf(currentField);
            if (idx < fields.length - 1) {
                inputRefs.current[fields[idx + 1]]?.focus();
            } else {
                AddDebt();
            }
        }
    };

    // able to make a new row for adding new debt
    useImperativeHandle(ref, () => ({ addNewRow: () => setIsAddingNew(true) }));

    // useEffect fetch removed

    return (
        <>
            <Notification show={notification.show} message={notification.message} type={notification.type} onClose={hideNotification} />

            <div className="table-wrapper">
                <table className="luxury-table">
                    <thead>
                        <tr>
                            <th>{t('table.date')}</th>
                            <th>{t('table.obligation')}</th>
                            <th>{t('table.total_principal')}</th>
                            <th>{t('table.current_balance')}</th>
                            <th>{t('table.liquidation')}</th>
                            <th>{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {debtsData.length === 0 && !isAddingNew ? (
                            <tr>
                                <td colSpan="6" className="empty-table-message">
                                    <div className="empty-state-content">
                                        <p>{t('table.empty_debts')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            isAddingNew && (
                                <tr className="adding-row">
                                    <td data-label={t('table.date')}><input className="table-input" value={newRowData.date} onChange={e => setNewRowData({ ...newRowData, date: e.target.value })} onKeyDown={e => handleKeyPress(e, 'date')} ref={el => inputRefs.current['date'] = el} autoFocus /></td>
                                    <td data-label={t('table.obligation')}><input className="table-input" value={newRowData.title} onChange={e => setNewRowData({ ...newRowData, title: e.target.value })} onKeyDown={e => handleKeyPress(e, 'title')} ref={el => inputRefs.current['title'] = el} /></td>
                                    <td data-label={t('table.total_principal')}><input className="table-input" value={newRowData.amount} onChange={e => setNewRowData({ ...newRowData, amount: e.target.value })} onKeyDown={e => handleKeyPress(e, 'amount')} ref={el => inputRefs.current['amount'] = el} /></td>
                                    <td data-label={t('table.current_balance')}><input className="table-input" value={newRowData.remaining} onChange={e => setNewRowData({ ...newRowData, remaining: e.target.value })} onKeyDown={e => handleKeyPress(e, 'remaining')} ref={el => inputRefs.current['remaining'] = el} /></td>
                                    <td data-label={t('table.liquidation')}>--</td>
                                    <td className="row-actions"><button className="action-icon-btn save" onClick={AddDebt}>✓</button></td>
                                </tr>
                            ))}

                        {debtsData.map(debt => (
                            <tr key={debt.id}>
                                {editingId === debt.id ? (
                                    <>
                                        <td data-label={t('table.date')}><input className="table-input" value={editRowData.date} onChange={e => handleEditChange('date', e.target.value)} /></td>
                                        <td data-label={t('table.obligation')}><input className="table-input" value={editRowData.title} onChange={e => handleEditChange('title', e.target.value)} /></td>
                                        <td data-label={t('table.total_principal')}><input type="number" className="table-input" value={editRowData.amount} onChange={e => handleEditChange('amount', e.target.value)} /></td>
                                        <td data-label={t('table.current_balance')}><input type="number" className="table-input" value={editRowData.remaining} onChange={e => handleEditChange('remaining', e.target.value)} /></td>
                                        <td data-label={t('table.liquidation')}>--</td>
                                        <td className="row-actions">
                                            <button className="action-icon-btn save" onClick={updateDebtRow}>✓</button>
                                            <button className="action-icon-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td data-label={t('table.date')}>{debt.date}</td>
                                        <td data-label={t('table.obligation')} style={{ fontWeight: '600' }}>{debt.title}</td>
                                        <td data-label={t('table.total_principal')}>${debt.amount}</td>
                                        <td data-label={t('table.current_balance')} style={{ color: 'var(--danger)', fontWeight: 700 }}>${debt.remaining}</td>
                                        <td data-label={t('table.liquidation')} className="progress-cell">
                                            <div className="progress-bar-mini">
                                                <div className="progress-fill" style={{ width: `${debt.progress}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{Math.round(debt.progress)}%</span>
                                        </td>
                                        <td className="row-actions">
                                            <button className="action-icon-btn edit" onClick={() => startEditing(debt)}>✎</button>
                                            <button className="action-icon-btn delete" onClick={() => deleteDebtRow(debt.id)}>🗑️</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </>
    );
});

export default DebtsTable;
