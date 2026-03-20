'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { userAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wallet, AlertCircle } from 'lucide-react';
import { formatAddress } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user, setAuth, logout } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer' | 'both'>('both');
  const [error, setError] = useState('');

  const connectWallet = async () => {
    if (!walletAddress) {
      setError('Please enter a wallet address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Invalid wallet address format');
      return;
    }

    setIsConnecting(true);
    setError('');

    try {
      const response = await userAPI.connectWallet(walletAddress, selectedRole);
      const { user, token } = response.data;
      setAuth(user, token);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Wallet className="h-12 w-12 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>Enter your wallet address to start using TrustWork</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">I want to:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('client')}
                  className={`p-3 rounded-md border-2 transition-all ${
                    selectedRole === 'client'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm font-medium">Hire</div>
                  <div className="text-xs text-muted-foreground">Post tasks</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('freelancer')}
                  className={`p-3 rounded-md border-2 transition-all ${
                    selectedRole === 'freelancer'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm font-medium">Work</div>
                  <div className="text-xs text-muted-foreground">Find tasks</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('both')}
                  className={`p-3 rounded-md border-2 transition-all ${
                    selectedRole === 'both'
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:border-primary/50'
                  }`}
                >
                  <div className="text-sm font-medium">Both</div>
                  <div className="text-xs text-muted-foreground">Hire & Work</div>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Input
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && connectWallet()}
              />
              {error && (
                <div className="flex items-center space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            <Button className="w-full" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Demo: Use any valid Ethereum address format (0x...)
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button onClick={() => router.push('/dashboard')} className="text-2xl font-bold">
              TrustWork
            </button>
            <div className="hidden md:flex space-x-4">
              <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard/tasks')}>
                Tasks
              </Button>
              <Button variant="ghost" onClick={() => router.push('/dashboard/chat')}>
                AI Chat
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="font-medium">
                {user?.walletAddress ? formatAddress(user.walletAddress) : 'Loading...'}
              </div>
              <div className="text-muted-foreground">Reputation: {user?.reputationScore || 0}/100</div>
            </div>
            <Button variant="outline" onClick={logout}>
              Disconnect
            </Button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
