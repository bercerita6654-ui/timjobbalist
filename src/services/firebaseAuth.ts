import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
// Prompt user to select account if needed
provider.setCustomParameters({ prompt: 'select_account' });

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        // Attempt to get OAuth credential / access token silently or via popup if needed
        const credential = GoogleAuthProvider.credentialFromResult(await signInWithPopup(auth, provider).catch(() => ({}) as any));
        // If popup was blocked or requires interaction, try user click fallback or get cached token
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
          return;
        }
      } catch (e) {
        console.warn('Auto token retrieval info:', e);
      }

      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try auto sign in popup once on mount if user is not signed in
        try {
          isSigningIn = true;
          const result = await signInWithPopup(auth, provider);
          const cred = GoogleAuthProvider.credentialFromResult(result);
          if (cred?.accessToken) {
            cachedAccessToken = cred.accessToken;
            if (onAuthSuccess) onAuthSuccess(result.user, cachedAccessToken);
          }
        } catch (err) {
          console.log('Auto popup sign-in awaiting user gesture:', err);
          if (onAuthFailure) onAuthFailure();
        } finally {
          isSigningIn = false;
        }
      }
    } else {
      // Auto-trigger sign-in popup on first load so user is immediately logged in
      try {
        if (!isSigningIn) {
          isSigningIn = true;
          const result = await signInWithPopup(auth, provider);
          const cred = GoogleAuthProvider.credentialFromResult(result);
          if (cred?.accessToken) {
            cachedAccessToken = cred.accessToken;
            if (onAuthSuccess) onAuthSuccess(result.user, cachedAccessToken);
          }
        }
      } catch (err) {
        console.log('Auto sign-in popup blocked or dismissed, user can click login button:', err);
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      } finally {
        isSigningIn = false;
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Sheets dari Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
