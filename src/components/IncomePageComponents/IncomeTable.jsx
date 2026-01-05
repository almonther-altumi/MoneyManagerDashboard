import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";

const IncomeTable = forwardRef((props, ref) => {
    // Store income data from firestore 
    const [incomeData, setIncomeData] = useState([]);

    // State for the new editable row
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newRowData, setNewRowData] = useState({
        date: "",
        title: "",
        category: "",
        paymentMethod: "",
        amount: ""
    });

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
            const docRef = await addDoc(collection(db, "users", user.uid, "income"), {
                title: newRowData.title,
                amount: parseFloat(newRowData.amount),
                date: new Date(newRowData.date),
                category: newRowData.category,
                paymentMethod: newRowData.paymentMethod,
            });

            showNotification("Income added successfully!", "success");

            // Reset fields and close the row
            setIsAddingNew(false);
            setNewRowData({
                date: "",
                title: "",
                category: "",
                paymentMethod: "",
                amount: ""
            });

            // Refresh the income data
            fetchIncomeData();

            // Trigger parent refresh if provided
            if (props.onDataChange) props.onDataChange();
        } catch (e) {
            console.error("Error adding income: ", e);
            showNotification("Failed to add income", "error");
        }
    };
    // Refs for the input fields
    const inputRefs = useRef({});

    function fetchIncomeData() {
        const user = auth.currentUser;
        if (!user) {
            // Use mock data if no user is logged in, for demo purposes
            setIncomeData([

            ]);
            return;
        }

        const incomeCollectionRef = collection(db, "users", user.uid, "income");
        getDocs(incomeCollectionRef)
            .then((querySnapshot) => {
                const incomeList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate().toLocaleDateString() : new Date(doc.data().date).toLocaleDateString(),
                }));
                setIncomeData(incomeList);
            })
    }

    async function deleteIncomeRow(id) {
        try {
            const user = auth.currentUser;
            if (!user) {
                showNotification("You must be logged in to delete", "error");
                return;
            }

            // Correct path: users/{userId}/income/{incomeId}
            await deleteDoc(doc(db, "users", user.uid, "income", id))
            setIncomeData((prev) => prev.filter((item) => item.id !== id))
            showNotification("Item deleted successfully!", "success")

            // Trigger parent refresh if provided
            if (props.onDataChange) props.onDataChange();
        }
        catch (error) {
            console.log(error)
            showNotification("Failed to delete item", "error")
        }
    }

    const startEditing = (income) => {
        setEditingId(income.id);
        setEditRowData({
            date: income.date,
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
            fetchIncomeData();
            if (props.onDataChange) props.onDataChange();
        } catch (error) {
            console.error("Error updating income:", error);
            showNotification("Failed to update income", "error");
        }
    };
    const time_now = new Date()
    const year = time_now.getFullYear()
    const month = time_now.getMonth() + 1
    const day = time_now.getDate()
    const time = `${year}/${month}/${day}`
    // Function to handle adding a new row
    const handleAddNewRow = () => {
        setIsAddingNew(true);
        setNewRowData({
            date: time,
            title: "",
            source: "",
            category: "",
            paymentMethod: "",
            amount: ""
        });
        // Focus on the first input field after a short delay
        setTimeout(() => {
            if (inputRefs.current['date']) {
                inputRefs.current['date'].focus();
            }
        }, 100);
    };

    // Handle input changes
    const handleInputChange = (field, value) => {
        setNewRowData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle Enter key press to move to next field
    const handleKeyPress = (e, currentField) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const fields = ['date', 'title', 'category', 'paymentMethod', 'amount'];
            const currentIndex = fields.indexOf(currentField);

            if (currentIndex < fields.length - 1) {
                // Move to next field
                const nextField = fields[currentIndex + 1];
                if (inputRefs.current[nextField]) {
                    inputRefs.current[nextField].focus();
                }
            } else {
                // Last field - show alert
                AddIncome()
            }
        }
    };

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
        addNewRow: handleAddNewRow
    }));

    useEffect(() => {
        fetchIncomeData();
    }, []);

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
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* New Editable Row at top */}
                        {isAddingNew && (
                            <tr className="adding-new-row">
                                <td>
                                    <input
                                        type="text"
                                        placeholder="MM/DD/YYYY"
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
                                        placeholder="Source Description"
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
                                        placeholder="e.g. Salary"
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
                                        placeholder="e.g. Bank Transfer"
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
                                        placeholder="0.00"
                                        className="table-input amount"
                                        value={newRowData.amount}
                                        onChange={(e) => handleInputChange('amount', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'amount')}
                                        ref={(el) => inputRefs.current['amount'] = el}
                                    />
                                </td>
                                <td className="row-actions">
                                    <button className="action-icon-btn save" onClick={AddIncome} title="Save Row">✓</button>
                                    <button className="action-icon-btn cancel" onClick={() => setIsAddingNew(false)} title="Cancel">✕</button>
                                </td>
                            </tr>
                        )}

                        {incomeData.length === 0 && !isAddingNew ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>No income data found. Data will appear here once added.</td>
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
                                                    <button className="action-icon-btn save" onClick={updateIncomeRow} title="Save Row">✓</button>
                                                    <button className="action-icon-btn cancel" onClick={() => setEditingId(null)} title="Cancel">✕</button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{income.date}</td>
                                                <td>{income.title}</td>
                                                <td><span style={{ background: '#e6f4ea', color: '#1e8e3e', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>{income.category || 'General'}</span></td>
                                                <td>{income.paymentMethod || 'Bank'}</td>
                                                <td className="amount-cell">${income.amount}</td>
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