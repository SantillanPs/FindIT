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
  const fetchUserProfile = async (currentSession, retry = 0) => {
    if (!currentSession?.user) {
      setUser(null);
      return;
    }
    
    try {
      // Use the newly deployed RPC function (Fixes "integer" type-casting ghosts)
      const { data, error } = await supabase
        .rpc('get_user_profile_v1', { p_user_id: currentSession.user.id })
        .single();

      if (error) {
        // PGRST116 means "0 rows found" - wait for DB catchup
        if (error.code === 'PGRST116' && retry < 5) {
          console.groupCollapsed(`[AUTH] Profile sync retry ${retry + 1}/5...`);
          console.info('Context: User signed up but public.users record isn\'t visible yet.');
          
          // CRITICAL: TRIGER THE SELF-REPAIR (Handles orphaned items and missing user profiles)
          if (retry === 0) {
             console.info('[AUTH] Triggering self-repair / profile claiming...');
             await supabase.rpc('sync_missing_profile');
          }
          
          console.groupEnd();
          
          await new Promise(r => setTimeout(r, 2000));
          return fetchUserProfile(currentSession, retry + 1);
        }
        
        // CRITICAL FAIL-SAFE: If session exists but profile cannot be loaded (due to schema error), 
        // we MUST force a logout to prevent the user from being trapped in a loading loop.
        if (error.code !== 'PGRST116') {
          logSupabaseError('Profile Sync Failure', error);
          if (retry >= 2) {
             console.warn('[AUTH] Hard-resetting broken session state...');
             localStorage.clear();
             sessionStorage.clear();
             await supabase.auth.signOut();
             window.location.reload();
             return;
          }
        }
        throw error;
      }

      console.info(`[AUTH] Profile synced successfully.`);
      setUser(data);
    } catch (err) {
      if (retry >= 5 || err.code !== 'PGRST116') {
        setUser(null);
      }
    }
  };

  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) await fetchUserProfile(currentSession);
  };

  useEffect(() => {
    // 2. Immediate Session Check
    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          // BLOCK UNTIL IDENTITY IS SYNCED
          await fetchUserProfile(initialSession);
        }
      } finally {
        // ALWAYS UNLOCK: Avoid terminal hang if Supabase is down
        setLoading(false);
      }
    };

    initialize();

    // 3. Reactive Auth Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      try {
        setSession(currentSession);
        
        if (currentSession && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
          // DO NOT UNLOCK UNTIL PROFILE IS SYNCED FOR NEW LOGINS
          await fetchUserProfile(currentSession);
        } else if (!currentSession) {
          setUser(null);
        }
      } catch (err) {
        console.error('[AUTH] Critical failure in auth state listener:', err);
      } finally {
        setLoading(false);
      }
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
    <AuthContext.Provider value={{ user, session, loading, login, signOut, fetchUserProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
