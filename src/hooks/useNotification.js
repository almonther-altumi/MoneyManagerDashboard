import { useState } from 'react';

export const useNotification = () => {
    const [notification, setNotification] = useState({
        show: false,
        message: "",
        type: "" // 'success' or 'error'
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
    };

    const hideNotification = () => {
        setNotification({ show: false, message: "", type: "" });
    };

    return {
        notification,
        showNotification,
        hideNotification
    };
};
