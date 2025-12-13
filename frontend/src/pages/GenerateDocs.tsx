import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { generateDocs } from '@/services/docService'
import { supabase } from '@/lib/supabase'
import { Loader2, ArrowLeft, Crown, Lock } from 'lucide-react'
import { toast } from 'sonner'
// import { useAuth } from '@/contexts/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DOC_TYPES = [
  { 
    id: 'readme', 
    label: 'README.md', 
    description: 'Comprehensive project overview',
    proOnly: false 
  },
  { 
    id: 'api', 
    label: 'API.md', 
    description: 'API endpoint documentation',
    proOnly: true 
  },
  { 
    id: 'contributing', 
    label: 'CONTRIBUTING.md', 
    description: 'Contribution guidelines for your project',
    proOnly: true 
  }
]

interface Subscription {
  subscribed: boolean
  subscription?: {
    status: string
  }
}

export default function GenerateDocs() {
  const { repoId } = useParams()
  const navigate = useNavigate()
  // const { user } = useAuth()
  
  const [repo, setRepo] = useState<any>(null)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['readme'])
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  useEffect(() => {
    fetchRepo()
    fetchSubscription()
  }, [repoId])

  const fetchRepo = async () => {
    const { data } = await supabase
      .from('repos')
      .select('*')
      .eq('id', repoId)
      .single()
    
    setRepo(data)
  }

  const fetchSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${API_URL}/paystack/subscription`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubscription(data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error)
    } finally {
      setCheckingSubscription(false)
    }
  }

  const isPro = subscription?.subscribed || false

  const handleGenerate = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Select at least one document type')
      return
    }

    // Check if user is trying to generate pro-only docs
    const hasProOnlyDocs = selectedTypes.some(type => 
      DOC_TYPES.find(dt => dt.id === type)?.proOnly
    )

    if (hasProOnlyDocs && !isPro) {
      toast.error('Pro subscription required', {
        description: 'Upgrade to Pro to generate API and Contributing documentation',
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/pricing')
        }
      })
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
    const docType = DOC_TYPES.find(dt => dt.id === typeId)
    
    // Prevent selecting pro-only docs if not subscribed
    if (docType?.proOnly && !isPro) {
      toast.error('Pro feature', {
        description: 'Upgrade to Pro to access this documentation type',
        action: {
          label: 'Upgrade',
          onClick: () => navigate('/pricing')
        }
      })
      return
    }

    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  if (!repo || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          {isPro && (
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <Crown className="mr-1 h-3 w-3" />
              Pro
            </Badge>
          )}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Generate Documentation</h1>
          <p className="text-gray-600">
            Repository: <span className="font-medium">{repo.repo_url}</span>
          </p>
        </div>

        {/* Show upgrade prompt for free users */}
        {!isPro && (
          <Card className="mb-6 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-orange-900 mb-1">
                    Unlock More Documentation Types
                  </h3>
                  <p className="text-sm text-orange-800 mb-3">
                    Upgrade to Pro to generate API documentation, Contributing guides, and more!
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => navigate('/pricing')}
                  >
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Documentation Types</CardTitle>
            <CardDescription>
              Choose which documentation files you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {DOC_TYPES.map((type) => {
              const isLocked = type.proOnly && !isPro
              
              return (
                <div 
                  key={type.id} 
                  className={`flex items-start space-x-3 ${isLocked ? 'opacity-60' : ''}`}
                >
                  <Checkbox
                    id={type.id}
                    checked={selectedTypes.includes(type.id)}
                    onCheckedChange={() => toggleType(type.id)}
                    disabled={loading || isLocked}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={type.id}
                        className={`text-sm font-medium leading-none ${
                          isLocked ? 'cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        {type.label}
                      </label>
                      {type.proOnly && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            isPro 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {isPro ? (
                            <>
                              <Crown className="mr-1 h-3 w-3" />
                              Pro
                            </>
                          ) : (
                            <>
                              <Lock className="mr-1 h-3 w-3" />
                              Pro Only
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              )
            })}
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

        {/* Free user limitation notice */}
        {!isPro && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Free plan: README only • Pro plan: All document types
          </p>
        )}
      </main>
    </div>
  )
}