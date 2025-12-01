import { useState } from 'react'
import { addRepo, fetchRepo } from '@/services/repoService'
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
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddRepoModalProps {
  onSuccess?: () => void
}

export function AddRepoModal({ onSuccess }: AddRepoModalProps) {
  const [open, setOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'adding' | 'fetching' | 'done'>('adding')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repoUrl.trim()) {
      toast.error('Please enter a repository URL')
      return
    }

    if (!repoUrl.includes('github.com')) {
      toast.error('Please enter a valid GitHub URL')
      return
    }

    setLoading(true)
    setStep('adding')

    try {
      // Step 1: Add repo to database
      toast.info('Adding repository...')
      const repo = await addRepo(repoUrl, isPrivate)
      
      // Step 2: Fetch repo content
      setStep('fetching')
      toast.info('Fetching repository content...')
      await fetchRepo(repo.id)
      
      // Success
      setStep('done')
      toast.success('Repository added successfully!')
      setOpen(false)
      setRepoUrl('')
      setIsPrivate(false)
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error adding repo:', error)
      toast.error('Error', {
        description: error.message || 'Failed to add repository'
      })
    } finally {
      setLoading(false)
      setStep('adding')
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      setOpen(newOpen)
      if (!newOpen) {
        setRepoUrl('')
        setIsPrivate(false)
        setStep('adding')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add GitHub Repository</DialogTitle>
            <DialogDescription>
              Enter the URL of the GitHub repository you want to add
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
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is-private"
                checked={isPrivate}
                onCheckedChange={(checked) => setIsPrivate(checked as boolean)}
                disabled={loading}
              />
              <Label
                htmlFor="is-private"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Private repository (requires GitHub authentication)
              </Label>
            </div>
            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <div className="text-sm">
                    {step === 'adding' && 'Adding repository to database...'}
                    {step === 'fetching' && 'Fetching repository content from GitHub...'}
                    {step === 'done' && 'Done!'}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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