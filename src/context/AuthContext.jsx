import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
    };

    initializeAuth();

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      // Fetch extended data from public.users
      // Note: We use string ID comparison or link auth.users.id -> public.users.supabase_id
      // For now, assuming standard setup where we fetch by id or email
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', (await supabase.auth.getUser()).data.user.email)
        .single();

      if (error) {
        console.warn('Profile fetch error (might not exist yet):', error.message);
      } else {
        setUser(data);
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, token: session?.access_token, loading, logout, fetchUser: () => fetchUserProfile(session?.user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
