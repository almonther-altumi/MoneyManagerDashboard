import { useContext } from 'react';
import { FinancialContext } from '../contexts/FinancialContext';

export const useFinancialData = () => {
    const context = useContext(FinancialContext);
    if (!context) {
        throw new Error('useFinancialData must be used within a FinancialProvider');
    }
    return context;
};

export default useFinancialData;
