import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const generateDocs = async (repoId: string, docTypes: string[]) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  // Get GitHub token from localStorage (stored during login)
  const githubToken = localStorage.getItem('github_token') || null

  const response = await fetch(`${API_URL}/docs/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      repo_id: repoId,
      doc_types: docTypes,
      github_token: githubToken  // Pass GitHub token
    })
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Failed to generate documentation')
  }

  return await response.json()
}

export const getJobStatus = async (jobId: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_URL}/docs/job/${jobId}`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch job status')
  }

  return await response.json()
}

export const downloadDocs = async (jobId: string, filename?: string) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  const url = filename 
    ? `${API_URL}/docs/job/${jobId}/download?filename=${filename}`
    : `${API_URL}/docs/job/${jobId}/download`

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to download documentation')
  }

  // Return blob for proper file download
  return await response.blob()
}

export const getDocHistory = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) throw new Error('Not authenticated')

  const response = await fetch(`${API_URL}/docs/history`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch documentation history')
  }

  const data = await response.json()
  return data.jobs
}