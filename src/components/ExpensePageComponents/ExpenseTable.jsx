import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { collection, deleteDoc, addDoc, updateDoc, doc, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import { useTranslation } from "react-i18next";
import { checkRateLimit } from "../../security/rateLimiter";
import { useFinancialData } from "../../hooks/useFinancialData";

import "../Styles/TableStyle.css"

const ExpenseTable = forwardRef((props, ref) => {
  const { t } = useTranslation();
  const { refreshData } = useFinancialData();
  const [expenseData, setExpenseData] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: "",
    category: "",
    method: "",
    dateFrom: "",
    dateTo: ""
  });
  const [sortOrder, setSortOrder] = useState("dateDesc");

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newRowData, setNewRowData] = useState({
    date: new Date().toISOString().split('T')[0],
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

  const normalizeText = (value) => String(value || "").toLowerCase();

  const parseRowDate = (value) => {
    if (!value) return null;
    try {
      if (value.toDate) return value.toDate();
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const handleFilterChange = (field) => (e) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ query: "", category: "", method: "", dateFrom: "", dateTo: "" });
  };

  const hasFilters = Object.values(filters).some((value) => String(value).trim() !== "");
  const queryFilter = filters.query.trim().toLowerCase();
  const categoryFilter = filters.category.trim().toLowerCase();
  const methodFilter = filters.method.trim().toLowerCase();
  const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const toDate = filters.dateTo ? new Date(filters.dateTo) : null;
  if (fromDate) fromDate.setHours(0, 0, 0, 0);
  if (toDate) toDate.setHours(23, 59, 59, 999);

  const categoryOptions = Array.from(new Set(
    expenseData.map(item => (item.category || "General").toString().trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  const methodOptions = Array.from(new Set(
    expenseData.map(item => (item.paymentMethod || "-").toString().trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  const filteredExpenseData = expenseData.filter((expense) => {
    const title = normalizeText(expense.title);
    const category = normalizeText(expense.category || "General");
    const method = normalizeText(expense.paymentMethod || "-");

    if (queryFilter) {
      const haystack = `${title} ${category} ${method}`;
      if (!haystack.includes(queryFilter)) return false;
    }

    if (categoryFilter && !category.includes(categoryFilter)) return false;
    if (methodFilter && !method.includes(methodFilter)) return false;

    if (fromDate || toDate) {
      const rowDate = parseRowDate(expense.date);
      if (!rowDate) return false;
      if (fromDate && rowDate < fromDate) return false;
      if (toDate && rowDate > toDate) return false;
    }

    return true;
  });

  const getSortDate = (row) => {
    const rowDate = parseRowDate(row.date);
    return rowDate ? rowDate.getTime() : 0;
  };

  const getSortAmount = (row) => Number(row.amount) || 0;

  const sortedExpenseData = [...filteredExpenseData].sort((a, b) => {
    switch (sortOrder) {
      case "dateAsc":
        return getSortDate(a) - getSortDate(b);
      case "amountAsc":
        return getSortAmount(a) - getSortAmount(b);
      case "amountDesc":
        return getSortAmount(b) - getSortAmount(a);
      case "dateDesc":
      default:
        return getSortDate(b) - getSortDate(a);
    }
  });

  const fetchInitialData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "expenses"),
        orderBy("date", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setExpenseData(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error fetching initial expenses:", error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const user = auth.currentUser;
    if (!user) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "expenses"),
        orderBy("date", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setExpenseData(prev => [...prev, ...newData]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 10);
    } catch (error) {
      console.error("Error loading more expenses:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return "";
    try {
      let d;
      if (dateVal.toDate) d = dateVal.toDate();
      else d = new Date(dateVal);
      if (isNaN(d.getTime())) return dateVal;
      return d.toLocaleDateString();
    } catch {
      return dateVal;
    }
  };

  const AddExpense = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        showNotification("Please log in", "error");
        return;
      }

      const canProceed = await checkRateLimit();
      if (!canProceed) {
        showNotification(t('security.rate_limit_warning'), "error");
        return;
      }

      if (!newRowData.title || !newRowData.amount) {
        showNotification("Please fill required fields", "error");
        return;
      }

      await addDoc(collection(db, "users", user.uid, "expenses"), {
        title: newRowData.title,
        amount: parseFloat(newRowData.amount) || 0,
        date: newRowData.date || new Date().toISOString().split('T')[0],
        category: newRowData.category || "General",
        paymentMethod: newRowData.paymentMethod || "-",
        createdAt: new Date()
      });

      showNotification("Expense added!", "success");
      setIsAddingNew(false);
      setNewRowData({ date: new Date().toISOString().split('T')[0], title: "", category: "", paymentMethod: "", amount: "" });
      fetchInitialData();
      if (refreshData) refreshData();
    } catch (e) {
      console.error("Error adding expense:", e);
      showNotification("Failed to add expense", "error");
    }
  };

  const deleteExpenseRow = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "expenses", id));
      setExpenseData(prev => prev.filter(item => item.id !== id));
      showNotification("Expense deleted", "success");
      if (refreshData) refreshData();
    } catch (e) {
      console.error("Error deleting expense:", e);
      showNotification("Delete failed", "error");
    }
  };

  const startEditing = (expense) => {
    setEditingId(expense.id);
    setEditRowData({
      date: expense.date,
      title: expense.title,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      amount: expense.amount
    });
  };

  const handleEditChange = (field, value) => {
    setEditRowData(prev => ({ ...prev, [field]: value }));
  };

  const updateExpenseRow = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !editingId) return;

      const expenseDocRef = doc(db, "users", user.uid, "expenses", editingId);
      await updateDoc(expenseDocRef, {
        title: editRowData.title,
        amount: parseFloat(editRowData.amount) || 0,
        date: editRowData.date,
        category: editRowData.category,
        paymentMethod: editRowData.paymentMethod
      });

      showNotification("Expense updated!", "success");
      setEditingId(null);
      setExpenseData(prev => prev.map(item => item.id === editingId ? { ...item, ...editRowData, amount: parseFloat(editRowData.amount) } : item));
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Error updating expense:", error);
      showNotification("Update failed", "error");
    }
  };

  const handleAddNewRow = () => {
    setIsAddingNew(true);
    setTimeout(() => inputRefs.current['date']?.focus(), 100);
  };

  useImperativeHandle(ref, () => ({ addNewRow: handleAddNewRow }));

  const handleKeyPress = (e, field, isEdit = false) => {
    if (e.key === 'Enter') {
      isEdit ? updateExpenseRow() : AddExpense();
    }
  };

  return (
    <>
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />

      <div className="table-wrapper">
        <div className="table-filters">
          <div className="filter-group">
            <input
              className="filter-input"
              type="text"
              placeholder={t('table.filter_search')}
              aria-label={t('table.filter_search')}
              value={filters.query}
              onChange={handleFilterChange('query')}
            />
          </div>
          <div className="filter-group">
            <input
              className="filter-input"
              type="text"
              list="expense-category-list"
              placeholder={t('table.filter_category')}
              aria-label={t('table.filter_category')}
              value={filters.category}
              onChange={handleFilterChange('category')}
            />
            <datalist id="expense-category-list">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="filter-group">
            <input
              className="filter-input"
              type="text"
              list="expense-method-list"
              placeholder={t('table.filter_method')}
              aria-label={t('table.filter_method')}
              value={filters.method}
              onChange={handleFilterChange('method')}
            />
            <datalist id="expense-method-list">
              {methodOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="filter-group">
            <input
              className="filter-input"
              type="date"
              aria-label={t('table.filter_date_from')}
              value={filters.dateFrom}
              onChange={handleFilterChange('dateFrom')}
            />
          </div>
          <div className="filter-group">
            <input
              className="filter-input"
              type="date"
              aria-label={t('table.filter_date_to')}
              value={filters.dateTo}
              onChange={handleFilterChange('dateTo')}
            />
          </div>
          <div className="filter-group">
            <select
              className="filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              aria-label={t('table.sort_label')}
            >
              <option value="dateDesc">{t('reports.filters.date_desc')}</option>
              <option value="dateAsc">{t('reports.filters.date_asc')}</option>
              <option value="amountAsc">{t('reports.filters.amount_asc')}</option>
              <option value="amountDesc">{t('reports.filters.amount_desc')}</option>
            </select>
          </div>
          <div className="filter-actions">
            <button
              className="filter-clear-btn"
              onClick={clearFilters}
              disabled={!hasFilters}
            >
              {t('table.clear_filters')}
            </button>
          </div>
        </div>

        <table className="luxury-table">
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
            {isAddingNew && (
              <tr className="adding-row">
                <td data-label={t('table.date')}><input type="date" className="table-input" value={newRowData.date} onChange={(e) => setNewRowData(p => ({ ...p, date: e.target.value }))} ref={el => inputRefs.current['date'] = el} /></td>
                <td data-label={t('table.description')}><input type="text" className="table-input" placeholder={t('table.placeholder_description')} value={newRowData.title} onChange={(e) => setNewRowData(p => ({ ...p, title: e.target.value }))} onKeyDown={(e) => handleKeyPress(e, 'title')} ref={el => inputRefs.current['title'] = el} /></td>
                <td data-label={t('table.category')}><input type="text" className="table-input" placeholder={t('table.placeholder_category')} value={newRowData.category} onChange={(e) => setNewRowData(p => ({ ...p, category: e.target.value }))} onKeyDown={(e) => handleKeyPress(e, 'category')} ref={el => inputRefs.current['category'] = el} /></td>
                <td data-label={t('table.method')}><input type="text" className="table-input" placeholder={t('table.placeholder_method')} value={newRowData.paymentMethod} onChange={(e) => setNewRowData(p => ({ ...p, paymentMethod: e.target.value }))} onKeyDown={(e) => handleKeyPress(e, 'paymentMethod')} ref={el => inputRefs.current['paymentMethod'] = el} /></td>
                <td data-label={t('table.amount')}><input type="number" className="table-input amount" placeholder={t('table.placeholder_amount')} value={newRowData.amount} onChange={(e) => setNewRowData(p => ({ ...p, amount: e.target.value }))} onKeyDown={(e) => handleKeyPress(e, 'amount')} ref={el => inputRefs.current['amount'] = el} /></td>
                <td className="row-actions">
                  <button className="action-icon-btn save" onClick={AddExpense}>✓</button>
                  <button className="action-icon-btn cancel" onClick={() => setIsAddingNew(false)}>✕</button>
                </td>
              </tr>
            )}

            {sortedExpenseData.length === 0 && !isAddingNew && !isInitialLoading && (
              <tr>
                <td colSpan="6" className="empty-table-message">
                  <div className="empty-state-content" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    <p>{hasFilters ? t('table.empty_filtered') : t('table.empty_expenses')}</p>
                  </div>
                </td>
              </tr>
            )}

            {sortedExpenseData.map((expense) => (
              <tr key={expense.id}>
                {editingId === expense.id ? (
                  <>
                    <td data-label={t('table.date')}><input type="date" className="table-input" value={editRowData.date} onChange={(e) => handleEditChange('date', e.target.value)} /></td>
                    <td data-label={t('table.description')}><input type="text" className="table-input" value={editRowData.title} onChange={(e) => handleEditChange('title', e.target.value)} /></td>
                    <td data-label={t('table.category')}><input type="text" className="table-input" value={editRowData.category} onChange={(e) => handleEditChange('category', e.target.value)} /></td>
                    <td data-label={t('table.method')}><input type="text" className="table-input" value={editRowData.paymentMethod} onChange={(e) => handleEditChange('paymentMethod', e.target.value)} /></td>
                    <td data-label={t('table.amount')}><input type="number" className="table-input amount" value={editRowData.amount} onChange={(e) => handleEditChange('amount', e.target.value)} /></td>
                    <td className="row-actions">
                      <button className="action-icon-btn save" onClick={updateExpenseRow}>✓</button>
                      <button className="action-icon-btn cancel" onClick={() => setEditingId(null)}>✕</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td data-label={t('table.date')}>{formatDisplayDate(expense.date)}</td>
                    <td data-label={t('table.description')} style={{ fontWeight: '600' }}>{expense.title}</td>
                    <td data-label={t('table.category')}><span className="category-expense-badge">{expense.category || 'General'}</span></td>
                    <td data-label={t('table.method')}>{expense.paymentMethod || '-'}</td>
                    <td data-label={t('table.amount')} className="amount-expense-cell">${(Number(expense.amount) || 0).toLocaleString()}</td>
                    <td className="row-actions">
                      <button className="action-icon-btn edit" onClick={() => startEditing(expense)} title="Edit">✎</button>
                      <button className="action-icon-btn delete" onClick={() => deleteExpenseRow(expense.id)} title="Delete">🗑</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {!isInitialLoading && hasMore && expenseData.length > 0 && (
          <div className="pagination-footer">
            <button
              className="load-more-btn"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? t('table.loading') : t('table.load_more')}
            </button>
          </div>
        )}
      </div>
    </>
  );
});

export default ExpenseTable;
