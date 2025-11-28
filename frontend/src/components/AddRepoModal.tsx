import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { addRepo } from '@/services/repoService'
import { Plus, Loader2, Info } from 'lucide-react'

export function AddRepoModal({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!repoUrl.includes('github.com')) {
      toast.error('Invalid URL', {
        description: 'Please enter a valid GitHub repository URL'
      })
      return
    }

    setLoading(true)

    try {
      await addRepo(repoUrl, isPrivate)
      toast.success('Repository added', {
        description: 'Fetching repository files...'
      })
      setOpen(false)
      setRepoUrl('')
      setIsPrivate(false)
      onSuccess()
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to add repository'
      })
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Repository</DialogTitle>
          <DialogDescription>
            Enter the GitHub repository URL you want to generate documentation for
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Example: https://github.com/facebook/react
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="private"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={loading}
              />
              <Label htmlFor="private" className="text-sm">
                Private repository
              </Label>
            </div>

            {isPrivate && (
              <Alert className="bg-orange-50 border-orange-200">
                <Info className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-800">
                  <strong>Note:</strong> Private repository support is currently in beta. 
                  If you experience issues, please use public repositories or contact support.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              "Add Repository"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}