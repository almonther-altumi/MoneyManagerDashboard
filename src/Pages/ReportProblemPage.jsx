import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';
import Notification from '../components/Notification';
import { useNotification } from '../hooks/useNotification';
import '../components/Styles/ReportProblemPage.css'; // We'll create this style file next or use inline/existing
import emailjs from '@emailjs/browser';

const ReportProblemPage = () => {
    const { t } = useTranslation();
    const { notification, showNotification, hideNotification } = useNotification();
    const [issueText, setIssueText] = useState('');
    const [issueType, setIssueType] = useState('bug');
    const [status, setStatus] = useState('idle');


    // ... (other imports)

    // ... (inside component)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            showNotification(t('report.login_required') || "Please login to report an issue", "error");
            return;
        }

        if (issueText.trim().length === 0) {
            showNotification(t('report.empty_desc') || "Please describe the problem", "error");
            return;
        }

        setStatus('submitting');

        try {
            // 1. Save to Database (Firestore)
            await addDoc(collection(db, "reports"), {
                uid: user.uid,
                email: user.email,
                type: issueType,
                description: issueText,
                userAgent: navigator.userAgent,
                timestamp: new Date()
            });

            // 2. Send Email automatically via EmailJS
            // NOTE: You must replace these Placeholders with your actual EmailJS keys from https://dashboard.emailjs.com/
            const serviceID = 'service_6f6ppmo';
            const templateID = 'template_pocyqao';
            const publicKey = 'QTvTFWdzBZ6d7FLsN';

            const templateParams = {
                to_email: 'monthertumi2025@gmail.com',
                from_name: user.email || 'Anonymous User',
                issue_type: issueType,
                message: issueText
            };

            await emailjs.send(serviceID, templateID, templateParams, publicKey);

            // 3. Trigger Notification Dot
            localStorage.setItem('has_notification', 'true');
            window.dispatchEvent(new Event('notification_update'));

            showNotification(t('report.success') || "Report submitted & Email sent!", "success");
            setIssueText('');
            setStatus('success');
        } catch (error) {
            console.error("Error submitting report:", error);
            // Even if email fails, if DB save worked, we might want to say success but warn? 
            // For now, treat email fail as overall fail or just log it.
            // If it's the "placeholder" error, notify user.
            if (error.text?.includes("The user_id param is required") || error.status === 400) {
                showNotification("Error: Please configure EmailJS keys in the code!", "error");
            } else {
                showNotification(t('report.error') || "Failed to submit report.", "error");
            }
            setStatus('error');
        } finally {
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="report-page-root" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <Notification
                show={notification.show}
                message={notification.message}
                type={notification.type}
                onClose={hideNotification}
            />

            <header className="report-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{t('report.title')}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('report.intro')}</p>
            </header>

            <form onSubmit={handleSubmit} className="report-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px', background: 'var(--card-bg)', padding: '30px', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('report.type_label')}</label>
                    <select
                        value={issueType}
                        onChange={(e) => setIssueType(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-light)', color: 'var(--text)' }}
                    >
                        <option value="bug">{t('report.type_bug')}</option>
                        <option value="suggestion">{t('report.type_suggestion')}</option>
                        <option value="other">{t('report.type_other')}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('report.desc_label')}</label>
                    <textarea
                        value={issueText}
                        onChange={(e) => setIssueText(e.target.value)}
                        placeholder={t('report.desc_placeholder')}
                        rows="6"
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-light)', color: 'var(--text)', resize: 'vertical' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: status === 'submitting' ? 'wait' : 'pointer',
                        opacity: status === 'submitting' ? 0.7 : 1
                    }}
                >
                    {status === 'submitting' ? t('report.submitting') : t('report.submit_btn')}
                </button>
            </form>
        </div>
    );
};

export default ReportProblemPage;
