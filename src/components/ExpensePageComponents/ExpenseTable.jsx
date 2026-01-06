import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
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

  const [editingId, setEditingId] = useState(null);
  const [editRowData, setEditRowData] = useState({
    date: "",
    title: "",
    category: "",
    paymentMethod: "",
    amount: ""
  });

  const { notification, showNotification, hideNotification } = useNotification();
  const inputRefs = useRef({});

  // Fetch expense data
  const fetchExpenseData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const expenseCollectionRef = collection(db, "users", user.uid, "expenses");
    getDocs(expenseCollectionRef)
      .then((querySnapshot) => {
        const expenseList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate
            ? doc.data().date.toDate().toLocaleDateString()
            : new Date(doc.data().date).toLocaleDateString(),
        }));
        setExpenseData(expenseList);
      })
      .catch(err => console.error("Error fetching expenses:", err));
  };

  // Add new expense
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

  // Delete expense
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

  // Start editing a row
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditRowData({
      date: expense.date,
      title: expense.title,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      amount: String(expense.amount).replace('$', '').replace(',', '')
    });
  };

  const handleEditChange = (field, value) => {
    setEditRowData(prev => ({ ...prev, [field]: value }));
  };

  // Update expense row
  const updateExpenseRow = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !editingId) return;

      const expenseDocRef = doc(db, "users", user.uid, "expenses", editingId);
      await updateDoc(expenseDocRef, {
        title: editRowData.title,
        amount: parseFloat(editRowData.amount),
        date: new Date(editRowData.date),
        category: editRowData.category,
        paymentMethod: editRowData.paymentMethod
      });

      showNotification("Expense updated successfully!", "success");
      setEditingId(null);
      fetchExpenseData();
      if (props.onDataChange) props.onDataChange();
    } catch (error) {
      console.error("Error updating expense:", error);
      showNotification("Failed to update expense", "error");
    }
  };

  // Add new row handler
  const handleAddNewRow = () => {
    setIsAddingNew(true);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
    setNewRowData({ date: formattedDate, title: "", category: "", paymentMethod: "", amount: "" });
    setTimeout(() => inputRefs.current['date']?.focus(), 100);
  };

  const handleInputChange = (field, value) => setNewRowData(prev => ({ ...prev, [field]: value }));

  const handleKeyPress = (e, currentField, isEdit = false) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();

    const fields = ['date', 'title', 'category', 'paymentMethod', 'amount'];
    const currentIndex = fields.indexOf(currentField);
    const nextField = fields[currentIndex + 1];

    if (currentIndex < fields.length - 1) {
      inputRefs.current[nextField]?.focus();
    } else {
      isEdit ? updateExpenseRow() : AddExpense();
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
            {/* New row */}
            {isAddingNew && (
              <tr>
                {['date','title','category','paymentMethod','amount'].map((field, idx) => (
                  <td key={field}>
                    <input
                      type={field === 'amount' ? 'number' : 'text'}
                      className="table-input"
                      value={newRowData[field]}
                      onChange={(e) => handleInputChange(field, e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, field)}
                      ref={el => inputRefs.current[field] = el}
                      autoFocus={idx === 0}
                    />
                  </td>
                ))}
                <td className="row-actions">
                  <button className="action-icon-btn save" onClick={AddExpense}>✓</button>
                  <button className="action-icon-btn cancel" onClick={() => setIsAddingNew(false)}>✕</button>
                </td>
              </tr>
            )}

            {/* Expense rows */}
            {expenseData.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  <>
                    {['date','title','category','paymentMethod','amount'].map((field) => (
                      <td key={field}>
                        <input
                          type={field === 'amount' ? 'number' : 'text'}
                          className="table-input"
                          value={editRowData[field]}
                          onChange={(e) => handleEditChange(field, e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, field, true)}
                          ref={el => inputRefs.current[field] = el}
                        />
                      </td>
                    ))}
                    <td className="row-actions">
                      <button className="action-icon-btn save" onClick={updateExpenseRow}>✓</button>
                      <button className="action-icon-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{expense.date}</td>
                    <td>{expense.title}</td>
                    <td>{expense.category}</td>
                    <td>{expense.paymentMethod}</td>
                    <td className="amount-cell">${expense.amount}</td>
                    <td className="row-actions">
                      <button className="action-icon-btn edit" onClick={() => startEditing(expense)}>✎</button>
                      <button className="action-icon-btn delete" onClick={() => deleteExpenseRow(expense.id)}>🗑</button>
                    </td>
                  </>
                )}
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
