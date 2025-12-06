import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { MFAChallenge } from '@/components/MFAChallenge'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithGithub: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  signInWithGithub: async () => {},
  signInWithGoogle: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsMFA, setNeedsMFA] = useState(false)
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Check if user has MFA enabled
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const verifiedFactor = factors?.totp?.find(f => f.status === 'verified')
        
        if (verifiedFactor) {
          // Check if already verified in this session
          try {
            const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            if (data && data.currentLevel !== 'aal2') {
              // Need MFA verification
              setNeedsMFA(true)
              setMfaFactorId(verifiedFactor.id)
              setLoading(false)
              return
            }
          } catch (e) {
            // If we can't get AAL, assume MFA is needed
            setNeedsMFA(true)
            setMfaFactorId(verifiedFactor.id)
            setLoading(false)
            return
          }
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      
      // Store GitHub token if available
      if (session?.provider_token) {
        const isGitHubToken = session.provider_token.startsWith('gho_') || 
                             session.provider_token.startsWith('ghp_') ||
                             session.provider_token.startsWith('github_pat_')
        
        if (isGitHubToken) {
          console.log('Storing GitHub token from session')
          localStorage.setItem('github_token', session.provider_token)
        } else {
          console.log('Provider token is not a GitHub token, skipping storage')
          localStorage.removeItem('github_token')
        }
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event)
      
      if (_event === 'SIGNED_IN' && session) {
        // Check if user has MFA enabled
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const verifiedFactor = factors?.totp?.find(f => f.status === 'verified')
        
        if (verifiedFactor) {
          try {
            const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
            if (data && data.currentLevel !== 'aal2') {
              // Need MFA verification
              setNeedsMFA(true)
              setMfaFactorId(verifiedFactor.id)
              return
            }
          } catch (e) {
            // If we can't get AAL, assume MFA is needed
            setNeedsMFA(true)
            setMfaFactorId(verifiedFactor.id)
            return
          }
        }
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setNeedsMFA(false)
      setMfaFactorId(null)
      
      // Store or remove GitHub token based on auth state
      if (session?.provider_token) {
        const isGitHubToken = session.provider_token.startsWith('gho_') || 
                             session.provider_token.startsWith('ghp_') ||
                             session.provider_token.startsWith('github_pat_')
        
        if (isGitHubToken) {
          console.log('Storing GitHub token:', session.provider_token.substring(0, 20) + '...')
          localStorage.setItem('github_token', session.provider_token)
        } else {
          console.log('Token is not a GitHub token (starts with:', session.provider_token.substring(0, 10) + '...)')
        }
      } else if (_event === 'SIGNED_OUT') {
        console.log('Removing GitHub token')
        localStorage.removeItem('github_token')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('github_token')
  }

  const signInWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'repo'
      }
    })

    if (error) {
      console.error('GitHub login error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      console.error('Google login error:', error)
      throw error
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Show MFA challenge if needed
  if (needsMFA && mfaFactorId) {
    return (
      <MFAChallenge
        factorId={mfaFactorId}
        onSuccess={async () => {
          // Refresh session after MFA
          const { data: { session } } = await supabase.auth.getSession()
          setSession(session)
          setUser(session?.user ?? null)
          setNeedsMFA(false)
          setMfaFactorId(null)
        }}
        onCancel={async () => {
          await supabase.auth.signOut()
          setNeedsMFA(false)
          setMfaFactorId(null)
        }}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, signInWithGithub, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}