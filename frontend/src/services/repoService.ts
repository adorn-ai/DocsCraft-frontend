import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const addRepo = async (repoUrl: string, isPrivate: boolean = false, githubToken: string | null = null) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  // For private repos, we need the GitHub token
  const requestBody: any = {
    repo_url: repoUrl,
    is_private: isPrivate
  }

  // Add GitHub token if available (from session.provider_token)
  if (isPrivate && githubToken) {
    requestBody.github_token = githubToken
  } else if (isPrivate && session.provider_token) {
    // Fallback to session provider token
    requestBody.github_token = session.provider_token
  }

  const response = await fetch(`${API_URL}/github/add-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to add repository')
  }

  const data = await response.json()
  
  // Automatically trigger fetch after adding
  if (data.repo?.id) {
    // Start fetch in background (don't await to return quickly)
    fetchRepo(data.repo.id).catch(err => {
      console.error('Auto-fetch failed:', err)
    })
  }
  
  return data.repo
}

export const fetchRepo = async (repoId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_URL}/github/fetch-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      repo_id: repoId
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch repository')
  }

  return await response.json()
}

export const getMyRepos = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

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

export const deleteRepo = async (repoId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

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

  return await response.json()
}

// Subscription is now handled directly in Dashboard component