import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Crown, TrendingUp, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface UsageStats {
  plan: string
  is_pro: boolean
  usage: number | null
  limit: number | null
  remaining: number | null
  unlimited: boolean
}

export function UsageStats() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageStats()
  }, [])

  const fetchUsageStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) return

      const response = await fetch(`${API_URL}/docs/usage`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return null
  }

  // Pro users
  if (stats.is_pro) {
    return (
      <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Crown className="h-5 w-5 text-orange-600" />
            Pro Plan
          </CardTitle>
          <CardDescription>Unlimited documentation generations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-600">∞</p>
              <p className="text-sm text-gray-600">Unlimited generations</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-green-700">Active</p>
              <p className="text-xs text-gray-500">All features unlocked</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Free users
  const usagePercentage = stats.limit ? (stats.usage! / stats.limit) * 100 : 0
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = stats.remaining === 0

  return (
    <Card className={`border-2 ${isNearLimit ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Usage This Month
        </CardTitle>
        <CardDescription>
          {stats.limit} generations per month on Free plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold">
              {stats.usage} / {stats.limit}
            </span>
            <span className="text-sm text-gray-600">
              {stats.remaining} remaining
            </span>
          </div>
          <Progress 
            value={usagePercentage} 
            className={`h-2 ${isNearLimit ? 'bg-orange-200' : ''}`}
          />
        </div>

        {isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">Limit Reached</p>
              <p className="text-xs text-red-700">
                You've used all your generations this month. Upgrade to Pro for unlimited access.
              </p>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-900">Running Low</p>
              <p className="text-xs text-orange-700">
                You're close to your monthly limit. Consider upgrading to Pro.
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate('/pricing')}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600"
        >
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  )
}