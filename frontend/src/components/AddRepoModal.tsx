import { useState, useEffect } from 'react'
import { addRepo } from '@/services/repoService'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase' // Import Supabase

interface AddRepoModalProps {
  onSuccess: () => void
}

export function AddRepoModal({ onSuccess }: AddRepoModalProps) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // New state to track connection status correctly
  const [isGitHubConnected, setIsGitHubConnected] = useState(false)

  // Check connection on mount (similar to ConnectGitHub component)
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setIsGitHubConnected(false)
      return
    }

    // 1. Check if user signed in directly with GitHub
    const provider = session.user.app_metadata?.provider || session.user.user_metadata?.provider
    if (provider === 'github') {
      setIsGitHubConnected(true)
      return
    }

    // 2. Check if user linked GitHub manually (database check)
    const { data: tokenData } = await supabase
      .from('github_tokens')
      .select('token')
      .eq('user_id', session.user.id)
      .single()

    setIsGitHubConnected(!!tokenData?.token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repoUrl.trim()) {
      toast.error('Error', {
        description: 'Please enter a repository URL'
      })
      return
    }

    // Validate GitHub URL
    if (!repoUrl.includes('github.com')) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid GitHub repository URL'
      })
      return
    }

    // Check GitHub connection for private repos using the correct state
    if (isPrivate && !isGitHubConnected) {
      toast.error('GitHub Not Connected', {
        description: 'Please connect your GitHub account in Settings to add private repositories',
        action: {
          label: 'Go to Settings',
          onClick: () => {
            setOpen(false)
            navigate('/settings')
          }
        },
        duration: 5000
      })
      return
    }

    setLoading(true)
    try {
      await addRepo(repoUrl.trim(), isPrivate)
      
      toast.success('Repository Added', {
        description: 'Your repository is being processed...'
      })
      
      setOpen(false)
      setRepoUrl('')
      setIsPrivate(false)
      
      // Call onSuccess to trigger refresh
      onSuccess()
    } catch (error: any) {
      console.error('Add repo error:', error)
      
      // Parse error response
      let errorDetail = error.message
      try {
        const errorResponse = JSON.parse(error.message.split('detail')[1] || '{}')
        if (errorResponse.upgrade_required) {
          toast.error(errorResponse.error || 'Upgrade Required', {
            description: errorResponse.message,
            action: {
              label: 'Upgrade to Pro',
              onClick: () => {
                setOpen(false)
                navigate('/pricing')
              }
            },
            duration: 6000
          })
          return
        }
      } catch (e) {
        // Not a structured error, continue with normal handling
      }
      
      // Handle specific error cases
      if (errorDetail.includes('already added')) {
        toast.error('Duplicate Repository', {
          description: 'This repository has already been added'
        })
      } else if (errorDetail.includes('Private repositories are only available')) {
        toast.error('Pro Plan Required', {
          description: 'Private repositories are only available on Pro plan',
          action: {
            label: 'Upgrade Now',
            onClick: () => {
              setOpen(false)
              navigate('/pricing')
            }
          },
          duration: 6000
        })
      } else if (errorDetail.includes('authentication required')) {
        toast.error('Authentication Required', {
          description: 'Please connect your GitHub account in Settings',
          action: {
            label: 'Go to Settings',
            onClick: () => {
              setOpen(false)
              navigate('/settings')
            }
          },
          duration: 5000
        })
      } else if (errorDetail.includes('Invalid GitHub URL')) {
        toast.error('Invalid URL', {
          description: 'Please check the repository URL and try again'
        })
      } else {
        toast.error('Failed to Add Repository', {
          description: errorDetail || 'An unexpected error occurred'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Repository</DialogTitle>
            <DialogDescription>
              Connect a GitHub repository to generate documentation
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="repo-url">Repository URL</Label>
              <Input
                id="repo-url"
                placeholder="https://github.com/username/repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Enter the full GitHub repository URL
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="private"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                This is a private repository
              </Label>
            </div>

            {/* Updated conditional rendering using isGitHubConnected */}
            {isPrivate && !isGitHubConnected && (
              <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800">
                  <p className="font-medium mb-1">GitHub Connection Required</p>
                  <p>
                    You need to connect your GitHub account to access private repositories.{' '}
                    <button 
                      type="button"
                      className="underline font-medium"
                      onClick={() => {
                        setOpen(false)
                        navigate('/settings')
                      }}
                    >
                      Go to Settings
                    </button>
                  </p>
                </div>
              </div>
            )}

            {isPrivate && isGitHubConnected && (
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-green-800">
                  <p className="font-medium">GitHub Connected</p>
                  <p>You can add private repositories</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !repoUrl.trim()}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Repository'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}