import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Crown, Mail, Calendar, UserCircle, Loader2 } from 'lucide-react'
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

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscription()
  }, [])

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
      setLoading(false)
    }
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          {subscription?.subscribed && (
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <Crown className="mr-1 h-3 w-3" />
              Pro Member
            </Badge>
          )}
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-4 border-orange-200">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-orange-100 text-orange-600 text-2xl font-semibold">
                  {user?.email ? getInitials(user.email) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user?.user_metadata?.name || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Account created</p>
                  <p className="font-medium">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            ) : subscription?.subscribed ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500 rounded-full">
                      <Crown className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Pro Plan</p>
                      <p className="text-sm text-gray-600">Active subscription</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                {subscription.subscription && (
                  <div className="grid gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subscribed since</span>
                      <span className="font-medium">
                        {new Date(subscription.subscription.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Next renewal</span>
                      <span className="font-medium text-orange-600">
                        {calculateNextRenewal(subscription.subscription.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount</span>
                      <span className="font-medium">KES {(subscription.subscription.amount / 100).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/pricing')}
                >
                  Manage Subscription
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-2">
                  <Crown className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Free Plan</p>
                  <p className="text-sm text-gray-600 mt-1">You're currently on the free plan</p>
                </div>
                <Button 
                  className="mt-4 bg-gradient-to-r from-orange-500 to-orange-600"
                  onClick={() => navigate('/pricing')}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          
        {/* 
                <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your documentation generation activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-orange-600">-</p>
                <p className="text-sm text-gray-600 mt-1">Docs Generated</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-3xl font-bold text-orange-600">-</p>
                <p className="text-sm text-gray-600 mt-1">Repositories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        */}
      </main>
    </div>
  )
}