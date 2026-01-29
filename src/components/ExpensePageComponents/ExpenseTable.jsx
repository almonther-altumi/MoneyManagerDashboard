import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import { useTranslation } from "react-i18next";
import { useFinancialData } from "../../contexts/FinancialContext";

import "../Styles/TableStyle.css"

const ExpenseTable = forwardRef((props, ref) => {
  const { t } = useTranslation();
  // Access global context data
  const { expenses: expenseData, refreshData } = useFinancialData();

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

  // Helper to format date
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

  // Add new expense
  const AddExpense = async () => {
    try {

      // check if user is logged in or not 
      const user = auth.currentUser;
      if (!user) {
        showNotification("You are not logged in :( Please logIn ", "error");
        return;
      }

      // Code to check the inputs from user if can used or not ? 
      if (newRowData.amount == 0) {
        showNotification("Please fill the amount", "error");
        return;
      }

      if (newRowData.title.trim() == null) {
        showNotification("please fill the title", "error");
        return;
      }

      if (isNaN(newRowData.amount) != false) {
        showNotification("Please fill the amount field ", "error");
        return;
      }

      if (newRowData.amount <= 0) {
        showNotification("Please write correct amount ", "error")
        return;
      }

      await addDoc(collection(db, "users", user.uid, "expenses"), {
        title: newRowData.title ?? "-",
        amount: parseFloat(newRowData.amount),
        date: newRowData.date || new Date().toISOString().split('T')[0],
        category: newRowData.category ?? "General",
        paymentMethod: newRowData.paymentMethod ?? "-",
      });

      showNotification("Expense added successfully!", "success");
      setIsAddingNew(false);
      setNewRowData({ date: "", title: "", category: "", paymentMethod: "", amount: "" });

      refreshData();

      // if (props.onDataChange) props.onDataChange();
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

      refreshData();
      // if (props.onDataChange) props.onDataChange();
    } catch (e) {
      console.error("Error deleting expense:", e);
      showNotification("Delete failed", "error");
    }
  };

  // Start editing a row
  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditRowData({
      date: formatDisplayDate(expense.date),
      title: expense.title,
      category: expense.category,
      paymentMethod: isNaN(expense.paymentMethod) ? expense.paymentMethod : 0,
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
        title: editRowData.title ?? "-",
        amount: parseFloat(editRowData.amount) || 0,
        date: new Date(editRowData.date), // Storing as object/string? new Date() creates object. 
        // Original code used new Date().
        category: editRowData.category ?? "-",
        paymentMethod: editRowData.paymentMethod
      });

      showNotification("Expense updated successfully!", "success");
      setEditingId(null);
      refreshData();
      // if (props.onDataChange) props.onDataChange();
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

  // Removed useEffect fetch

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
              <th>{t('table.date')}</th>
              <th>{t('table.description')}</th>
              <th>{t('table.category')}</th>
              <th>{t('table.method')}</th>
              <th>{t('table.amount')}</th>
              <th>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {expenseData.length === 0 && !isAddingNew ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>{t('table.empty_expenses')}</td> {/*When there is no Data on the table  */}
              </tr>
            ) : (
              isAddingNew && (
                <tr>
                  {['date', 'title', 'category', 'paymentMethod', 'amount'].map((field, idx) => (
                    <td key={field}>
                      <input
                        type={field === 'amount' ? 'number' : field === 'date' ? 'date' : 'text'}
                        placeholder={
                          field === 'title' ? t('table.placeholder_description') :
                            field === 'category' ? t('table.placeholder_category') :
                              field === 'paymentMethod' ? t('table.placeholder_method') :
                                field === 'amount' ? t('table.placeholder_amount') : ""
                        }
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
              ))
            }


            {/* Expense rows */}
            {expenseData.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  <>
                    {['date', 'title', 'category', 'paymentMethod', 'amount'].map((field) => (
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
                    <td>{formatDisplayDate(expense.date)}</td>
                    <td>{expense.title}</td>
                    <td><span className="category-expense-badge">{expense.category || 'General'}</span></td>
                    <td>{expense.paymentMethod}</td>
                    <td className="amount-expense-cell">${expense.amount}</td>
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


    </>
  );
});

export default ExpenseTable;
