
import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { UsageProvider } from './contexts/UsageContext';
import { Layout } from './components/layout/Layout';
import { VirtualTryOn } from './pages/VirtualTryOn';
import HomePage from './pages/HomePage';
import GoAesthetic from './pages/GoAesthetic';
import GoKids from './pages/GoKids';
import GoFamily from './pages/GoFamily';
import { GoModelVip } from './pages/GoModelVip';
import GoCermin from './pages/GoCermin';
import GoClean from './pages/GoClean';
import { GoSelfieVip } from './pages/GoSelfieVip';
import { GoSetup } from './pages/GoSetup';
import GoVideo from './pages/GoVideo';
import { FeatureGuide } from './pages/FeatureGuide';
import { GoSettings } from './pages/GoSettings';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged, User, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import Loader from './components/Loader';

export type View = 'home' | 'featureGuide' | 'virtualTryOn' | 'goAesthetic' | 'goKids' | 'goFamily' | 'goModelVip' | 'goCermin' | 'goClean' | 'goSelfieVip' | 'goSetup' | 'goSettings' | 'goVideo';

function LoginScreen() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cartoon-yellow p-4">
      <div className="bg-white border-4 border-cartoon-dark rounded-[2.5rem] shadow-cartoon-lg p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-black text-cartoon-dark mb-6 italic uppercase tracking-tighter">
          Affiliate <span className="text-cartoon-blue">Go</span>
        </h1>
        <p className="text-slate-600 mb-8 font-medium">
          Masuk dengan Google untuk mulai menggunakan AI Product Studio.
        </p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-4 border-cartoon-dark rounded-2xl py-4 px-6 font-black text-cartoon-dark shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          MASUK DENGAN GOOGLE
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const [activeView, setActiveView] = useState<View>('home');

  const handleNavigate = (view: View) => {
    setActiveView(view);
  };

  const renderActiveView = () => {
      switch (activeView) {
        case 'home': return <HomePage />;
        case 'featureGuide': return <FeatureGuide />;
        case 'virtualTryOn': return <VirtualTryOn />;
        case 'goModelVip': return <GoModelVip />;
        case 'goAesthetic': return <GoAesthetic />;
        case 'goKids': return <GoKids />;
        case 'goFamily': return <GoFamily />;
        case 'goCermin': return <GoCermin />;
        case 'goClean': return <GoClean />;
        case 'goSelfieVip': return <GoSelfieVip />;
        case 'goVideo': return <GoVideo />;
        case 'goSetup': return <GoSetup />;
        case 'goSettings': return <GoSettings />;
        default: return <HomePage />;
      }
  };

  return (
    <Layout activeView={activeView} setActiveView={handleNavigate}>
      {renderActiveView()}
    </Layout>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            createdAt: serverTimestamp(),
            lastLogin: serverTimestamp(),
          });
        } else {
          await setDoc(userRef, {
            lastLogin: serverTimestamp(),
          }, { merge: true });
        }
        
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loader />;

  return (
    <LanguageProvider>
      <UsageProvider>
        {user ? <AppContent /> : <LoginScreen />}
      </UsageProvider>
    </LanguageProvider>
  );
}

export default App;
