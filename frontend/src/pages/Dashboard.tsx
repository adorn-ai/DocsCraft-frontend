import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useAuth } from '@/contexts/AuthContext'
import { getMyRepos, deleteRepo, subscribeToRepoUpdates } from '@/services/repoService'
import { AddRepoModal } from '@/components/AddRepoModal'
import { UserMenu } from '@/components/UserMenu'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Trash2, ExternalLink, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Dashboard() {
  // const { user } = useAuth()
  const navigate = useNavigate()
  const [repos, setRepos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<any>(null)

  const fetchRepos = async () => {
    try {
      const data = await getMyRepos()
      setRepos(data)
    } catch (error: any) {
      toast.error('Error', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`${API_URL}/paystack/subscription`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    }
  }

  useEffect(() => {
    fetchRepos()
    fetchSubscription()

    const repoSubscription = subscribeToRepoUpdates((payload) => {
      console.log('Repo updated:', payload)
      fetchRepos()
    })

    return () => {
      repoSubscription.unsubscribe()
    }
  }, [])

  const handleDelete = async (repoId: string) => {
    if (!confirm('Are you sure you want to delete this repository?')) return
    
    try {
      await deleteRepo(repoId)
      toast.success('Repository deleted')
      fetchRepos()
    } catch (error: any) {
      toast.error('Error', {
        description: error.message
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Ready</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Analyzing</Badge>
      default:
        return <Badge variant="secondary">Fetching</Badge>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'processing':
        return (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Analyzing repository structure...</span>
          </div>
        )
      case 'pending':
        return (
          <div className="flex items-center gap-2 text-sm text-orange-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Connecting to GitHub...</span>
          </div>
        )
      case 'failed':
        return (
          <p className="text-xs text-red-500">
            Failed to fetch repository. Please check the URL and try again.
          </p>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <img src="/logo.png" alt="GitCrafts" className="h-8 w-8" />
            <h1 className="text-2xl font-bold text-gray-900">GitCrafts</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!subscription?.subscribed && (
              <Button 
                onClick={() => navigate('/pricing')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Upgrade to Pro
              </Button>
            )}
            <UserMenu isPro={subscription?.subscribed} />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Repositories</h2>
            <p className="text-gray-600">Manage your connected repositories</p>
          </div>
          <AddRepoModal onSuccess={fetchRepos} />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : repos.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-orange-400 mb-4" />
              <p className="text-gray-700 font-medium mb-2">No repositories yet</p>
              <p className="text-sm text-gray-500 mb-6">Add your first repository to get started</p>
              <AddRepoModal onSuccess={fetchRepos} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <Card key={repo.id} className="hover:shadow-lg transition-all border-2 hover:border-orange-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate text-gray-900">
                        {repo.repo_url.split('/').slice(-1)[0].replace('.git', '')}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        Added {new Date(repo.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(repo.id)}
                      className="h-8 w-8 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {repo.is_private && <Badge variant="secondary">Private</Badge>}
                        {getStatusBadge(repo.clone_status)}
                      </div>
                    </div>

                    {/* Status message */}
                    {getStatusMessage(repo.clone_status)}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        asChild
                      >
                        <a 
                          href={repo.repo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </a>
                      </Button>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-1">
                              <Button
                                size="sm"
                                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => navigate(`/generate/${repo.id}`)}
                                disabled={repo.clone_status !== 'completed'}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                {repo.clone_status === 'completed' ? 'Generate' : 'Waiting...'}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {repo.clone_status !== 'completed' && (
                            <TooltipContent>
                              <p className="text-xs">
                                {repo.clone_status === 'pending' && 'Fetching repository from GitHub...'}
                                {repo.clone_status === 'processing' && 'Analyzing repository structure...'}
                                {repo.clone_status === 'failed' && 'Repository fetch failed. Please try adding again.'}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}