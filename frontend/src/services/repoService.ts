import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function addRepo(repoUrl: string, isPrivate: boolean = false) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }

  // Get GitHub token from localStorage
  const githubToken = localStorage.getItem('github_token')
  
  // If private repo but no token, throw specific error
  if (isPrivate && !githubToken) {
    throw new Error('GitHub authentication required for private repositories. Please log out and log back in with GitHub.')
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
    throw new Error(error.detail || 'Failed to add repository')
  }

  return response.json()
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

  return response.json()
}