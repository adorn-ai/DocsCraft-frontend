import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    async function run() {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Failed to get session:", error);
        navigate("/settings");
        return;
      }

      if (session?.provider_token) {
        const token = session.provider_token;

        // Upsert token into github_tokens table
        const { error: upsertError } = await supabase
          .from("github_tokens")
          .upsert(
            { user_id: session.user.id, token },
            { onConflict: "user_id" } // ensures existing token is updated
          );

        if (upsertError) {
          console.error("Failed to upsert GitHub token:", upsertError);
        }
      }

      navigate("/settings");
    }

    run();
  }, []);

  return <div>Connecting GitHub...</div>;
}
