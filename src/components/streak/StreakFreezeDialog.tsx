import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useCreateStreakFreeze } from '@/hooks/useStreakFreeze';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Snowflake, AlertTriangle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const REASON_CATEGORIES = [
  { value: 'tired', label: 'Tired / Low Energy' },
  { value: 'phone_distraction', label: 'Phone Distraction' },
  { value: 'had_to_go_out', label: 'Had to Go Out' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'lazy', label: 'Feeling Lazy' },
  { value: 'sick', label: 'Sick / Unwell' },
  { value: 'other', label: 'Other' },
];

interface StreakFreezeDialogProps {
  selectedDate?: string;
  trigger?: React.ReactNode;
}

export function StreakFreezeDialog({ selectedDate, trigger }: StreakFreezeDialogProps) {
  const [open, setOpen] = useState(false);
  const [reasonCategory, setReasonCategory] = useState<string>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [wasGenuine, setWasGenuine] = useState(true);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [step, setStep] = useState<'form' | 'feedback'>('form');

  const createStreakFreeze = useCreateStreakFreeze();
  const { data: profile } = useProfile();
  
  const freezeDate = selectedDate || format(new Date(), 'yyyy-MM-dd');
  const freezesAvailable = profile?.streak_freeze_count || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reasonCategory) {
      toast.error('Please select a reason');
      return;
    }

    if (freezesAvailable <= 0) {
      toast.error('No streak freezes available');
      return;
    }

    setIsGeneratingFeedback(true);

    try {
      // Get AI feedback first
      const { data: feedbackData, error: feedbackError } = await supabase.functions.invoke('streak-freeze-feedback', {
        body: {
          reason_category: reasonCategory,
          reason_details: reasonDetails,
          was_genuine: wasGenuine,
          streak_days: profile?.current_streak || 0,
        },
      });

      const feedback = feedbackData?.message || 'Your streak has been protected. Keep going!';
      setAiResponse(feedback);

      // Create the streak freeze log
      await createStreakFreeze.mutateAsync({
        freeze_date: freezeDate,
        reason_category: reasonCategory,
        reason_details: reasonDetails || undefined,
        was_genuine: wasGenuine,
        ai_response: feedback,
      });

      setStep('feedback');
      toast.success('Streak freeze used successfully');
    } catch (error) {
      console.error('Error using streak freeze:', error);
      toast.error('Failed to use streak freeze');
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    // Reset after animation
    setTimeout(() => {
      setStep('form');
      setReasonCategory('');
      setReasonDetails('');
      setWasGenuine(true);
      setAiResponse(null);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Snowflake className="h-4 w-4 mr-2" />
            Use Streak Freeze ({freezesAvailable})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Use Streak Freeze
          </DialogTitle>
        </DialogHeader>

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Snowflake className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium">Freezes Available</span>
                  </div>
                  <span className="text-2xl font-bold">{freezesAvailable}</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Why do you need a streak freeze? *</Label>
              <Select value={reasonCategory} onValueChange={setReasonCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASON_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Details (optional)</Label>
              <Textarea
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="What happened today?"
                maxLength={500}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="was-genuine" className="cursor-pointer">
                  Was this a genuine reason?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Be honest - it helps us give better feedback
                </p>
              </div>
              <Switch
                id="was-genuine"
                checked={wasGenuine}
                onCheckedChange={setWasGenuine}
              />
            </div>

            {!wasGenuine && (
              <div className="flex items-start gap-2 p-3 bg-orange-500/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  Thanks for being honest! We'll give you some real talk to help you do better next time.
                </p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createStreakFreeze.isPending || isGeneratingFeedback || freezesAvailable <= 0}
            >
              {isGeneratingFeedback ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Getting Feedback...
                </>
              ) : (
                <>
                  <Snowflake className="h-4 w-4 mr-2" />
                  Use Streak Freeze
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Streak Protected!</h3>
              <p className="text-sm text-muted-foreground">
                Your {profile?.current_streak || 0} day streak is safe
              </p>
            </div>

            {aiResponse && (
              <Card>
                <CardContent className="pt-4">
                  <p className="text-sm leading-relaxed">{aiResponse}</p>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleClose} className="w-full">
              Got it!
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
