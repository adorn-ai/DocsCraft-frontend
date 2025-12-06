import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface MFAChallengeProps {
  factorId: string
  onSuccess: () => void
  onCancel: () => void
}

export function MFAChallenge({ factorId, onSuccess, onCancel }: MFAChallengeProps) {
  const [code, setCode] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length !== 6) {
      toast.error('Invalid code', {
        description: 'Please enter a 6-digit code'
      })
      return
    }

    try {
      setVerifying(true)

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: code
      })

      if (error) throw error

      toast.success('Verification successful!')
      onSuccess()
    } catch (error: any) {
      console.error('MFA verification error:', error)
      toast.error('Verification failed', {
        description: error.message || 'Invalid code. Please try again.'
      })
      setCode('') // Clear code on error
    } finally {
      setVerifying(false)
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow numbers
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    setCode(cleaned)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Shield className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mfa-code" className="sr-only">
                Verification Code
              </Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                disabled={verifying}
                autoFocus
              />
              <p className="text-xs text-gray-500 text-center">
                Open your authenticator app to view your code
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={verifying || code.length !== 6}
              >
                {verifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onCancel}
                disabled={verifying}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have access to your device?{' '}
                <button
                  type="button"
                  className="text-orange-600 hover:underline"
                  onClick={() => toast.info('Contact support for account recovery')}
                >
                  Get help
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}