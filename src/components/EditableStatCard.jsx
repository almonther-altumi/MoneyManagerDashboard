
import React, { useState } from 'react';

const EditableStatCard = ({ label, value, trend, onSave, prefix = "$", color = "var(--primary)" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);

    const handleSave = () => {
        onSave(tempValue);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') setIsEditing(false);
    };

    return (
        <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
            <span className="label" style={{ color: 'var(--text-muted)' }}>{label}</span>

            {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                    <span style={{ fontSize: '20px', fontWeight: '700', color: color }}>{prefix}</span>
                    <input
                        type="number"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        style={{
                            background: 'var(--bg)',
                            border: '2px solid ' + color,
                            borderRadius: '8px',
                            padding: '4px 12px',
                            fontSize: '20px',
                            fontWeight: '600',
                            width: '120px',
                            color: 'var(--text)',
                            outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                background: color,
                                border: 'none',
                                color: 'white',
                                borderRadius: '6px',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                            }}
                        >
                            ✓
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{
                                background: 'var(--border-muted)',
                                border: 'none',
                                color: 'var(--text)',
                                borderRadius: '6px',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '5px 0' }}>
                    <span className="amount" style={{ color: color, fontSize: '28px', fontWeight: '800' }}>{prefix}{Number(value).toLocaleString()}</span>
                    <button
                        className="edit-stat-btn"
                        onClick={() => {
                            setTempValue(value);
                            setIsEditing(true);
                        }}
                        style={{
                            opacity: 0,
                            transition: 'all 0.2s',
                            background: 'var(--highlight)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--text-muted)'
                        }}
                    >
                        ✎
                    </button>
                </div>
            )}

            <span className="trend" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trend}</span>

            <style>{`
                .stat-card:hover .edit-stat-btn {
                    opacity: 1 !important;
                }
                .edit-stat-btn:hover {
                    background-color: var(--border-muted) !important;
                    color: var(--text) !important;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
};

export default EditableStatCard;
