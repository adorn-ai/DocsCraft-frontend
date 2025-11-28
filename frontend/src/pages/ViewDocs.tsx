import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getJobStatus, downloadDocs } from '@/services/docService'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Download, Copy, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ViewDocs() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  
  const [job, setJob] = useState<any>(null)
  const [docs, setDocs] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    try {
      console.log('Fetching job:', jobId)
      const jobData = await getJobStatus(jobId!)
      console.log('Job data:', jobData)
      setJob(jobData)
      
      if (jobData.status === 'completed') {
        console.log('Downloading docs...')
        const content = await downloadDocs(jobId!)
        console.log('Downloaded content length:', content.length)
        
        if (!content || content.length === 0) {
          throw new Error('Downloaded content is empty')
        }
        
        setDocs(content)
      } else if (jobData.status === 'failed') {
        setError('Documentation generation failed')
      } else if (jobData.status === 'processing') {
        setError('Documentation is still being generated')
      }
    } catch (error: any) {
      console.error('Error fetching job:', error)
      setError(error.message || 'Failed to load documentation')
      toast.error('Failed to load documentation', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!docs) {
      toast.error('No content to download')
      return
    }

    const blob = new Blob([docs], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${jobId}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Downloaded successfully!')
  }

  const handleCopy = () => {
    if (!docs) {
      toast.error('No content to copy')
      return
    }

    navigator.clipboard.writeText(docs)
    toast.success('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading documentation...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <p className="text-gray-800 font-medium">
                {error || 'Job not found'}
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!docs || docs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">
              No documentation content available
            </p>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const language = match ? match[1] : ''
                    
                    return !inline ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {docs}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}