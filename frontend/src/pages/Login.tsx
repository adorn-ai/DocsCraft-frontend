import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Github } from 'lucide-react'

export default function Login() {
  const { signInWithGithub, signInWithGoogle } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to DocGen AI
          </CardTitle>
          <CardDescription className="text-center">
            Generate comprehensive documentation for your repositories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={signInWithGithub} 
            className="w-full" 
            size="lg"
            variant="outline"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
          
          <Button 
            onClick={signInWithGoogle} 
            className="w-full" 
            size="lg"
            variant="outline"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              {/* Google icon SVG */}
            </svg>
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  )
}