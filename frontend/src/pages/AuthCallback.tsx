import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (session) => {
        if (session) {
          navigate("/dashboard");
        } else {
          navigate("/login");
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
      <p className="text-gray-600">Completing sign in...</p>
    </div>
  );
}
