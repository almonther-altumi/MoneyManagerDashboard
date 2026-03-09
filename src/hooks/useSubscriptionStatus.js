import { useEffect, useState } from 'react';

const STATUS_KEY = 'mm_subscription_status';

const getStatus = () => {
    if (typeof window === 'undefined') return 'inactive';
    try {
        return localStorage.getItem(STATUS_KEY) || 'inactive';
    } catch (error) {
        return 'inactive';
    }
};

export const useSubscriptionStatus = () => {
    const [status, setStatus] = useState(getStatus);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const sync = () => {
            setStatus(getStatus());
        };
        window.addEventListener('storage', sync);
        window.addEventListener('subscription_update', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('subscription_update', sync);
        };
    }, []);

    return status === 'active';
};
