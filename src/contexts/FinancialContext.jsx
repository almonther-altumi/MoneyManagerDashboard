import React, { createContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import i18n from '../i18n';

export const FinancialContext = createContext();

export const FinancialProvider = ({ children }) => {
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [debts, setDebts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [financialLoading, setFinancialLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [budgetLimit, setBudgetLimit] = useState(0);
    const [monthlySpent, setMonthlySpent] = useState(0);

    // Initial Data Fetch
    const fetchAllData = async (currentUser) => {
        if (!currentUser) {
            setIncome([]);
            setExpenses([]);
            setDebts([]);
            setSettings(null);
            setFinancialLoading(false);
            return;
        }

        setFinancialLoading(true);
        try {
            // Fetch Collections in Parallel
            const [incomeSnap, expenseSnap, debtSnap, settingsSnap, budgetSnap] = await Promise.all([
                getDocs(collection(db, "users", currentUser.uid, 'income')),
                getDocs(collection(db, "users", currentUser.uid, 'expenses')),
                getDocs(collection(db, "users", currentUser.uid, 'debts')),
                getDoc(doc(db, "users", currentUser.uid, 'settings', 'general')),
                getDoc(doc(db, "users", currentUser.uid, 'settings', 'budget'))
            ]);

            const incomeData = incomeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const expenseData = expenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const debtData = debtSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const settingsData = settingsSnap.exists() ? settingsSnap.data() : null;

            setIncome(incomeData);
            setExpenses(expenseData);
            setDebts(debtData);
            setSettings(settingsData);

            const budgetsData = budgetSnap.exists() ? budgetSnap.data() : { limit: 2000 };
            setBudgetLimit(budgetsData.limit || 2000);

            // Calculate Monthly Spent
            const now = new Date();
            const currentMonth = now.getMonth();
            const currentYear = now.getFullYear();

            const thisMonthExpenses = expenseData.filter(exp => {
                const d = exp.date?.toDate ? exp.date.toDate() : new Date(exp.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            const totalSpent = thisMonthExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
            setMonthlySpent(totalSpent);

            // Sync Language Globally
            if (settingsData && settingsData.language) {
                const dbLang = settingsData.language === 'Arabic' ? 'ar' : 'en';
                if (i18n.language !== dbLang) {
                    i18n.changeLanguage(dbLang);
                    document.documentElement.dir = dbLang === 'ar' ? 'rtl' : 'ltr';
                }
            }

        } catch (error) {
            console.error("Error fetching financial data:", error);
        } finally {
            setFinancialLoading(false);
        }
    };

    // Listen to Auth Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchAllData(currentUser);
            } else {
                setIncome([]);
                setExpenses([]);
                setDebts([]);
                setFinancialLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    // Helper to refresh specific parts of data
    const refreshData = () => {
        if (user) fetchAllData(user);
    };

    const toggleDemoMode = (val) => setIsDemoMode(val);

    // Sample Data for Demo Mode
    const sampleIncome = [
        { id: 's1', title: 'Monthly Salary', amount: 5000, date: '2024-01-01', category: 'Salary' },
        { id: 's2', title: 'Freelance Work', amount: 800, date: '2024-01-15', category: 'Side Hustle' }
    ];
    const sampleExpenses = [
        { id: 'se1', title: 'Rent', amount: 1500, date: '2024-01-05', category: 'Housing' },
        { id: 'se2', title: 'Groceries', amount: 300, date: '2024-01-10', category: 'Food' }
    ];
    const sampleDebts = [
        { id: 'sd1', name: 'Car Loan', amount: 20000, remaining: 15000, reason: 'New Car' }
    ];

    const value = {
        income: isDemoMode ? sampleIncome : income,
        expenses: isDemoMode ? sampleExpenses : expenses,
        debts: isDemoMode ? sampleDebts : debts,
        settings,
        budgetLimit,
        monthlySpent,
        loading: financialLoading,
        refreshData,
        isDemoMode,
        toggleDemoMode
    };

    return (
        <FinancialContext.Provider value={value}>
            {children}
        </FinancialContext.Provider>
    );
};
