import React, { useState, useEffect } from 'react';
import '../Styles/HomePageStyles/HomePageStyle.css';
import { db, auth } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useTranslation } from "react-i18next";

function MyCards() {
    const { t } = useTranslation();
    const cardThemes = [
        { id: 'midnight', name: t('my_cards.themes.midnight'), gradient: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)', accent: '#f5c542' },
        { id: 'ocean', name: t('my_cards.themes.ocean'), gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0b1020 100%)', accent: '#fde047' },
        { id: 'violet', name: t('my_cards.themes.violet'), gradient: 'linear-gradient(135deg, #7c3aed 0%, #111827 100%)', accent: '#fef08a' },
        { id: 'emerald', name: t('my_cards.themes.emerald'), gradient: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)', accent: '#fde68a' },
        { id: 'sunset', name: t('my_cards.themes.sunset'), gradient: 'linear-gradient(135deg, #f97316 0%, #7c2d12 100%)', accent: '#fff1b8' }
    ];

    const getThemeById = (id) => cardThemes.find(theme => theme.id === id) || cardThemes[0];

    const [cardData, setCardData] = useState({
        visa: { pin: "1234", expiry: "12/25", label: "", theme: "midnight" },
        master: { pin: "1234", expiry: "08/26", label: "", theme: "ocean" }
    });
    const [userName, setUserName] = useState("Unknown user");
    const [editingCard, setEditingCard] = useState(null); // 'visa' or 'master'
    const [tempData, setTempData] = useState({ pin: "", expiry: "", name: "", label: "", theme: "midnight" });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAllData = async (user) => {
        setIsRefreshing(true);
        try {
            const cardRef = doc(db, "users", user.uid, "settings", "cards");
            const cardSnap = await getDoc(cardRef);
            if (cardSnap.exists()) {
                const data = cardSnap.data();
                setCardData({
                    visa: {
                        pin: data.visaPin || "1234",
                        expiry: data.visaExpiry || "12/25",
                        label: data.visaLabel || "",
                        theme: data.visaTheme || "midnight"
                    },
                    master: {
                        pin: data.masterPin || "1234",
                        expiry: data.masterExpiry || "08/26",
                        label: data.masterLabel || "",
                        theme: data.masterTheme || "ocean"
                    }
                });
            }
            const profileRef = doc(db, "users", user.uid, "settings", "profile");
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                setUserName(profileSnap.data().name || "Unknown user");
            }
        } catch (error) {
            console.error("Error fetching card/profile data:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) fetchAllData(user);
        });
        return () => unsubscribe();
    }, []);

    const handleEdit = (cardType) => {
        setEditingCard(cardType);
        setTempData({
            pin: cardData[cardType].pin,
            expiry: cardData[cardType].expiry,
            name: userName,
            label: cardData[cardType].label || "",
            theme: cardData[cardType].theme || (cardType === 'visa' ? 'midnight' : 'ocean')
        });
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user || !editingCard) return;

        try {
            setIsRefreshing(true);
            const cardRef = doc(db, "users", user.uid, "settings", "cards");
            const profileRef = doc(db, "users", user.uid, "settings", "profile");

            const updateCardData = editingCard === 'visa'
                ? {
                    visaPin: tempData.pin,
                    visaExpiry: tempData.expiry,
                    visaLabel: tempData.label,
                    visaTheme: tempData.theme
                }
                : {
                    masterPin: tempData.pin,
                    masterExpiry: tempData.expiry,
                    masterLabel: tempData.label,
                    masterTheme: tempData.theme
                };

            await Promise.all([
                setDoc(cardRef, updateCardData, { merge: true }),
                setDoc(profileRef, { name: tempData.name }, { merge: true })
            ]);

            setCardData(prev => ({
                ...prev,
                [editingCard]: {
                    pin: tempData.pin,
                    expiry: tempData.expiry,
                    label: tempData.label,
                    theme: tempData.theme
                }
            }));
            setUserName(tempData.name);
            setEditingCard(null);
        } catch (error) {
            console.error("Error saving card data:", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setEditingCard(null);
    };

    const renderCard = (cardType, brandLabel, defaultLabel) => {
        const card = cardData[cardType];
        const isEditing = editingCard === cardType;
        const theme = getThemeById(card.theme || (cardType === 'visa' ? 'midnight' : 'ocean'));

        return (
            <div
                className={`credit-card ${isEditing ? 'card-editing' : ''}`}
                style={{ '--card-bg': theme.gradient, '--card-accent': theme.accent }}
            >
                <div className="card-top">
                    <div className="card-brand">
                        <span className="card-brand-text">{brandLabel}</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempData.label}
                                onChange={(e) => setTempData({ ...tempData, label: e.target.value })}
                                onKeyDown={handleKeyDown}
                                placeholder={t('my_cards.label_placeholder')}
                                className="card-inline-input label-input"
                            />
                        ) : (
                            <span className="card-label editable-field" onClick={() => handleEdit(cardType)}>
                                {card.label || defaultLabel}
                                <span className="pencil-hint">???</span>
                            </span>
                        )}
                    </div>
                    <span className="card-chip"></span>
                </div>

                <div className="card-number">
                    <h3 className='stars'>**** **** ****</h3>
                    {isEditing ? (
                        <input
                            type="text"
                            value={tempData.pin}
                            onChange={(e) => setTempData({ ...tempData, pin: e.target.value })}
                            onKeyDown={handleKeyDown}
                            className="card-inline-input pin-input"
                        />
                    ) : (
                        <span className="editable-field" onClick={() => handleEdit(cardType)}>
                            {card.pin} <span className="pencil-hint">???</span>
                        </span>
                    )}
                </div>

                <div className="card-bottom">
                    <div className="card-holder">
                        <span>{t('my_cards.card_holder')}</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempData.name}
                                onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                onKeyDown={handleKeyDown}
                                className="card-inline-input name-input"
                            />
                        ) : (
                            <h5 onClick={() => handleEdit(cardType)}>{userName}</h5>
                        )}
                    </div>
                    <div className="card-expiry">
                        <span>{t('my_cards.expires')}</span>
                        {isEditing ? (
                            <input
                                type="text"
                                value={tempData.expiry}
                                onChange={(e) => setTempData({ ...tempData, expiry: e.target.value })}
                                onKeyDown={handleKeyDown}
                                className="card-inline-input expiry-input"
                            />
                        ) : (
                            <h5 onClick={() => handleEdit(cardType)}>{card.expiry} <span className="pencil-hint">???</span></h5>
                        )}
                    </div>
                </div>

                {isEditing && (
                    <>
                        <div className="card-theme-picker">
                            <span className="card-theme-title">{t('my_cards.card_color')}</span>
                            <div className="theme-swatch-row">
                                {cardThemes.map((themeOption) => (
                                    <button
                                        key={themeOption.id}
                                        type="button"
                                        className={`theme-swatch ${tempData.theme === themeOption.id ? 'active' : ''}`}
                                        style={{ '--swatch-bg': themeOption.gradient }}
                                        title={themeOption.name}
                                        aria-label={themeOption.name}
                                        onClick={() => setTempData({ ...tempData, theme: themeOption.id })}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="card-actions-floated">
                            <button onClick={handleSave} className="save-btn">???</button>
                            <button onClick={() => setEditingCard(null)} className="cancel-btn">???</button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <section className={`my-cards-section ${isRefreshing ? 'is-loading-internal' : ''}`}>
            <div className="section-header-flex">
                <div className="hint-title">
                    <h3>{t('my_cards.title')}</h3>
                    <span
                        className="hint hint-icon"
                        data-hint={t('home.hints.my_cards')}
                        tabIndex="0"
                    >
                        ?
                    </span>
                </div>
            </div>

            <div className="card-container">
                {renderCard('visa', 'VISA', t('my_cards.default_visa'))}
                {renderCard('master', 'Mastercard', t('my_cards.default_master'))}
            </div>
        </section>
    );
}

export default MyCards;
