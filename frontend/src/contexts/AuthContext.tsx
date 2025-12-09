import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { MFAChallenge } from "@/components/MFAChallenge";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithGithub: async () => {},
  signInWithGoogle: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsMFA, setNeedsMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session ?? null);
        setUser(session?.user ?? null);

        // ---- CHECK MFA ----
        if (session) {
          try {
            const { data: factors } = await supabase.auth.mfa.listFactors();
            const verifiedFactor = factors?.totp?.find(
              (f) => f.status === "verified"
            );

            if (verifiedFactor) {
              const { data: aalData } =
                await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

              if (aalData?.currentLevel !== "aal2") {
                const { data: challenge } = await supabase.auth.mfa.challenge({
                  factorId: verifiedFactor.id,
                });

                if (challenge) {
                  setNeedsMFA(true);
                  setMfaFactorId(verifiedFactor.id);
                  return; // ⛔ stop normal flow
                }
              }
            }
          } catch (e) {
            console.error("MFA check error", e);
          }
        }
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session ?? null);
      setUser(session?.user ?? null);

      // Always end loading state after auth event
      setLoading(false);

      if (event === "SIGNED_OUT") {
        localStorage.removeItem("github_token");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("github_token");
  };

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/github/callback`,
        scopes: "repo",
      },
    });

    if (error) {
      console.error("GitHub login error:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      throw error;
    }
  };

  // Better loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading GitCrafts...</p>
        </div>
      </div>
    );
  }

  // Show MFA challenge if needed
  if (needsMFA && mfaFactorId) {
    return (
      <MFAChallenge
        factorId={mfaFactorId}
        onSuccess={async () => {
          console.log("MFA verification successful");
          // Refresh session after MFA
          const {
            data: { session },
          } = await supabase.auth.getSession();
          setSession(session);
          setUser(session?.user ?? null);
          setNeedsMFA(false);
          setMfaFactorId(null);
        }}
        onCancel={async () => {
          console.log("MFA cancelled");
          await supabase.auth.signOut();
          setNeedsMFA(false);
          setMfaFactorId(null);
        }}
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut,
        signInWithGithub,
        signInWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
