
import React, { useState, useEffect } from 'react';
import { auth, db, signOut } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, Key, LogOut, User, Save, CheckCircle2 } from '../components/icons/LucideIcons';
import { StepHeader } from '../components/StepHeader';

export const GoSettings: React.FC = () => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setApiKey(userDoc.data().geminiApiKey || '');
        }
      }
      setLoading(false);
    };

    fetchSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        geminiApiKey: apiKey,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save API key:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cartoon-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <StepHeader 
        title="PENGATURAN AKUN" 
        subtitle="Kelola profil dan konfigurasi API Anda"
        icon={<ShieldCheck className="w-8 h-8" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white border-4 border-cartoon-dark rounded-[2rem] shadow-cartoon p-6 text-center">
            <div className="w-24 h-24 mx-auto mb-4 border-4 border-cartoon-dark rounded-full overflow-hidden shadow-cartoon">
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-black text-cartoon-dark mb-1">{user?.displayName}</h2>
            <p className="text-slate-500 text-sm mb-6">{user?.email}</p>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-cartoon-pink text-white border-4 border-cartoon-dark rounded-2xl py-3 px-4 font-black shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <LogOut className="w-5 h-5" />
              KELUAR AKUN
            </button>
          </div>
        </div>

        {/* Settings Card */}
        <div className="md:col-span-2">
          <div className="bg-white border-4 border-cartoon-dark rounded-[2rem] shadow-cartoon p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-cartoon-yellow border-2 border-cartoon-dark rounded-xl">
                <Key className="w-6 h-6 text-cartoon-dark" />
              </div>
              <div>
                <h3 className="text-lg font-black text-cartoon-dark">Gemini API Key</h3>
                <p className="text-sm text-slate-500">Gunakan API Key Anda sendiri untuk performa lebih stabil</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  API KEY
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Masukkan Gemini API Key Anda..."
                  className="w-full bg-slate-50 border-4 border-cartoon-dark rounded-2xl p-4 font-bold text-cartoon-dark focus:ring-4 focus:ring-cartoon-blue/20 outline-none transition-all"
                />
              </div>

              <div className="bg-cartoon-blue/10 border-2 border-cartoon-blue/30 rounded-2xl p-4 flex gap-3">
                <InfoIcon className="w-5 h-5 text-cartoon-blue shrink-0 mt-0.5" />
                <p className="text-sm text-cartoon-blue font-medium leading-relaxed">
                  API Key ini akan disimpan secara aman di akun Anda. Jika dikosongkan, aplikasi akan menggunakan API Key default (jika tersedia).
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className={`w-full flex items-center justify-center gap-2 bg-cartoon-yellow text-cartoon-dark border-4 border-cartoon-dark rounded-2xl py-4 px-6 font-black shadow-cartoon hover:shadow-cartoon-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cartoon-dark"></div>
                ) : success ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    BERHASIL DISIMPAN!
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    SIMPAN PERUBAHAN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
