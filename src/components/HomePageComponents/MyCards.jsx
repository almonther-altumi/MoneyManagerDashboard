
import React, { useState, useEffect } from 'react';
import '../Styles/HomePageStyle.css';
import { db, auth } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function MyCards() {
    const [cardData, setCardData] = useState({
        visa: { pin: "7676", expiry: "12/25" },
        master: { pin: "8899", expiry: "08/26" }
    });
    const [userName, setUserName] = useState("Hassan Al-Bombat");
    const [editingCard, setEditingCard] = useState(null); // 'visa' or 'master'
    const [tempData, setTempData] = useState({ pin: "", expiry: "", name: "" });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchAllData = async (user) => {
        setIsRefreshing(true);
        try {
            const cardRef = doc(db, "users", user.uid, "settings", "cards");
            const cardSnap = await getDoc(cardRef);
            if (cardSnap.exists()) {
                const data = cardSnap.data();
                setCardData({
                    visa: { pin: data.visaPin || "7676", expiry: data.visaExpiry || "12/25" },
                    master: { pin: data.masterPin || "8899", expiry: data.masterExpiry || "08/26" }
                });
            }
            const profileRef = doc(db, "users", user.uid, "settings", "profile");
            const profileSnap = await getDoc(profileRef);
            if (profileSnap.exists()) {
                setUserName(profileSnap.data().name || "Hassan Al-Bombat");
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
            name: userName
        });
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            setIsRefreshing(true);
            const cardRef = doc(db, "users", user.uid, "settings", "cards");
            const profileRef = doc(db, "users", user.uid, "settings", "profile");

            const updateCardData = editingCard === 'visa'
                ? { visaPin: tempData.pin, visaExpiry: tempData.expiry }
                : { masterPin: tempData.pin, masterExpiry: tempData.expiry };

            await Promise.all([
                setDoc(cardRef, updateCardData, { merge: true }),
                setDoc(profileRef, { name: tempData.name }, { merge: true })
            ]);

            setCardData(prev => ({
                ...prev,
                [editingCard]: { pin: tempData.pin, expiry: tempData.expiry }
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

    return (
        <section className={`my-cards-section ${isRefreshing ? 'is-loading-internal' : ''}`}>
            <div className="section-header-flex">
                <h3>My Cards</h3>
            </div>

            <div className="card-container">
                {/* Visa Card */}
                <div className={`credit-card visa-card ${editingCard === 'visa' ? 'card-editing' : ''}`}>
                    <div className="card-top">
                        <span className="card-chip"></span>
                        <span className="card-type">VISA</span>
                    </div>

                    <div className="card-number">
                        **** **** ****
                        {editingCard === 'visa' ? (
                            <input
                                type="text"
                                value={tempData.pin}
                                onChange={(e) => setTempData({ ...tempData, pin: e.target.value })}
                                onKeyDown={handleKeyDown}
                                className="card-inline-input pin-input"
                            />
                        ) : (
                            <span className="editable-field" onClick={() => handleEdit('visa')}>
                                {cardData.visa.pin} <span className="pencil-hint">✎</span>
                            </span>
                        )}
                    </div>

                    <div className="card-bottom">
                        <div className="card-holder">
                            <span>Card Holder</span>
                            {editingCard === 'visa' ? (
                                <input
                                    type="text"
                                    value={tempData.name}
                                    onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="card-inline-input name-input"
                                />
                            ) : (
                                <h5 onClick={() => handleEdit('visa')}>{userName}</h5>
                            )}
                        </div>
                        <div className="card-expiry">
                            <span>Expires</span>
                            {editingCard === 'visa' ? (
                                <input
                                    type="text"
                                    value={tempData.expiry}
                                    onChange={(e) => setTempData({ ...tempData, expiry: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="card-inline-input expiry-input"
                                />
                            ) : (
                                <h5 onClick={() => handleEdit('visa')}>{cardData.visa.expiry} <span className="pencil-hint">✎</span></h5>
                            )}
                        </div>
                    </div>

                    {editingCard === 'visa' && (
                        <div className="card-actions-floated">
                            <button onClick={handleSave} className="save-btn">✓</button>
                            <button onClick={() => setEditingCard(null)} className="cancel-btn">✕</button>
                        </div>
                    )}
                </div>

                {/* Mastercard */}
                <div className={`credit-card master-card ${editingCard === 'master' ? 'card-editing' : ''}`}>
                    <div className="card-top">
                        <span className="card-chip"></span>
                        <span className="card-type">Mastercard</span>
                    </div>

                    <div className="card-number">
                        **** **** ****
                        {editingCard === 'master' ? (
                            <input
                                type="text"
                                value={tempData.pin}
                                onChange={(e) => setTempData({ ...tempData, pin: e.target.value })}
                                onKeyDown={handleKeyDown}
                                className="card-inline-input pin-input"
                            />
                        ) : (
                            <span className="editable-field" onClick={() => handleEdit('master')}>
                                {cardData.master.pin} <span className="pencil-hint">✎</span>
                            </span>
                        )}
                    </div>

                    <div className="card-bottom">
                        <div className="card-holder">
                            <span>Card Holder</span>
                            {editingCard === 'master' ? (
                                <input
                                    type="text"
                                    value={tempData.name}
                                    onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="card-inline-input name-input"
                                />
                            ) : (
                                <h5 onClick={() => handleEdit('master')}>{userName}</h5>
                            )}
                        </div>
                        <div className="card-expiry">
                            <span>Expires</span>
                            {editingCard === 'master' ? (
                                <input
                                    type="text"
                                    value={tempData.expiry}
                                    onChange={(e) => setTempData({ ...tempData, expiry: e.target.value })}
                                    onKeyDown={handleKeyDown}
                                    className="card-inline-input expiry-input"
                                />
                            ) : (
                                <h5 onClick={() => handleEdit('master')}>{cardData.master.expiry} <span className="pencil-hint">✎</span></h5>
                            )}
                        </div>
                    </div>

                    {editingCard === 'master' && (
                        <div className="card-actions-floated">
                            <button onClick={handleSave} className="save-btn">✓</button>
                            <button onClick={() => setEditingCard(null)} className="cancel-btn">✕</button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .is-loading-internal {
                    opacity: 0.6;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }
                .section-header-flex {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .editable-field {
                    cursor: pointer;
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: background 0.2s;
                }
                .editable-field:hover { background: rgba(255,255,255,0.15); }
                .pencil-hint { font-size: 10px; opacity: 0; transition: 0.2s; }
                .credit-card:hover .pencil-hint { opacity: 1; }

                .card-inline-input {
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.5);
                    color: white;
                    border-radius: 4px;
                    padding: 2px 6px;
                    outline: none;
                    text-align: center;
                    font-family: inherit;
                    font-size: inherit;
                }
                .pin-input { width: 60px; margin-left: 8px; font-weight: 600; }
                .name-input { width: 140px; text-align: left; }
                .expiry-input { width: 50px; }

                .card-actions-floated {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    display: flex;
                    gap: 8px;
                }
                .card-actions-floated button {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    font-size: 14px;
                    transition: transform 0.2s;
                }
                .card-actions-floated button:hover { transform: scale(1.1); }
                .save-btn { background: #1db954; color: white; }
                .cancel-btn { background: #ef4444; color: white; }

                .card-expiry h5 { cursor: pointer; display: flex; align-items: center; gap: 4px; }
            `}</style>
        </section>
    );
}

export default MyCards;
