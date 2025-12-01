import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  githubToken: string | null
  signInWithGithub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// helper function to get the correct redirect URL
const getRedirectUrl = () => {
  // check if in prod
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_SITE_URL 
      ? `${import.meta.env.VITE_SITE_URL}/auth/callback`
      : 'https://git-crafts.vercel.app/auth/callback'
  }
  // use localhost in dev
  return `${window.location.origin}/auth/callback`
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [githubToken, setGithubToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      // Extract GitHub provider token if available
      if (session?.provider_token) {
        setGithubToken(session.provider_token)
        console.log('GitHub token available:', session.provider_token.substring(0, 20) + '...')
      }
      
      setLoading(false)
    })

    // listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Extract GitHub provider token if available
        if (session?.provider_token) {
          setGithubToken(session.provider_token)
          console.log('GitHub token updated:', session.provider_token.substring(0, 20) + '...')
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  //enables sign in with github
  const signInWithGithub = async () => {
    const redirectUrl = getRedirectUrl()
    console.log('GitHub OAuth redirect URL:', redirectUrl)
    
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user user:email repo',
        redirectTo: redirectUrl
      }
    })
  }

  //enables sign in with google
  const signInWithGoogle = async () => {
    const redirectUrl = getRedirectUrl()
    console.log('Google OAuth redirect URL:', redirectUrl)
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      githubToken,
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