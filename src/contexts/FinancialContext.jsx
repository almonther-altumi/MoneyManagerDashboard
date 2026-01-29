import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import i18n from '../i18n';

const FinancialContext = createContext();

export const useFinancialData = () => useContext(FinancialContext);

export const FinancialProvider = ({ children }) => {
    const [income, setIncome] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [debts, setDebts] = useState([]);
    const [settings, setSettings] = useState(null);
    const [financialLoading, setFinancialLoading] = useState(true);
    const [user, setUser] = useState(null);

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
            const [incomeSnap, expenseSnap, debtSnap, settingsSnap] = await Promise.all([
                getDocs(collection(db, "users", currentUser.uid, 'income')),
                getDocs(collection(db, "users", currentUser.uid, 'expenses')),
                getDocs(collection(db, "users", currentUser.uid, 'debts')),
                getDoc(doc(db, "users", currentUser.uid, 'settings', 'general'))
            ]);

            const incomeData = incomeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const expenseData = expenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const debtData = debtSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            const settingsData = settingsSnap.exists() ? settingsSnap.data() : null;

            setIncome(incomeData);
            setExpenses(expenseData);
            setDebts(debtData);
            setSettings(settingsData);

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

    // Helper to refresh specific parts of data (can be optimized later)
    const refreshData = () => {
        if (user) fetchAllData(user);
    };

    const value = {
        income,
        expenses,
        debts,
        settings,
        loading: financialLoading,
        refreshData
    };

    return (
        <FinancialContext.Provider value={value}>
            {children}
        </FinancialContext.Provider>
    );
};
