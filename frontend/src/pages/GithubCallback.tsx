import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // First: wait for session to arrive (GitHub OAuth exchange)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("OAuth event:", event, "session:", session);

        if (event === "SIGNED_IN" && session?.provider_token) {
          const token = session.provider_token;

          // Store in DB
          const { error: upsertError } = await supabase
            .from("github_tokens")
            .upsert(
              {
                user_id: session.user.id,
                token,
              },
              { onConflict: "user_id" }
            );

          if (upsertError) {
            console.error("Failed to save token:", upsertError);
          }

          // Navigate after successful save
          navigate("/settings");
        }
      }
    );

    // Fallback: after 2s, check session manually
    const timeout = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.provider_token) {
        navigate("/settings");
      }
    }, 2000);

    return () => {
      authListener.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return <div>Connecting GitHub...</div>;
}
