import { createContext, useState, useEffect, useContext, useRef } from "react";
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
  const isFetching = useRef(false);

  // 1. Central Profile Sync Logic
  const fetchUserProfile = async (currentSession, retry = 0) => {
    if (!currentSession?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    if (isFetching.current && retry === 0) {
      console.info('[AUTH] Profile fetch already in progress, skipping duplicate call.');
      return;
    }
    
    isFetching.current = true;
    
    try {
      // Use the newly deployed RPC function (Fixes "integer" type-casting ghosts)
      const { data, error } = await supabase
        .rpc('get_user_profile_v1', { p_user_id: currentSession.user.id })
        .single();

      if (error) {
        // PGRST116 means "0 rows found" - wait for DB catchup
        if (error.code === 'PGRST116' && retry < 5) {
          console.groupCollapsed(`[AUTH] Profile sync retry ${retry + 1}/5...`);
          
          if (retry === 0) {
             console.info('[AUTH] Triggering self-repair / profile claiming...');
             await supabase.rpc('sync_missing_profile');
          }
          
          console.groupEnd();
          
          await new Promise(r => setTimeout(r, 2000));
          return fetchUserProfile(currentSession, retry + 1);
        }
        
        // FAIL-SAFE: If session exists but profile cannot be loaded, 
        // log it clearly for technical troubleshooting but avoid reload loops.
        if (error.code !== 'PGRST116') {
          logSupabaseError('Profile Sync Failure', error);
          setLoading(false);
          return;
        }
        throw error;
      }

      console.info(`[AUTH] Profile synced successfully.`);
      setUser(data);
    } catch (err) {
      if (retry >= 5 || err.code !== 'PGRST116') {
        setUser(null);
      }
    } finally {
      isFetching.current = false;
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) await fetchUserProfile(currentSession);
  };

  useEffect(() => {
    let mounted = true;

    // SINGLE SOURCE OF TRUTH: Coordinate the startup sequence
    const initializeAuth = async () => {
      try {
        // 1. Get current session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        setSession(initialSession);
        
        // 2. If session exists, hydrate the profile immediately
        if (initialSession) {
          await fetchUserProfile(initialSession);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('[AUTH] Initialization error:', err);
        setLoading(false);
      }
    };

    initializeAuth();

    // 3. Reactive Auth Listener (Handles subsequent logins/logouts)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      
      setSession(currentSession);
      
      if (currentSession && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        await fetchUserProfile(currentSession);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
    <AuthContext.Provider value={{ user, session, loading, login, signOut, fetchUserProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
