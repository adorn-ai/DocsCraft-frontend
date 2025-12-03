import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    const reference = searchParams.get('reference')
    
    if (!reference) {
      setStatus('error')
      setMessage('No payment reference found')
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${API_URL}/paystack/verify-payment/${reference}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        setStatus('success')
        setMessage('Payment successful! Your Pro subscription is now active.')
        
        toast.success('Welcome to Pro!', {
          description: 'You now have unlimited documentation generations'
        })
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        throw new Error('Payment verification failed')
      }
      
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Payment verification failed')
      toast.error('Payment failed', {
        description: 'Please try again or contact support'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
              <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Payment Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          )}
          {status === 'error' && (
            <Button onClick={() => navigate('/pricing')} className="w-full">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}