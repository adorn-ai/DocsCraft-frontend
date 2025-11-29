import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGithub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper function to get the correct redirect URL
const getRedirectUrl = () => {
  // In production, use the site URL
  if (import.meta.env.PROD && import.meta.env.VITE_SITE_URL) {
    return `${import.meta.env.VITE_SITE_URL}/auth/callback`
  }
  // Development - use localhost
  return `${window.location.origin}/auth/callback`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN') {
          toast.success('Signed in successfully!')
        } else if (event === 'SIGNED_OUT') {
          toast.info('Signed out')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGithub = async () => {
    const redirectUrl = getRedirectUrl()
    // console.log('GitHub OAuth redirect URL:', redirectUrl)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'read:user user:email repo',
          redirectTo: redirectUrl
        }
      })

      if (error) {
        // console.error('GitHub OAuth error:', error)
        toast.error('Failed to sign in with GitHub', {
          description: error.message
        })
      }
    } catch (err: any) {
      // console.error('GitHub sign in error:', err)
      toast.error('Sign in failed', {
        description: err.message
      })
    }
  }

  const signInWithGoogle = async () => {
    const redirectUrl = getRedirectUrl()
    // console.log('Google OAuth redirect URL:', redirectUrl)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })

      if (error) {
        // console.error('Google OAuth error:', error)
        toast.error('Failed to sign in with Google', {
          description: error.message
        })
      }
    } catch (err: any) {
      // console.error('Google sign in error:', err)
      toast.error('Sign in failed', {
        description: err.message
      })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signInWithGithub, 
      signInWithGoogle, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}