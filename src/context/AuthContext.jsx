import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

// EXTREME ERROR VISIBILITY: Global logger for technical troubleshooting
export const logSupabaseError = (context, err) => {
  console.group(`%c[BACKEND ERROR] ${context}`, 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
  console.error('Message:', err.message);
  if (err.hint) console.info('Hint:', err.hint);
  if (err.details) console.info('Details:', err.details);
  if (err.code) console.info('Error Code:', err.code);
  if (err.status) console.info('HTTP Status:', err.status);
  console.groupEnd();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Central Profile Sync Logic
  const fetchUserProfile = async (currentSession) => {
    if (!currentSession?.user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentSession.user.email)
        .single();

      if (error) {
        logSupabaseError('Profile Sync', error);
        throw error;
      }
      setUser(data);
    } catch (err) {
      // Background fail: Just log it loudly
    }
  };

  useEffect(() => {
    // 2. Immediate Session Check
    const initialize = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession) {
        await fetchUserProfile(initialSession);
      }
      setLoading(false);
    };

    initialize();

    // 3. Reactive Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        await fetchUserProfile(currentSession);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signOut, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
