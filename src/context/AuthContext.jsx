import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    const initializeAuth = async () => {
      try {
        // Race getSession against a 4s timeout to prevent library-level hangs
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth Timeout')), 4000));
        
        const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]);
        
        setSession(session);
        if (session) {
          await fetchUserProfile(session);
        }
      } catch (err) {
        console.warn('Initialization session fetch failed or timed out:', err.message);
        // We still allow the app to load in "Guest Mode" rather than hanging
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Watchdog Timer (Force loading false after 5s)
    const watchdog = setTimeout(() => {
      console.warn('Auth Watchdog: Initialization timed out. Forcing ready state.');
      setLoading(false);
    }, 5000);

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        setSession(session);
        if (session) {
          await fetchUserProfile(session);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth change error:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(watchdog);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (session, retries = 3) => {
    if (!session?.user?.email) return;

    try {
      // Fetch extended data from public.users
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single();

      if (error) {
        if (retries > 0 && error.code === 'PGRST116') { // PGRST116 = No rows found
           console.log(`Profile not found yet, retrying... (${retries} left)`);
           await new Promise(resolve => setTimeout(resolve, 1000));
           return fetchUserProfile(session, retries - 1);
        }
        console.warn('Profile fetch (public.users) error:', error.message);
      } else {
        setUser(data);
      }
    } catch (err) {
      console.error('Critical fetchUserProfile error:', err);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const fetchUser = (id) => {
    if (session) fetchUserProfile(session);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      token: session?.access_token, 
      loading, 
      logout, 
      fetchUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
