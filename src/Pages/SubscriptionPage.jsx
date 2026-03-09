import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../components/Styles/SubscriptionPageStyles/SubscriptionPageStyle.css';

const STATUS_KEY = 'mm_subscription_status';
const PLAN_KEY = 'mm_subscription_plan';
const RENEWAL_KEY = 'mm_subscription_renewal';

const getStatus = () => {
    if (typeof window === 'undefined') return 'inactive';
    try {
        return localStorage.getItem(STATUS_KEY) || 'inactive';
    } catch (e) {
        return 'inactive';
    }
};

const getRenewal = () => {
    if (typeof window === 'undefined') return null;
    try {
        return localStorage.getItem(RENEWAL_KEY);
    } catch (e) {
        return null;
    }
};

const SubscriptionPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [status, setStatus] = React.useState(getStatus);
    const [renewalDate, setRenewalDate] = React.useState(getRenewal);
    const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState('card');
    const [paymentEmail, setPaymentEmail] = React.useState('');
    const [cardNumber, setCardNumber] = React.useState('');
    const [cardName, setCardName] = React.useState('');
    const [cardExpiry, setCardExpiry] = React.useState('');
    const [cardCvv, setCardCvv] = React.useState('');
    const [bankSenderName, setBankSenderName] = React.useState('');
    const [bankTransferDate, setBankTransferDate] = React.useState('');
    const [bankTransactionId, setBankTransactionId] = React.useState('');
    const [bankReference, setBankReference] = React.useState('');
    const [paymentError, setPaymentError] = React.useState('');

    React.useEffect(() => {
        const sync = () => {
            setStatus(getStatus());
            setRenewalDate(getRenewal());
        };
        window.addEventListener('storage', sync);
        window.addEventListener('subscription_update', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('subscription_update', sync);
        };
    }, []);

    const completeSubscription = () => {
        const renewal = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        try {
            localStorage.setItem(STATUS_KEY, 'active');
            localStorage.setItem(PLAN_KEY, 'monthly');
            localStorage.setItem(RENEWAL_KEY, renewal.toISOString().split('T')[0]);
        } catch (e) {
            // localStorage may be unavailable
        }
        setStatus('active');
        setRenewalDate(renewal.toISOString().split('T')[0]);
        window.dispatchEvent(new Event('subscription_update'));
    };

    const buildBankReference = React.useCallback(
        () => `MM-${Date.now().toString().slice(-6)}`,
        []
    );

    const openPayment = () => {
        setPaymentError('');
        setPaymentMethod('card');
        setPaymentEmail('');
        setCardNumber('');
        setCardName('');
        setCardExpiry('');
        setCardCvv('');
        setBankSenderName('');
        setBankTransferDate('');
        setBankTransactionId('');
        setBankReference(buildBankReference());
        setIsPaymentOpen(true);
    };

    const closePayment = () => {
        setIsPaymentOpen(false);
        setPaymentError('');
    };

    const confirmPayment = (e) => {
        e.preventDefault();
        const needsCard = paymentMethod === 'card';
        const needsBank = paymentMethod === 'bank';
        if (!paymentEmail.trim()) {
            setPaymentError(t('subscription.payment.errors.email'));
            return;
        }
        if (needsCard && (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim())) {
            setPaymentError(t('subscription.payment.errors.card'));
            return;
        }
        if (needsBank && (!bankSenderName.trim() || !bankTransferDate.trim())) {
            setPaymentError(t('subscription.payment.errors.bank'));
            return;
        }
        completeSubscription();
        closePayment();
    };

    const handleCancel = () => {
        try {
            localStorage.setItem(STATUS_KEY, 'inactive');
            localStorage.removeItem(PLAN_KEY);
        } catch (e) {
            // localStorage may be unavailable
        }
        setStatus('inactive');
        setRenewalDate(null);
        window.dispatchEvent(new Event('subscription_update'));
    };

    const isActive = status === 'active';
    const paymentCta = paymentMethod === 'bank'
        ? t('subscription.payment.submit_transfer')
        : t('subscription.payment.pay_now');

    React.useEffect(() => {
        if (paymentMethod !== 'bank') return;
        if (!bankReference) {
            setBankReference(buildBankReference());
        }
    }, [bankReference, buildBankReference, paymentMethod]);

    return (
        <div className="subscription-page-root">
            <div className="subscription-hero">
                <div className="subscription-copy">
                    <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                    <h2>{t('subscription.title')}</h2>
                    <p>{t('subscription.subtitle')}</p>

                    <div className="subscription-status">
                        <div className={`status-pill ${isActive ? 'active' : 'inactive'}`}>
                            <span className="status-dot" />
                            {isActive ? t('subscription.active') : t('subscription.inactive')}
                        </div>
                        {isActive && renewalDate && (
                            <div className="status-note">
                                {t('subscription.renews_on')} {renewalDate}
                            </div>
                        )}
                    </div>

                    <div className="subscription-cta-row">
                        {isActive ? (
                            <>
                                <button className="subscription-secondary-btn" onClick={handleCancel}>
                                    {t('subscription.cta_cancel')}
                                </button>
                                <button className="subscription-ghost-btn" onClick={() => navigate('/reports')}>
                                    {t('subscription.cta_manage')}
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="subscription-primary-btn premium-fire" onClick={openPayment}>
                                    {t('subscription.cta_subscribe')}
                                </button>
                                <button className="subscription-ghost-btn" onClick={() => navigate('/reports')}>
                                    {t('subscription.cta_manage')}
                                </button>
                            </>
                        )}
                    </div>

                    <div className="subscription-note">{t('subscription.billing_note')}</div>
                </div>

                <div className="plan-card">
                    <div className="plan-header">
                        <div>
                            <span className="plan-label">{t('subscription.plan_name')}</span>
                            <div className="plan-price">
                                <span className="price">{t('subscription.price')}</span>
                                <span className="suffix">{t('subscription.price_suffix')}</span>
                            </div>
                        </div>
                        <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                    </div>

                    <div className="plan-divider" />

                    <div className="plan-features-title">{t('subscription.features_title')}</div>
                    <ul className="plan-features">
                        <li>{t('subscription.features.premium_insights')}</li>
                        <li>{t('subscription.features.export_suite')}</li>
                        <li>{t('subscription.features.priority_alerts')}</li>
                        <li>{t('subscription.features.smart_budgets')}</li>
                        <li>{t('subscription.features.automation')}</li>
                        <li>{t('subscription.features.support')}</li>
                    </ul>
                    <div className="plan-disclaimer">{t('subscription.calculation_disclaimer')}</div>

                    <button className="subscription-primary-btn premium-fire" onClick={openPayment} disabled={isActive}>
                        {isActive ? t('subscription.active') : t('subscription.cta_subscribe')}
                    </button>
                </div>
            </div>

            <div className="subscription-highlight-grid">
                <div className="highlight-card">
                    <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                    <h4>{t('subscription.highlights.forecast_title')}</h4>
                    <p>{t('subscription.highlights.forecast_body')}</p>
                </div>
                <div className="highlight-card">
                    <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                    <h4>{t('subscription.highlights.anomaly_title')}</h4>
                    <p>{t('subscription.highlights.anomaly_body')}</p>
                </div>
                <div className="highlight-card">
                    <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                    <h4>{t('subscription.highlights.export_title')}</h4>
                    <p>{t('subscription.highlights.export_body')}</p>
                </div>
            </div>

            {isPaymentOpen && (
                <div className="payment-modal-overlay" onClick={closePayment}>
                    <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="payment-modal-header">
                            <div>
                                <span className="premium-badge premium-fire">{t('subscription.badge')}</span>
                                <h3>{t('subscription.payment.title')}</h3>
                            </div>
                            <button className="payment-close-btn" onClick={closePayment} type="button">×</button>
                        </div>

                        <form className="payment-form" onSubmit={confirmPayment}>
                            <div className="payment-methods">
                                <button
                                    type="button"
                                    className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    {t('subscription.payment.methods.card')}
                                </button>
                                <button
                                    type="button"
                                    className={`payment-method ${paymentMethod === 'bank' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('bank')}
                                >
                                    {t('subscription.payment.methods.bank')}
                                </button>
                            </div>

                            <div className="payment-field">
                                <label>{t('subscription.payment.email')}</label>
                                <input
                                    type="email"
                                    value={paymentEmail}
                                    onChange={(e) => setPaymentEmail(e.target.value)}
                                    placeholder={t('subscription.payment.email_placeholder')}
                                    required
                                />
                            </div>

                            {paymentMethod === 'card' && (
                                <>
                                    <div className="payment-field">
                                        <label>{t('subscription.payment.card_number')}</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(e.target.value)}
                                            placeholder="1234 5678 9012 3456"
                                            required
                                        />
                                    </div>
                                    <div className="payment-field">
                                        <label>{t('subscription.payment.card_name')}</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            placeholder={t('subscription.payment.card_name_placeholder')}
                                            required
                                        />
                                    </div>
                                    <div className="payment-grid">
                                        <div className="payment-field">
                                            <label>{t('subscription.payment.card_expiry')}</label>
                                            <input
                                                type="text"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(e.target.value)}
                                                placeholder="MM/YY"
                                                required
                                            />
                                        </div>
                                        <div className="payment-field">
                                            <label>{t('subscription.payment.card_cvv')}</label>
                                            <input
                                                type="password"
                                                value={cardCvv}
                                                onChange={(e) => setCardCvv(e.target.value)}
                                                placeholder="123"
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {paymentMethod === 'bank' && (
                                <div className="bank-transfer-panel">
                                    <div className="bank-transfer-header">
                                        <div>
                                            <h4>{t('subscription.payment.bank_details.title')}</h4>
                                            <p>{t('subscription.payment.bank_note')}</p>
                                        </div>
                                        <div className="bank-transfer-reference">
                                            <span>{t('subscription.payment.bank_reference')}</span>
                                            <strong>{bankReference}</strong>
                                        </div>
                                    </div>

                                    <div className="bank-transfer-grid">
                                        <div className="bank-transfer-item">
                                            <span>{t('subscription.payment.bank_details.bank_name_label')}</span>
                                            <strong>{t('subscription.payment.bank_details.bank_name_value')}</strong>
                                        </div>
                                        <div className="bank-transfer-item">
                                            <span>{t('subscription.payment.bank_details.account_name_label')}</span>
                                            <strong>{t('subscription.payment.bank_details.account_name_value')}</strong>
                                        </div>
                                        <div className="bank-transfer-item">
                                            <span>{t('subscription.payment.bank_details.iban_label')}</span>
                                            <strong>{t('subscription.payment.bank_details.iban_value')}</strong>
                                        </div>
                                        <div className="bank-transfer-item">
                                            <span>{t('subscription.payment.bank_details.swift_label')}</span>
                                            <strong>{t('subscription.payment.bank_details.swift_value')}</strong>
                                        </div>
                                        <div className="bank-transfer-item">
                                            <span>{t('subscription.payment.bank_details.branch_label')}</span>
                                            <strong>{t('subscription.payment.bank_details.branch_value')}</strong>
                                        </div>
                                    </div>

                                    <div className="bank-transfer-steps">
                                        <h5>{t('subscription.payment.bank_steps.title')}</h5>
                                        <ul>
                                            <li>{t('subscription.payment.bank_steps.step_1')}</li>
                                            <li>{t('subscription.payment.bank_steps.step_2')}</li>
                                            <li>{t('subscription.payment.bank_steps.step_3')}</li>
                                        </ul>
                                    </div>

                                    <div className="payment-field">
                                        <label>{t('subscription.payment.bank_fields.sender')}</label>
                                        <input
                                            type="text"
                                            value={bankSenderName}
                                            onChange={(e) => setBankSenderName(e.target.value)}
                                            placeholder={t('subscription.payment.bank_fields.sender_placeholder')}
                                            required
                                        />
                                    </div>

                                    <div className="payment-grid">
                                        <div className="payment-field">
                                            <label>{t('subscription.payment.bank_fields.transfer_date')}</label>
                                            <input
                                                type="date"
                                                value={bankTransferDate}
                                                onChange={(e) => setBankTransferDate(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="payment-field">
                                            <label>{t('subscription.payment.bank_fields.transaction_id')}</label>
                                            <input
                                                type="text"
                                                value={bankTransactionId}
                                                onChange={(e) => setBankTransactionId(e.target.value)}
                                                placeholder={t('subscription.payment.bank_fields.transaction_placeholder')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentError && <div className="payment-error">{paymentError}</div>}

                            <div className="payment-actions">
                                <button type="button" className="subscription-ghost-btn" onClick={closePayment}>
                                    {t('subscription.payment.cancel')}
                                </button>
                                <button type="submit" className="subscription-primary-btn premium-fire">
                                    {paymentCta}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPage;
