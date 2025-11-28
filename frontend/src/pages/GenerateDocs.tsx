import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { generateDocs } from '@/services/docService'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const DOC_TYPES = [
  { id: 'readme', label: 'README.md', description: 'Comprehensive project overview' },
  { id: 'api', label: 'API.md', description: 'API endpoint documentation' }
]

export default function GenerateDocs() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  
  const [repo, setRepo] = useState<any>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['readme'])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRepo()
  }, [repoId])

  const fetchRepo = async () => {
    const { data } = await supabase
      .from('repos')
      .select('*')
      .eq('id', repoId)
      .single()
    
    setRepo(data)
  }

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Select at least one document type')
      return
    }

    setLoading(true)
    try {
      const result = await generateDocs(repoId!, selectedTypes)
      
      toast.success('Documentation generated!', {
        description: 'Redirecting to view...'
      })
      
      // Redirect to view page
      setTimeout(() => {
        navigate(`/docs/${result.job_id}`)
      }, 1000)
      
    } catch (error: any) {
      toast.error('Generation failed', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  if (!repo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Documentation</h1>
          <p className="text-gray-600">
            Repository: <span className="font-medium">{repo.repo_url}</span>
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Documentation Types</CardTitle>
            <CardDescription>
              Choose which documentation files you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DOC_TYPES.map((type) => (
              <div key={type.id} className="flex items-start space-x-3">
                <Checkbox
                  id={type.id}
                  checked={selectedTypes.includes(type.id)}
                  onCheckedChange={() => toggleType(type.id)}
                  disabled={loading}
                />
                <div className="flex-1">
                  <label
                    htmlFor={type.id}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {type.label}
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          onClick={handleGenerate}
          size="lg"
          className="w-full"
          disabled={selectedTypes.length === 0 || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating... (this may take 30-60 seconds)
            </>
          ) : (
            'Generate Documentation'
          )}
        </Button>
      </main>
    </div>
  )
}