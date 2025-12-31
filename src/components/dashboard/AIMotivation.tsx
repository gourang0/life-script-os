import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { useTasks } from '@/hooks/useTasks';

export function AIMotivation() {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { data: profile } = useProfile();
  const { data: tasks } = useTasks();

  const generateMotivation = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const completedToday = tasks?.filter(t => 
        t.is_completed && 
        t.completed_at && 
        new Date(t.completed_at).toDateString() === new Date().toDateString()
      ).length || 0;
      
      const pendingToday = tasks?.filter(t => 
        !t.is_completed && 
        t.scheduled_date === new Date().toISOString().split('T')[0]
      ).length || 0;

      const { data, error } = await supabase.functions.invoke('ai-motivation', {
        body: {
          level: profile.level,
          streak: profile.current_streak,
          tasksCompletedToday: completedToday,
          tasksPending: pendingToday,
          totalXP: profile.xp_points
        }
      });

      if (error) throw error;
      setMessage(data.message);
    } catch (error) {
      console.error('Error generating motivation:', error);
      setMessage("Keep pushing forward! Every step counts towards your goals. 💪");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile && !message) {
      generateMotivation();
    }
  }, [profile]);

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Motivation
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={generateMotivation}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">
          {loading ? (
            <span className="text-muted-foreground animate-pulse">Generating your personalized message...</span>
          ) : (
            message || "Loading your motivation..."
          )}
        </p>
      </CardContent>
    </Card>
  );
}
