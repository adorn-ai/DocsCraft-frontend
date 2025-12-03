import { useState } from 'react'
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

interface AddRepoModalProps {
  onSuccess: () => void
}

export function AddRepoModal({ onSuccess }: AddRepoModalProps) {
  const [open, setOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)

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
      
      // Handle specific error cases
      if (error.message.includes('already added')) {
        toast.error('Duplicate Repository', {
          description: 'This repository has already been added'
        })
      } else if (error.message.includes('authentication required')) {
        toast.error('Authentication Required', {
          description: 'Please ensure you are logged in with GitHub and have granted repository access',
          duration: 5000
        })
      } else if (error.message.includes('Invalid GitHub URL')) {
        toast.error('Invalid URL', {
          description: 'Please check the repository URL and try again'
        })
      } else {
        toast.error('Failed to Add Repository', {
          description: error.message || 'An unexpected error occurred'
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

            {isPrivate && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Private Repository Access</p>
                  <p>
                    Make sure you're logged in with GitHub and have granted repository access permissions. 
                    If you're having issues, try logging out and logging back in.
                  </p>
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