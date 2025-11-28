import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function addRepo(repoUrl: string, isPrivate: boolean = false) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  // add repo to database
  const response = await fetch(`${API_URL}/github/add-repo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      repo_url: repoUrl,
      is_private: isPrivate
    })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to add repository')
  }
  
  const data = await response.json()
  return data.repo
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
    body: JSON.stringify({ repo_id: repoId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch repository')
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
    const error = await response.json()
    throw new Error(error.detail || 'Failed to fetch repositories')
  }
  
  const result = await response.json()
  return result.repos
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

// Real-time subscription to repo updates
export function subscribeToRepoUpdates(callback: (payload: any) => void) {
  return supabase
    .channel('repos-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'repos'
      },
      callback
    )
    .subscribe()
}