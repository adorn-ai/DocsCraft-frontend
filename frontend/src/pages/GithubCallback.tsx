import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function GithubCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const finishGithubConnection = async () => {
      // wait for Supabase to finalize session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      // The REAL GitHub token:
      const githubAccessToken = session.provider_token;

      if (!githubAccessToken) {
        console.error("No GitHub OAuth token found in session:", session);
        navigate("/settings");
        return;
      }

      console.log("OAuth session:", session);

      // notify backend
      await fetch(`${import.meta.env.VITE_API_URL}/users/connect-github`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider: "github",
          github_access_token: githubAccessToken,
        }),
      });

      navigate("/settings");
    };

    finishGithubConnection();
  }, []);

  return <div>Connecting GitHub...</div>;
}
