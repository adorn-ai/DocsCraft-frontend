import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('Processing OAuth callback...')
        console.log('Current URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        
        // Supabase automatically handles the OAuth callback
        // Just check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          setError(error.message)
          setTimeout(() => navigate('/login'), 2000)
          return
        }

        if (session) {
          console.log('Session found, redirecting to dashboard')
          navigate('/dashboard')
        } else {
          console.log('No session found, redirecting to login')
          setTimeout(() => navigate('/login'), 1000)
        }
      } catch (err: any) {
        console.error('OAuth callback error:', err)
        setError(err.message)
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleOAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Authentication Error</p>
          <p className="text-sm text-gray-600">{error}</p>
          <p className="text-xs text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}