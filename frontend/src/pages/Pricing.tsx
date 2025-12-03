import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2, Crown, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Subscription {
  subscribed: boolean
  subscription?: {
    status: string
    created_at: string
    amount: number
  }
}

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscription()
    } else {
      setCheckingSubscription(false)
    }
  }, [user])

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

  const calculateNextRenewal = (createdAt: string) => {
    const created = new Date(createdAt)
    const nextRenewal = new Date(created)
    nextRenewal.setMonth(nextRenewal.getMonth() + 1)
    return nextRenewal.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(`${API_URL}/paystack/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          plan: 'pro'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize payment')
      }

      const data = await response.json()

      // Redirect to Paystack checkout
      window.location.href = data.authorization_url

    } catch (error: any) {
      toast.error('Payment Error', {
        description: error.message
      })
      setLoading(false)
    }
  }

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600">
            Generate professional documentation for your repositories
          </p>
        </div>

        {/* Show subscription status if user is subscribed */}
        {subscription?.subscribed && subscription.subscription && (
          <Card className="mb-8 border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-500 rounded-full">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-orange-900 mb-2">
                    You're already subscribed to Pro! 🎉
                  </h3>
                  <p className="text-orange-800 mb-4">
                    You have full access to all Pro features.
                  </p>
                  <div className="flex items-center gap-2 text-orange-700">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Next renewal: {calculateNextRenewal(subscription.subscription.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <Card className={subscription?.subscribed ? 'opacity-60' : ''}>
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for trying out</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">KES 0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>2 generations per month</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>READMEs only</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Public repositories</span>
                </li>
              </ul>
              <Button 
                variant="outline" 
                className="w-full" 
                disabled={!subscription?.subscribed}
              >
                {subscription?.subscribed ? 'Subscribed to Pro' : 'Current Plan'}
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className={`border-2 border-primary relative ${subscription?.subscribed ? 'ring-2 ring-orange-500' : ''}`}>
            {!subscription?.subscribed && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}
            {subscription?.subscribed && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Your Current Plan
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">Pro</CardTitle>
              <CardDescription>For big time developers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">KES 800</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">Unlimited generations</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>All document types</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Public repositories</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Private repositories</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Advanced customization</span>
                </li>
              </ul>
              <Button 
                className={`w-full ${subscription?.subscribed ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}
                onClick={handleUpgrade}
                disabled={loading || subscription?.subscribed}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : subscription?.subscribed ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Subscribed
                  </>
                ) : (
                  "Upgrade to Pro"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-600">
          <p>Need help choosing? <button className="text-orange-600 hover:underline">Contact us</button></p>
          <p className="mt-2">Powered by Paystack • Supports M-Pesa, Card, Bank Transfer</p>
        </div>
      </main>
    </div>
  )
}