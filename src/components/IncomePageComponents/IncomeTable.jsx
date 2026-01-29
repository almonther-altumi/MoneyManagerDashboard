import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import { useTranslation } from "react-i18next";
import "../Styles/TableStyle.css"
import { useFinancialData } from "../../contexts/FinancialContext";

const IncomeTable = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const { income: incomeData, refreshData } = useFinancialData();

    // State for the new editable row
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowData, setNewRowData] = useState({
        date: "",
        title: "",
        category: "",
        paymentMethod: "",
        amount: ""
    });

    // Expose functions to parent via ref
    useImperativeHandle(ref, () => ({
        addNewRow() {
            setIsAddingNew(true);
            const now = new Date().toISOString().split('T')[0];
            setNewRowData({
                date: now,
                title: "",
                category: "",
                paymentMethod: "",
                amount: ""
            });
        }
    }));

    // State for editing rows
    const [editingId, setEditingId] = useState(null);
    const [editRowData, setEditRowData] = useState({
        date: "",
        title: "",
        category: "",
        paymentMethod: "",
        amount: ""
    });

    // Use notification hook
    const { notification, showNotification, hideNotification } = useNotification();

    const AddIncome = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                showNotification("User not logged in", "error");
                return;
            }

            // users > userId > his : income , expenses and other collections 
            const incomeDate = newRowData.date || new Date().toISOString().split('T')[0];

            await addDoc(collection(db, "users", user.uid, "income"), {
                title: newRowData.title,
                amount: parseFloat(newRowData.amount),
                date: incomeDate,
                category: newRowData.category,
                paymentMethod: newRowData.paymentMethod,
            });
            // Actually, the original stored a Date object (Timestamp).
            // But the context raw data will have Timestamp objects. 
            // My context code `...doc.data()` spreads the Timestamp.
            // I need to format it for display in the table map.

            showNotification("Income added successfully!", "success");

            // Reset fields
            setIsAddingNew(false);
            setNewRowData({
                date: "",
                title: "",
                category: "",
                paymentMethod: "",
                amount: ""
            });

            // Update global data
            refreshData();

        } catch (e) {
            console.error("Error adding income: ", e);
            showNotification("Failed to add income", "error");
        }
    };

    const handleInputChange = (field, value) => {
        setNewRowData(prev => ({ ...prev, [field]: value }));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            AddIncome();
        } else if (e.key === 'Escape') {
            setIsAddingNew(false);
        }
    };
    // Refs for the input fields
    const inputRefs = useRef({});

    // fetchIncomeData removed in favor of context

    async function deleteIncomeRow(id) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await deleteDoc(doc(db, "users", user.uid, "income", id))
            showNotification("Item deleted successfully!", "success")

            refreshData();
        }
        catch (error) {
            console.log(error)
            showNotification("Failed to delete item", "error")
        }
    }

    const startEditing = (income) => {
        setEditingId(income.id);
        // income.date from context might be Timestamp or string depending on how it was saved.
        // I need to handle display formatting.
        // For now, I'll assume I handle it in the map function below or here.
        // Let's inspect how I render it.
        // In render: `{income.date}`.
        // If income.date is Timestamp from context, this will break.
        // I should stick to the original logic where I format it.
        setEditRowData({
            date: formatDisplayDate(income.date),
            title: income.title,
            category: income.category,
            paymentMethod: income.paymentMethod,
            amount: String(income.amount).replace('$', '').replace(',', '')
        });
    };

    const handleEditChange = (field, value) => {
        setEditRowData(prev => ({ ...prev, [field]: value }));
    };

    const updateIncomeRow = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const incomeDocRef = doc(db, "users", user.uid, "income", editingId);
            await updateDoc(incomeDocRef, {
                title: editRowData.title,
                amount: parseFloat(editRowData.amount),
                date: new Date(editRowData.date),
                category: editRowData.category,
                paymentMethod: editRowData.paymentMethod
            });

            showNotification("Income updated successfully!", "success");
            setEditingId(null);
            refreshData();
        } catch (error) {
            console.error("Error updating income:", error);
            showNotification("Failed to update income", "error");
        }
    };

    // Helper to format date consistent with original
    const formatDisplayDate = (dateVal) => {
        if (!dateVal) return "";
        try {
            let d;
            if (dateVal.toDate) {
                d = dateVal.toDate();
            } else if (typeof dateVal === 'string') {
                d = new Date(dateVal);
            } else {
                d = new Date(dateVal);
            }

            if (isNaN(d.getTime())) return dateVal;

            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return dateVal;
        }
    };


    return (
        <>
            {/* Notification Component */}
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>{t('table.date')}</th>
                            <th>{t('table.description')}</th>
                            <th>{t('table.category')}</th>
                            <th>{t('table.method')}</th>
                            <th >{t('table.amount')}</th>
                            <th>{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* New Editable Row at top */}
                        {isAddingNew && (
                            <tr className="adding-new-row">
                                <td>
                                    <input
                                        type="date"
                                        className="table-input"
                                        value={newRowData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'date')}
                                        ref={(el) => inputRefs.current['date'] = el}
                                        autoFocus
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder={t('table.placeholder_source')}
                                        className="table-input"
                                        value={newRowData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'title')}
                                        ref={(el) => inputRefs.current['title'] = el}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder={t('table.placeholder_category')}
                                        className="table-input"
                                        value={newRowData.category}
                                        onChange={(e) => handleInputChange('category', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'category')}
                                        ref={(el) => inputRefs.current['category'] = el}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        placeholder={t('table.placeholder_method')}
                                        className="table-input"
                                        value={newRowData.paymentMethod}
                                        onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'paymentMethod')}
                                        ref={(el) => inputRefs.current['paymentMethod'] = el}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        placeholder={t('table.placeholder_amount')}
                                        className="table-input amount"
                                        value={newRowData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'amount')}
                                        ref={(el) => inputRefs.current['amount'] = el}
                                    />
                                </td>
                                <td className="row-actions">
                                    <button className="action-icon-btn save" onClick={AddIncome} title={t('table.save')}>✓</button>
                                    <button className="action-icon-btn cancel" onClick={() => setIsAddingNew(false)} title={t('table.cancel')}>✕</button>
                                </td>
                            </tr>
                        )}

                        {incomeData.length === 0 && !isAddingNew ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>{t('table.empty_income')}</td>
                            </tr>
                        ) : (
                            <>
                                {/* Existing income data rows */}
                                {incomeData.map((income) => (
                                    <tr key={income.id}>
                                        {editingId === income.id ? (
                                            <>
                                                <td><input type="text" className="table-input" value={editRowData.date} onChange={(e) => handleEditChange('date', e.target.value)} /></td>
                                                <td><input type="text" className="table-input" value={editRowData.title} onChange={(e) => handleEditChange('title', e.target.value)} /></td>
                                                <td><input type="text" className="table-input" value={editRowData.category} onChange={(e) => handleEditChange('category', e.target.value)} /></td>
                                                <td><input type="text" className="table-input" value={editRowData.paymentMethod} onChange={(e) => handleEditChange('paymentMethod', e.target.value)} /></td>
                                                <td><input type="number" className="table-input amount" value={editRowData.amount} onChange={(e) => handleEditChange('amount', e.target.value)} /></td>
                                                <td className="row-actions">
                                                    <button className="action-icon-btn save" onClick={updateIncomeRow} title={t('table.save')}>✓</button>
                                                    <button className="action-icon-btn cancel" onClick={() => setEditingId(null)} title={t('table.cancel')}>✕</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{formatDisplayDate(income.date)}</td>
                                                <td>{income.title}</td>
                                                <td><span className="category-income-badge">{income.category || 'General'}</span></td>
                                                <td>{income.paymentMethod || 'Bank'}</td>
                                                <td className="amount-income-cell">${income.amount}</td>
                                                <td className="row-actions">
                                                    <button className="action-icon-btn edit" onClick={() => startEditing(income)} title="Edit">✎</button>
                                                    <button className="action-icon-btn delete" onClick={() => deleteIncomeRow(income.id)} title="Delete">🗑</button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </>
                        )}
                    </tbody>
                </table>

            </div>


        </>


    );
});

export default IncomeTable;