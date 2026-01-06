import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, getDocs, addDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";

const DebtsTable = forwardRef((props, ref) => {
    const [debtsData, setDebtsData] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowData, setNewRowData] = useState({ date: "", title: "", amount: "", remaining: "" });

    const [editingId, setEditingId] = useState(null);
    const [editRowData, setEditRowData] = useState({});

    const { notification, showNotification, hideNotification } = useNotification();
    const inputRefs = useRef({});

    // جلب البيانات
    const fetchDebtsData = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const debtsCollectionRef = collection(db, "users", user.uid, "debts");
        const snapshot = await getDocs(debtsCollectionRef);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDebtsData(list);
    };

    // إضافة دين جديد
    const AddDebt = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const payoffStatus = ((parseFloat(newRowData.amount) - parseFloat(newRowData.remaining)) / parseFloat(newRowData.amount)) * 100;

            await addDoc(collection(db, "users", user.uid, "debts"), {
                ...newRowData,
                amount: parseFloat(newRowData.amount),
                remaining: parseFloat(newRowData.remaining),
                progress: Math.max(0, Math.min(100, payoffStatus))
            });

            showNotification("Debt recorded successfully!", "success");
            setIsAddingNew(false);
            setNewRowData({ date: "", title: "", amount: "", remaining: "" });
            fetchDebtsData();
            if (props.onDataChange) props.onDataChange();
        } catch (e) {
            showNotification("Failed to record debt", "error");
        }
    };

    // حذف صف
    const deleteDebtRow = async (id) => {
        const user = auth.currentUser;
        if (!user) return;
        await deleteDoc(doc(db, "users", user.uid, "debts", id));
        showNotification("Debt cleared", "success");
        fetchDebtsData();
        if (props.onDataChange) props.onDataChange();
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
            fetchDebtsData();
            if (props.onDataChange) props.onDataChange();
        } catch (e) {
            showNotification("Failed to update debt", "error");
        }
    };

    // التنقل بين الحقول عند الضغط على Enter أثناء إضافة صف جديد
    const handleKeyPress = (e, currentField) => {
        if (e.key === 'Enter') {
            const fields = ['date', 'title', 'amount', 'remaining'];
            const idx = fields.indexOf(currentField);
            if (idx < fields.length - 1) {
                inputRefs.current[fields[idx + 1]]?.focus();
            } else {
                AddDebt();
            }
        }
    };

    // تمكين إضافة صف جديد من الخارج عبر ref
    useImperativeHandle(ref, () => ({ addNewRow: () => setIsAddingNew(true) }));

    useEffect(() => { fetchDebtsData(); }, []);

    return (
        <>
            <Notification show={notification.show} message={notification.message} type={notification.type} onClose={hideNotification} />

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Obligation</th>
                            <th>Total Principal</th>
                            <th>Current Balance</th>
                            <th>Liquidation</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* صف إضافة جديد */}
                        {isAddingNew && (
                            <tr className="adding-new-row">
                                <td><input className="table-input" value={newRowData.date} onChange={e => setNewRowData({ ...newRowData, date: e.target.value })} onKeyDown={e => handleKeyPress(e, 'date')} ref={el => inputRefs.current['date'] = el} autoFocus /></td>
                                <td><input className="table-input" value={newRowData.title} onChange={e => setNewRowData({ ...newRowData, title: e.target.value })} onKeyDown={e => handleKeyPress(e, 'title')} ref={el => inputRefs.current['title'] = el} /></td>
                                <td><input className="table-input" value={newRowData.amount} onChange={e => setNewRowData({ ...newRowData, amount: e.target.value })} onKeyDown={e => handleKeyPress(e, 'amount')} ref={el => inputRefs.current['amount'] = el} /></td>
                                <td><input className="table-input" value={newRowData.remaining} onChange={e => setNewRowData({ ...newRowData, remaining: e.target.value })} onKeyDown={e => handleKeyPress(e, 'remaining')} ref={el => inputRefs.current['remaining'] = el} /></td>
                                <td>--</td>
                                <td><button className="action-icon-btn save" onClick={AddDebt}>✓</button></td>
                            </tr>
                        )}

                        {/* صفوف الديون */}
                        {debtsData.map(debt => (
                            <tr key={debt.id}>
                                {editingId === debt.id ? (
                                    <>
                                        <td><input className="table-input" value={editRowData.date} onChange={e => handleEditChange('date', e.target.value)} /></td>
                                        <td><input className="table-input" value={editRowData.title} onChange={e => handleEditChange('title', e.target.value)} /></td>
                                        <td><input type="number" className="table-input" value={editRowData.amount} onChange={e => handleEditChange('amount', e.target.value)} /></td>
                                        <td><input type="number" className="table-input" value={editRowData.remaining} onChange={e => handleEditChange('remaining', e.target.value)} /></td>
                                        <td>--</td>
                                        <td>
                                            <button className="action-icon-btn save" onClick={updateDebtRow}>✓</button>
                                            <button className="action-icon-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{debt.date}</td>
                                        <td>{debt.title}</td>
                                        <td>${debt.amount}</td>
                                        <td style={{ color: 'var(--danger)', fontWeight: 700 }}>${debt.remaining}</td>
                                        <td>
                                            <div className="progress-bar-mini">
                                                <div className="progress-fill" style={{ width: `${debt.progress}%` }}></div>
                                            </div>
                                            <span style={{ fontSize: '10px', fontWeight: 800 }}>{Math.round(debt.progress)}%</span>
                                        </td>
                                        <td>
                                            <button className="action-icon-btn edit" onClick={() => startEditing(debt)}>✎</button>
                                            <button className="action-icon-btn delete" onClick={() => deleteDebtRow(debt.id)}>🗑</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-input { background: var(--bg-dark); border: 1px solid var(--border-muted); color: var(--text); padding: 8px; border-radius: 8px; width: 100%; outline: none; }
                .progress-bar-mini { width: 60px; height: 6px; background: var(--border-muted); border-radius: 10px; overflow: hidden; display: inline-block; margin-right: 8px; }
                .progress-fill { height: 100%; background: var(--secondary); transition: width 0.5s; }
                .action-icon-btn { margin-right: 5px; cursor: pointer; padding: 4px 8px; border-radius: 4px; border: none; color: white; }
                .action-icon-btn.edit {  }
                .action-icon-btn.delete {  }
                .action-icon-btn.save {  }
                .action-icon-btn.cancel {  }
            `}</style>
        </>
    );
});

export default DebtsTable;
