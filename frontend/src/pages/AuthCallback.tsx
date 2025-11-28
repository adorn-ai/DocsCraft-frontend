import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const processOAuthCallback = async () => {
      // 1. Read the hash fragment from OAuth redirect
      const hash = window.location.hash

      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")

        // 2. If tokens exist, set the session
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })

          if (!error) {
            navigate('/dashboard')
            return
          }
        }
      }

      // 3. Fallback: check session normally
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard')
      } else {
        navigate('/login')
      }
    }

    processOAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading...</p>
    </div>
  )
}
