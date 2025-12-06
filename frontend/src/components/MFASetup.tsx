import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function MFASetup() {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkMFAStatus()
  }, [])

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      
      if (error) throw error

      // Check if user has any verified TOTP factors
      const hasVerifiedFactor = data?.totp?.some(factor => factor.status === 'verified')
      setMfaEnabled(!!hasVerifiedFactor)
    } catch (error) {
      console.error('Error checking MFA status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnableMFA = async () => {
    try {
      setLoading(true)

      // Enroll in MFA
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App'
      })

      if (error) throw error

      if (data) {
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
        setFactorId(data.id) // Store the factor ID
        setShowSetupDialog(true)
      }
    } catch (error: any) {
      console.error('Error enabling MFA:', error)
      toast.error('Failed to enable 2FA', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error('Invalid code', {
        description: 'Please enter a 6-digit code'
      })
      return
    }

    if (!factorId) {
      toast.error('Setup error', {
        description: 'No factor ID found. Please try again.'
      })
      return
    }

    try {
      setVerifying(true)

      // Verify the code using the stored factor ID
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId,
        code: verifyCode
      })

      if (error) throw error

      toast.success('2FA enabled successfully!')
      setMfaEnabled(true)
      setShowSetupDialog(false)
      setVerifyCode('')
      setFactorId('')
    } catch (error: any) {
      console.error('Error verifying MFA:', error)
      toast.error('Verification failed', {
        description: error.message || 'Invalid code. Please try again.'
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleDisableMFA = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    try {
      setLoading(true)

      // Get all factors
      const { data: factors } = await supabase.auth.mfa.listFactors()
      
      // Unenroll all TOTP factors
      if (factors?.totp) {
        for (const factor of factors.totp) {
          const { error } = await supabase.auth.mfa.unenroll({
            factorId: factor.id
          })
          if (error) throw error
        }
      }

      toast.success('2FA disabled successfully')
      setMfaEnabled(false)
    } catch (error: any) {
      console.error('Error disabling MFA:', error)
      toast.error('Failed to disable 2FA', {
        description: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    toast.success('Secret copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCancelSetup = () => {
    setShowSetupDialog(false)
    setVerifyCode('')
    setFactorId('')
    setQrCode('')
    setSecret('')
  }

  if (loading && !showSetupDialog) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mfaEnabled ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">2FA Enabled</p>
                  <p className="text-sm text-green-700">Your account is protected with two-factor authentication</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisableMFA}
                disabled={loading}
                className="w-full"
              >
                Disable 2FA
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900">2FA Not Enabled</p>
                  <p className="text-sm text-orange-700">
                    Enable two-factor authentication for enhanced security
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleEnableMFA}
                disabled={loading}
                className="w-full"
              >
                <Shield className="mr-2 h-4 w-4" />
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={(open) => {
        if (!open) handleCancelSetup()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* QR Code */}
            <div className="flex justify-center">
              {qrCode && (
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Can't scan? Enter this code manually:</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={secret}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={copySecret}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter 6-digit code from your app</Label>
              <Input
                id="verify-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest font-mono"
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Recommended apps:</strong> Google Authenticator, Microsoft Authenticator, Authy, or 1Password
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelSetup}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyAndEnable}
              disabled={verifying || verifyCode.length !== 6}
            >
              {verifying ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}