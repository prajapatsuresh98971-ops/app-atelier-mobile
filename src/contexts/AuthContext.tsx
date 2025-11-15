import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "parent" | "child";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  setUserRole: (role: AppRole) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    const { data, error } = await (supabase as any)
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setRole(data.role as AppRole);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const signInWithApple = async () => {
    const redirectUrl = `${window.location.origin}/`;
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const setUserRole = async (userRole: AppRole) => {
    if (!user) return { error: new Error("No user logged in") };

    // Ensure the auth user exists server-side before inserting into user_roles.
    // Sometimes signup/session propagation to auth.users is slightly delayed —
    // retry the insert if we hit a foreign key violation.
    const maxAttempts = 5;
    let attempt = 0;
    let lastError: any = null;

    while (attempt < maxAttempts) {
      attempt++;

      try {
        // Double-check auth user is available via client API
        const { data: currentUser } = await supabase.auth.getUser();

        if (!currentUser?.user) {
          // If auth user not yet available, wait and retry
          await new Promise((res) => setTimeout(res, 300 * attempt));
          continue;
        }

        // Use the authoritative user id returned by the auth client
        const authUserId = currentUser.user.id;

        // Use upsert with onConflict to avoid duplicate insert errors and make this idempotent
        const { error } = await (supabase as any)
          .from("user_roles")
          .upsert({ user_id: authUserId, role: userRole }, { onConflict: 'user_id' });

        if (!error) {
          setRole(userRole);
          return { error: null };
        }

        lastError = error;

        // If foreign key constraint error (user row not present yet), retry after delay
        const msg = (error && (error.message || error.error_description || '') ).toString().toLowerCase();
        if (msg.includes('foreign key') || msg.includes('23503') || msg.includes('violates foreign key')) {
          await new Promise((res) => setTimeout(res, 300 * attempt));
          continue;
        }

        // Other errors: break and return
        break;
      } catch (err: any) {
        lastError = err;
        await new Promise((res) => setTimeout(res, 300 * attempt));
      }
    }

    // If we get here, all attempts failed
    return { error: lastError || new Error('Failed to set user role') };
  };

  const value = {
    user,
    session,
    role,
    isLoading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    setUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
