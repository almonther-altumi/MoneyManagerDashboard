import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import "../Styles/TableStyle.css";
import { useTranslation } from "react-i18next";
import { collection, addDoc, updateDoc, doc, deleteDoc, query, orderBy, limit, getDocs, startAfter } from "firebase/firestore";
import { db, auth } from "../../firebase";
import Notification from "../Notification";
import { useNotification } from "../../hooks/useNotification";
import { useFinancialData } from "../../hooks/useFinancialData";
import { checkRateLimit } from "../../security/rateLimiter";

const IncomeTable = forwardRef((props, ref) => {
    const { t } = useTranslation();
    const { refreshData } = useFinancialData();
    const { notification, showNotification, hideNotification } = useNotification();

    const [incomeData, setIncomeData] = useState([]);
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
        incomeData.map(item => (item.category || "General").toString().trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const methodOptions = Array.from(new Set(
        incomeData.map(item => (item.paymentMethod || "Bank").toString().trim()).filter(Boolean)
    )).sort((a, b) => a.localeCompare(b));

    const filteredIncomeData = incomeData.filter((income) => {
        const title = normalizeText(income.title);
        const category = normalizeText(income.category || "General");
        const method = normalizeText(income.paymentMethod || "Bank");

        if (queryFilter) {
            const haystack = `${title} ${category} ${method}`;
            if (!haystack.includes(queryFilter)) return false;
        }

        if (categoryFilter && !category.includes(categoryFilter)) return false;
        if (methodFilter && !method.includes(methodFilter)) return false;

        if (fromDate || toDate) {
            const rowDate = parseRowDate(income.date);
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

    const sortedIncomeData = [...filteredIncomeData].sort((a, b) => {
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
                collection(db, "users", user.uid, "income"),
                orderBy("date", "desc"),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setIncomeData(data);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 10);
        } catch (error) {
            console.error("Error fetching initial income:", error);
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
                collection(db, "users", user.uid, "income"),
                orderBy("date", "desc"),
                startAfter(lastDoc),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const newData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setIncomeData(prev => [...prev, ...newData]);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            setHasMore(snapshot.docs.length === 10);
        } catch (error) {
            console.error("Error loading more income:", error);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useImperativeHandle(ref, () => ({
        addNewRow: () => {
            setIsAddingNew(true);
            const today = new Date().toISOString().split('T')[0];
            setNewRowData({ date: today, title: "", category: "", paymentMethod: "", amount: "" });
            setTimeout(() => {
                if (inputRefs.current['date']) {
                    inputRefs.current['date'].focus();
                }
            }, 0);
        }
    }));

    const handleInputChange = (field, value) => {
        setNewRowData(prev => ({ ...prev, [field]: value }));
    };

    const handleEditChange = (field, value) => {
        setEditRowData(prev => ({ ...prev, [field]: value }));
    };

    const AddIncome = async () => {
        const user = auth.currentUser;
        if (!user) return;

        if (!newRowData.title || !newRowData.amount) {
            showNotification(t('notifications.fill_required'), "error");
            return;
        }

        const canProceed = await checkRateLimit();
        if (!canProceed) {
            showNotification(t('security.rate_limit_warning'), "error");
            return;
        }

        try {
            const incomeDate = newRowData.date || new Date().toISOString().split('T')[0];

            await addDoc(collection(db, "users", user.uid, "income"), {
                title: newRowData.title,
                amount: parseFloat(newRowData.amount) || 0,
                date: incomeDate,
                category: newRowData.category || "General",
                paymentMethod: newRowData.paymentMethod || "-",
                createdAt: new Date()
            });

            showNotification(t('table.add_success'), "success");
            setIsAddingNew(false);
            setNewRowData({
                date: new Date().toISOString().split('T')[0],
                title: "",
                category: "",
                paymentMethod: "",
                amount: ""
            });
            fetchInitialData();
            if (refreshData) refreshData();
        } catch (error) {
            console.error("Error adding income:", error);
            showNotification(t('table.add_error'), "error");
        }
    };

    const deleteIncomeRow = async (id) => {
        const user = auth.currentUser;
        if (!user) return;

        const canProceed = await checkRateLimit();
        if (!canProceed) {
            showNotification(t('security.rate_limit_warning'), "error");
            return;
        }

        try {
            await deleteDoc(doc(db, "users", user.uid, "income", id));
            setIncomeData(prev => prev.filter(item => item.id !== id));
            showNotification(t('table.delete_success'), "success");
            if (refreshData) refreshData();
        } catch (error) {
            console.error("Error deleting income:", error);
            showNotification(t('table.delete_error'), "error");
        }
    };

    const startEditing = (income) => {
        setEditingId(income.id);
        let formattedDate = income.date;
        if (income.date && income.date.toDate) {
            formattedDate = income.date.toDate().toISOString().split('T')[0];
        } else if (income.date) {
            try {
                formattedDate = new Date(income.date).toISOString().split('T')[0];
            } catch {
                formattedDate = income.date;
            }
        }

        setEditRowData({
            date: formattedDate,
            title: income.title,
            category: income.category,
            paymentMethod: income.paymentMethod || "",
            amount: income.amount
        });
    };

    const updateIncomeRow = async () => {
        const user = auth.currentUser;
        if (!user || !editingId) return;

        const canProceed = await checkRateLimit();
        if (!canProceed) {
            showNotification(t('security.rate_limit_warning'), "error");
            return;
        }

        try {
            const incomeDocRef = doc(db, "users", user.uid, "income", editingId);
            await updateDoc(incomeDocRef, {
                title: editRowData.title,
                amount: parseFloat(editRowData.amount) || 0,
                date: editRowData.date,
                category: editRowData.category,
                paymentMethod: editRowData.paymentMethod
            });

            showNotification(t('table.update_success'), "success");
            setIncomeData(prev => prev.map(item => item.id === editingId ? { ...item, ...editRowData, amount: parseFloat(editRowData.amount) || 0 } : item));
            setEditingId(null);
            if (refreshData) refreshData();
        } catch (error) {
            console.error("Error updating income:", error);
            showNotification(t('table.update_error'), "error");
        }
    };

    const handleKeyPress = (e, field, isEditing = false) => {
        if (e.key === 'Enter') {
            if (isEditing) {
                updateIncomeRow();
            } else {
                AddIncome();
            }
        }
    };

    const formatDisplayDate = (date) => {
        if (!date) return "";
        let d;
        if (date.toDate) d = date.toDate();
        else d = new Date(date);

        if (isNaN(d.getTime())) return date;
        return d.toLocaleDateString();
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
                            list="income-category-list"
                            placeholder={t('table.filter_category')}
                            aria-label={t('table.filter_category')}
                            value={filters.category}
                            onChange={handleFilterChange('category')}
                        />
                        <datalist id="income-category-list">
                            {categoryOptions.map((option) => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    </div>
                    <div className="filter-group">
                        <input
                            className="filter-input"
                            type="text"
                            list="income-method-list"
                            placeholder={t('table.filter_method')}
                            aria-label={t('table.filter_method')}
                            value={filters.method}
                            onChange={handleFilterChange('method')}
                        />
                        <datalist id="income-method-list">
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
                            <th className="actions-header">{t('table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isAddingNew && (
                            <tr className="adding-row">
                                <td data-label={t('table.date')}>
                                    <input
                                        type="date"
                                        className="table-input"
                                        value={newRowData.date}
                                        onChange={(e) => handleInputChange('date', e.target.value)}
                                        ref={(el) => inputRefs.current['date'] = el}
                                    />
                                </td>
                                <td data-label={t('table.description')}>
                                    <input
                                        type="text"
                                        placeholder={t('table.placeholder_description')}
                                        className="table-input"
                                        value={newRowData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        onKeyDown={(e) => handleKeyPress(e, 'title')}
                                        ref={(el) => inputRefs.current['title'] = el}
                                    />
                                </td>
                                <td data-label={t('table.category')}>
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
                                <td data-label={t('table.method')}>
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
                                <td data-label={t('table.amount')}>
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

                        {sortedIncomeData.length === 0 && !isAddingNew && !isInitialLoading && (
                            <tr>
                                <td colSpan="6" className="empty-table-message">
                                    <div className="empty-state-content" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                        <p>{hasFilters ? t('table.empty_filtered') : t('table.empty_income')}</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {sortedIncomeData.map((income) => (
                            <tr key={income.id}>
                                {editingId === income.id ? (
                                    <>
                                        <td data-label={t('table.date')}><input type="date" className="table-input" value={editRowData.date} onChange={(e) => handleEditChange('date', e.target.value)} /></td>
                                        <td data-label={t('table.description')}><input type="text" className="table-input" value={editRowData.title} onChange={(e) => handleEditChange('title', e.target.value)} /></td>
                                        <td data-label={t('table.category')}><input type="text" className="table-input" value={editRowData.category} onChange={(e) => handleEditChange('category', e.target.value)} /></td>
                                        <td data-label={t('table.method')}><input type="text" className="table-input" value={editRowData.paymentMethod} onChange={(e) => handleEditChange('paymentMethod', e.target.value)} /></td>
                                        <td data-label={t('table.amount')}><input type="number" className="table-input amount" value={editRowData.amount} onChange={(e) => handleEditChange('amount', e.target.value)} /></td>
                                        <td className="row-actions">
                                            <button className="action-icon-btn save" onClick={updateIncomeRow} title={t('table.save')}>✓</button>
                                            <button className="action-icon-btn cancel" onClick={() => setEditingId(null)} title={t('table.cancel')}>✕</button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td data-label={t('table.date')}>{formatDisplayDate(income.date)}</td>
                                        <td data-label={t('table.description')} style={{ fontWeight: '600' }}>{income.title}</td>
                                        <td data-label={t('table.category')}><span className="category-income-badge">{income.category || 'General'}</span></td>
                                        <td data-label={t('table.method')}>{income.paymentMethod || 'Bank'}</td>
                                        <td data-label={t('table.amount')} className="amount-income-cell">${(Number(income.amount) || 0).toLocaleString()}</td>
                                        <td className="row-actions">
                                            <button className="action-icon-btn edit" onClick={() => startEditing(income)} title="Edit">✎</button>
                                            <button className="action-icon-btn delete" onClick={() => deleteIncomeRow(income.id)} title="Delete">🗑</button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {!isInitialLoading && hasMore && incomeData.length > 0 && (
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

export default IncomeTable;
