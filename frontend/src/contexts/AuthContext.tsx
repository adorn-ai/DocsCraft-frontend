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
  const [showSlowLoadingWarning, setShowSlowLoadingWarning] = useState(false);

  // Timeout warning effect
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSlowLoadingWarning(true);
      }, 5000); // Show warning after 5 seconds

      return () => clearTimeout(timer);
    } else {
      setShowSlowLoadingWarning(false);
    }
  }, [loading]);

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

        // ---- CHECK MFA WITH TIMEOUT ----
        if (session) {
          try {
            // Set a timeout for MFA check to prevent hanging
            const mfaCheckPromise = Promise.race([
              (async () => {
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
                      return { needsMFA: true, factorId: verifiedFactor.id };
                    }
                  }
                }
                return { needsMFA: false, factorId: null };
              })(),
              // Timeout after 3 seconds
              new Promise<{ needsMFA: false; factorId: null }>((resolve) =>
                setTimeout(() => {
                  console.warn("MFA check timed out - continuing without MFA");
                  resolve({ needsMFA: false, factorId: null });
                }, 3000)
              ),
            ]);

            const mfaResult = await mfaCheckPromise;
            
            if (mfaResult.needsMFA && mfaResult.factorId) {
              setNeedsMFA(true);
              setMfaFactorId(mfaResult.factorId);
              setLoading(false); // Set loading false before returning
              return; // ⛔ stop normal flow
            }
          } catch (e) {
            console.error("MFA check error", e);
            // Continue anyway - don't block the app
          }
        }
      } catch (e) {
        console.error("Auth init error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // AUTH STATE LISTENER
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", event);

      setSession(session ?? null);
      setUser(session?.user ?? null);

      // SYNC GITHUB TOKEN TO DATABASE
      if (session?.provider_token && session?.user?.id) {
        console.log("Found GitHub provider token, syncing to database...");
        try {
          const { error } = await supabase
            .from("github_tokens")
            .upsert(
              {
                user_id: session.user.id,
                token: session.provider_token,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );

          if (error) {
            console.error("Error syncing GitHub token to DB:", error);
          } else {
            console.log("Successfully synced GitHub token to DB");
          }
        } catch (err) {
          console.error("Unexpected error syncing token:", err);
        }
      }

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

  // Loading screen with timeout warning
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Loading GitCrafts...</p>
          
          {showSlowLoadingWarning && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
              <p className="text-sm text-gray-700 mb-3">
                Taking longer than expected? This might be due to cached data.
              </p>
              <button 
                onClick={() => {
                  // Clear all auth-related data
                  localStorage.clear();
                  sessionStorage.clear();
                  // Clear Supabase storage
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('sb-')) {
                      localStorage.removeItem(key);
                    }
                  });
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium transition-colors"
              >
                Login and Retry
              </button>
            </div>
          )}
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
          
          // Redirect to dashboard after successful MFA
          window.location.href = '/dashboard';
        }}
        onCancel={async () => {
          console.log("MFA cancelled");
          await supabase.auth.signOut();
          setNeedsMFA(false);
          setMfaFactorId(null);
          
          // Redirect to login after cancellation
          window.location.href = '/login';
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