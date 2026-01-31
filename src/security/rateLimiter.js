
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

const RATE_LIMIT_THRESHOLD = 5; // max 5 submissions
const TIME_WINDOW_MS = 10000; // in 10 seconds

export const checkRateLimit = async () => {
    const user = auth.currentUser;
    if (!user) return true;

    // 1. Local Tracking (Memory) - prevent spam in current session
    if (!window._subCount) {
        window._subCount = 0;
        window._firstSubTime = Date.now();
    }

    const now = Date.now();
    if (now - window._firstSubTime > TIME_WINDOW_MS) {
        window._subCount = 1;
        window._firstSubTime = now;
    } else {
        window._subCount++;
    }

    if (window._subCount > RATE_LIMIT_THRESHOLD) {
        // Suspend user in Firestore
        await suspendUser(user.uid, 'Excessive submissions (Rate limit exceeded)');
        return false;
    }

    return true;
};

export const suspendUser = async (uid, reason) => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            status: 'suspended',
            suspensionReason: reason,
            suspendedAt: serverTimestamp()
        });
    } catch {
        // If doc doesn't exist, create it
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
            status: 'suspended',
            suspensionReason: reason,
            suspendedAt: serverTimestamp(),
            email: auth.currentUser?.email || 'Unknown'
        }, { merge: true });
    }
};

export const isUserRestricted = async (uid) => {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        const data = snap.data();
        if (data.status === 'suspended' || data.status === 'banned') {
            return data;
        }
    }
    return null;
};
