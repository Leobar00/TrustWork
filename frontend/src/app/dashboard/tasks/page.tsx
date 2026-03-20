'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { taskAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatUSDT, formatDate } from '@/lib/utils';
import { Briefcase, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function TasksPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [myTasks, setMyTasks] = useState<any[]>([]);
  const [availableTasks, setAvailableTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const [myTasksRes, availableTasksRes] = await Promise.all([
        taskAPI.list({ role: 'client' }),
        taskAPI.list({ status: 'open' }),
      ]);

      setMyTasks(myTasksRes.data.tasks || []);
      setAvailableTasks(availableTasksRes.data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      open: 'default',
      assigned: 'secondary',
      submitted: 'secondary',
      in_review: 'secondary',
      completed: 'default',
      disputed: 'destructive',
      cancelled: 'outline',
    };

    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disputed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading tasks...</div>;
  }

  const isClient = user?.role === 'client' || user?.role === 'both';
  const isFreelancer = user?.role === 'freelancer' || user?.role === 'both';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {isClient && 'Manage your posted tasks or find freelancers'}
            {isFreelancer && !isClient && 'Browse available tasks and start earning'}
          </p>
        </div>
        {isClient && (
          <Button onClick={() => router.push('/dashboard/tasks/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      </div>

      <Tabs defaultValue={isClient ? 'my-tasks' : 'available'} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          {isClient && (
            <TabsTrigger value="my-tasks">
              My Tasks ({myTasks.length})
            </TabsTrigger>
          )}
          {isFreelancer && (
            <TabsTrigger value="available">
              Available ({availableTasks.length})
            </TabsTrigger>
          )}
        </TabsList>

        {isClient && (
          <TabsContent value="my-tasks" className="space-y-4">
            {myTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first task and find talented freelancers
                  </p>
                  <Button onClick={() => router.push('/dashboard/tasks/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getStatusIcon(task.status)}
                          {getStatusBadge(task.status)}
                        </div>
                        <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {task.description}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          {formatUSDT(task.budget)}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        Created {formatDate(task.createdAt)}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {isFreelancer && (
          <TabsContent value="available" className="space-y-4">
            {availableTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No available tasks</h3>
                  <p className="text-muted-foreground text-center">
                    Check back soon for new opportunities
                  </p>
                </CardContent>
              </Card>
            ) : (
              availableTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{task.title}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {task.description}
                        </CardDescription>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-primary">
                          {formatUSDT(task.budget)}
                        </div>
                        <div className="text-xs text-muted-foreground">Earn</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Posted {formatDate(task.createdAt)}
                      </div>
                      <Button onClick={() => router.push(`/dashboard/tasks/${task.id}`)}>
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
