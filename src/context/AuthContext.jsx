import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // 1. Unified Profile Query
  const { data: user, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      console.info(`[AUTH] Synchronizing Identity: ${session.user.id}`);
      
      const { data, error } = await supabase
        .rpc('get_user_profile_v1', { p_user_id: session.user.id })
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.info('[AUTH] Triggering self-repair...');
          await supabase.rpc('sync_missing_profile');
          throw error; // Retry triggers after repair
        }
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
    retry: (failureCount, error) => error.code === 'PGRST116' && failureCount < 5,
    retryDelay: 2000,
    staleTime: 1000 * 60 * 15,
  });

  const loading = sessionLoading || (!!session && profileLoading);

  const refreshUser = async () => {
    if (session?.user?.id) {
      await queryClient.invalidateQueries({ queryKey: ['profile', session.user.id] });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setSessionLoading(false);
        }
      } catch (err) {
        console.error('[AUTH] Initialization error:', err);
        if (mounted) setSessionLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      
      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
