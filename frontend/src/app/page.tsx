'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, Sparkles, Lock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <nav className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TrustWork</span>
          </div>
          <Button onClick={() => router.push('/dashboard')}>Launch App</Button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI-Powered Escrow Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Secure freelance platform with automated work validation, on-chain USDT escrow, and AI-driven dispute resolution
          </p>
          <Button size="lg" onClick={() => router.push('/dashboard')} className="text-lg px-8 py-6">
            Get Started
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Lock className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">On-Chain Escrow</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Funds are cryptographically locked on-chain using Tether WDK. Platform never controls your money.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">AI Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Multi-stage AI analyzes work quality, requirements, and content before releasing payment automatically.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">Fair Disputes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI mediates disputes with 5-stage analysis and executes fair resolutions directly on blockchain.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Wallet className="h-10 w-10 text-primary mb-2" />
              <CardTitle className="text-lg">USDT Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Pay and get paid in USDT with transparent blockchain transactions. View all on explorer.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Create Task & Lock Funds</h3>
              <p className="text-sm text-muted-foreground">
                Client creates task and locks USDT in smart contract. Funds secured on-chain.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Submit & AI Validates</h3>
              <p className="text-sm text-muted-foreground">
                Freelancer submits work. AI runs 4-stage validation checking quality, requirements, and content.
              </p>
            </div>
            <div>
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Auto Payment Release</h3>
              <p className="text-sm text-muted-foreground">
                If validated, smart contract releases USDT to freelancer. Disputes resolved by AI with on-chain execution.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Built for Hackathon | Powered by OpenAI & Tether WDK</p>
        </div>
      </footer>
    </div>
  );
}
