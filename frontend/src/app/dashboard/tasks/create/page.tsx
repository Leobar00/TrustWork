'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { taskAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function CreateTaskPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await taskAPI.create({
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
      });

      console.log('Task created:', response.data);
      router.push('/dashboard/tasks');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Create New Task</CardTitle>
          <CardDescription>
            Post a task and find the perfect freelancer. Funds will be locked in escrow until completion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Build a modern landing page"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                minLength={5}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                Clear, concise title (5-255 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your requirements in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                minLength={20}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Be specific about deliverables, timeline, and success criteria (min. 20 characters)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (USDT) *</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                min="1"
                placeholder="100.00"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Minimum: 1 USDT. Funds will be locked on-chain in escrow.
              </p>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md space-y-2">
              <h4 className="font-semibold text-sm">How it works:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                <li>Task is created and visible to freelancers</li>
                <li>You assign a freelancer who accepts</li>
                <li>You lock USDT funds on-chain in escrow</li>
                <li>Freelancer submits work</li>
                <li>AI validates work in 4 stages</li>
                <li>If approved, payment releases automatically</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Task'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
