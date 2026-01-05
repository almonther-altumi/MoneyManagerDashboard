
import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, getDocs, addDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";

const ExpenseTable = forwardRef((props, ref) => {
    const [expenseData, setExpenseData] = useState([]);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowData, setNewRowData] = useState({
        date: "",
        title: "",
        category: "",
        paymentMethod: "",
        amount: ""
    });

    const { notification, showNotification, hideNotification } = useNotification();

    const fetchExpenseData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const expenseCollectionRef = collection(db, "users", user.uid, "expenses");
        getDocs(expenseCollectionRef)
            .then((querySnapshot) => {
                const expenseList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate().toLocaleDateString() : new Date(doc.data().date).toLocaleDateString(),
                }));
                setExpenseData(expenseList);
            })
            .catch(err => console.error("Error fetching expenses:", err));
    };

    const AddExpense = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                showNotification("User not logged in", "error");
                return;
            }

            await addDoc(collection(db, "users", user.uid, "expenses"), {
                title: newRowData.title,
                amount: parseFloat(newRowData.amount),
                date: new Date(newRowData.date),
                category: newRowData.category,
                paymentMethod: newRowData.paymentMethod,
            });

            showNotification("Expense added successfully!", "success");
            setIsAddingNew(false);
            setNewRowData({ date: "", title: "", category: "", paymentMethod: "", amount: "" });
            fetchExpenseData();
            if (props.onDataChange) props.onDataChange();
        } catch (e) {
            console.error("Error adding expense: ", e);
            showNotification("Failed to add expense", "error");
        }
    };

    const deleteExpenseRow = async (id) => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            await deleteDoc(doc(db, "users", user.uid, "expenses", id));
            showNotification("Expense deleted", "success");
            fetchExpenseData();
            if (props.onDataChange) props.onDataChange();
        } catch (e) {
            console.error("Error deleting expense:", e);
            showNotification("Delete failed", "error");
        }
    };

    const handleAddNewRow = () => setIsAddingNew(true);
    const handleInputChange = (field, value) => setNewRowData(prev => ({ ...prev, [field]: value }));

    const inputRefs = useRef({});
    const handleKeyPress = (e, currentField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const fields = ['date', 'title', 'category', 'paymentMethod', 'amount'];
            const currentIndex = fields.indexOf(currentField);
            if (currentIndex < fields.length - 1) {
                const nextField = fields[currentIndex + 1];
                if (inputRefs.current[nextField]) inputRefs.current[nextField].focus();
            } else {
                AddExpense();
            }
        }
    };

    useImperativeHandle(ref, () => ({ addNewRow: handleAddNewRow }));

    useEffect(() => {
        fetchExpenseData();
    }, []);

    return (
        <>
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
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAddingNew && (
                            <tr className="adding-new-row">
                                <td><input type="text" className="table-input" value={newRowData.date} onChange={(e) => handleInputChange('date', e.target.value)} onKeyDown={(e) => handleKeyPress(e, 'date')} ref={(el) => inputRefs.current['date'] = el} autoFocus /></td>
                                <td><input type="text" className="table-input" value={newRowData.title} onChange={(e) => handleInputChange('title', e.target.value)} onKeyDown={(e) => handleKeyPress(e, 'title')} ref={(el) => inputRefs.current['title'] = el} /></td>
                                <td><input type="text" className="table-input" value={newRowData.category} onChange={(e) => handleInputChange('category', e.target.value)} onKeyDown={(e) => handleKeyPress(e, 'category')} ref={(el) => inputRefs.current['category'] = el} /></td>
                                <td><input type="text" className="table-input" value={newRowData.paymentMethod} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} onKeyDown={(e) => handleKeyPress(e, 'paymentMethod')} ref={(el) => inputRefs.current['paymentMethod'] = el} /></td>
                                <td><input type="number" className="table-input amount" value={newRowData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} onKeyDown={(e) => handleKeyPress(e, 'amount')} ref={(el) => inputRefs.current['amount'] = el} /></td>
                                <td className="row-actions">
                                    <button className="action-icon-btn save" onClick={AddExpense}>✓</button>
                                    <button className="action-icon-btn cancel" onClick={() => setIsAddingNew(false)}>✕</button>
                                </td>
                            </tr>
                        )}
                        {expenseData.map((expense) => (
                            <tr key={expense.id}>
                                <td>{expense.date}</td>
                                <td>{expense.title}</td>
                                <td>{expense.category}</td>
                                <td>{expense.paymentMethod}</td>
                                <td className="amount-cell">${expense.amount}</td>
                                <td className="row-actions">
                                    <button className="action-icon-btn delete" onClick={() => deleteExpenseRow(expense.id)}>🗑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .table-input {
                    background: var(--bg-dark);
                    border: 1px solid var(--border-muted);
                    color: var(--text);
                    padding: 8px 12px;
                    border-radius: 8px;
                    width: 100%;
                    font-size: 14px;
                    outline: none;
                }
                .table-input:focus { border-color: var(--secondary); }
                .amount-cell { font-weight: 800; color: var(--danger); }
                .row-actions { display: flex; gap: 8px; }
            `}</style>
        </>
    );
});

export default ExpenseTable;
