import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ConnectGitHub() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [signedInWithGitHub, setSignedInWithGitHub] = useState(false);

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        setIsConnected(false);
        setLoading(false);
        return;
      }

      // Check if user signed in with GitHub
      const provider = session.user.app_metadata?.provider || session.user.user_metadata?.provider;
      const isGitHubAuth = provider === 'github';
      setSignedInWithGitHub(isGitHubAuth);

      // If signed in with GitHub, they're automatically connected
      if (isGitHubAuth) {
        setIsConnected(true);
        setLoading(false);
        return;
      }

      // For Google sign-in users, check if they've connected GitHub
      const { data: tokenData, error } = await supabase
        .from('github_tokens')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching GitHub token:', error);
        setIsConnected(false);
      } else {
        setIsConnected(!!tokenData?.token);
      }
    } catch (err: any) {
      console.error('Check GitHub connection failed:', err);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectGitHub = async () => {
    try {
      setConnecting(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/github/callback`,
          scopes: 'repo',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        console.error('GitHub OAuth error:', error);
        toast.error('Connection Failed', { description: error.message });
        setConnecting(false);
      }
      // OAuth flow will redirect automatically
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast.error('Connection Failed', { description: 'An unexpected error occurred' });
      setConnecting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    if (signedInWithGitHub) {
      toast.error('Cannot disconnect', {
        description: 'You signed in with GitHub. To disconnect, please sign out and sign in with Google.'
      });
      return;
    }

    if (!confirm('Are you sure you want to disconnect GitHub? You will lose access to private repositories.')) return;

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) return;

      const { error } = await supabase
        .from('github_tokens')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      setIsConnected(false);
      toast.success('GitHub disconnected successfully');
    } catch (err: any) {
      console.error('Failed to disconnect GitHub:', err);
      toast.error('Failed to disconnect', { description: err.message });
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Connection
        </CardTitle>
        <CardDescription>Connect your GitHub account to access private repositories</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-900">GitHub Connected</p>
                <p className="text-sm text-green-700">
                  {signedInWithGitHub 
                    ? 'You signed in with GitHub - automatically connected'
                    : 'You can access private repositories'
                  }
                </p>
              </div>
            </div>
            
            {signedInWithGitHub ? (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900">
                    You're signed in with GitHub. To disconnect, sign out and sign in with Google instead.
                  </p>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleDisconnectGitHub} 
                className="w-full"
              >
                Disconnect GitHub
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">GitHub Connection Required</p>
                <p className="text-sm text-orange-700 mb-2">
                  To access private repositories, you need to authenticate with GitHub.
                </p>
                <p className="text-xs text-orange-600">
                  Note: You signed in with Google, so you'll need to connect GitHub separately for private repo access.
                </p>
              </div>
            </div>
            <Button 
              onClick={handleConnectGitHub} 
              disabled={connecting} 
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              {connecting ? <>Redirecting to GitHub...</> : <>
                <Github className="mr-2 h-4 w-4" />
                Connect GitHub for Private Repos
              </>}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}