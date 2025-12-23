import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function getGitHubToken(): Promise<string | null> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError || !session) {
    console.log('No session available')
    return null
  }

  console.log('=== Getting GitHub Token ===')
  console.log('User ID:', session.user.id)
  console.log('Provider:', session.user.app_metadata?.provider)
  console.log('Has provider_token:', !!session.provider_token)

  // FIRST: Check if provider_token exists in session (works right after OAuth)
  if (session.provider_token) {
    console.log('✓ Using provider_token from session')
    return session.provider_token
  }

  // SECOND: Check database for stored token
  try {
    console.log('Checking github_tokens table...')
    const { data: tokenData, error } = await supabase
      .from('github_tokens')
      .select('token')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      console.log('Database query error:', error.message)
      return null
    }

    if (tokenData?.token) {
      console.log('✓ Token found in database')
      console.log('Token preview:', tokenData.token.substring(0, 10) + '...')
      return tokenData.token
    }

    console.log('No token found anywhere')
    return null
  } catch (err) {
    console.error('Error fetching GitHub token:', err)
    return null
  }
}

export async function addRepo(repoUrl: string, isPrivate: boolean = false) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  // Get GitHub token from session or database
  const githubToken = await getGitHubToken()
  
  console.log('=== Adding Repository ===')
  console.log('Repo URL:', repoUrl)
  console.log('Is Private:', isPrivate)
  console.log('Has Token:', !!githubToken)
  
  // If private repo but no token, throw specific error
  if (isPrivate && !githubToken) {
    throw new Error('GitHub authentication required for private repositories. Please connect your GitHub account in Settings.')
  }

  const response = await fetch(`${API_URL}/github/add-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      repo_url: repoUrl,
      is_private: isPrivate,
      github_token: githubToken // Send token to backend
    })
  })

  if (!response.ok) {
    const error = await response.json()
    console.error('Backend error:', error)
    throw new Error(error.detail || 'Failed to add repository')
  }

  const result = await response.json()
  console.log('✓ Repository added successfully:', result)
  return result
}

export async function getMyRepos() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}/github/my-repos`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch repositories')
  }

  const data = await response.json()
  return data.repos
}

export async function deleteRepo(repoId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_URL}/github/delete-repo?repo_id=${repoId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to delete repository')
  }

  return response.json()
}

export async function fetchRepo(repoId: string) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  // Get GitHub token for private repos
  const githubToken = await getGitHubToken()

  const response = await fetch(`${API_URL}/github/fetch-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      repo_id: repoId,
      github_token: githubToken // Include token in case it's a private repo
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch repository')
  }

  return response.json()
}