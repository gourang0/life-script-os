import { useState } from 'react';
import { Layers, Plus, Trash2, Check, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  useScheduleTemplates,
  useCreateScheduleTemplate,
  useDeleteScheduleTemplate,
  useApplyTemplates,
  ScheduleTemplate,
} from '@/hooks/useScheduleTemplates';
import { toast } from 'sonner';

const DAYS = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
];

interface ScheduleTemplatesDialogProps {
  selectedDate: string;
}

export function ScheduleTemplatesDialog({ selectedDate }: ScheduleTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const { data: templates = [], isLoading } = useScheduleTemplates();
  const createTemplate = useCreateScheduleTemplate();
  const deleteTemplate = useDeleteScheduleTemplate();
  const applyTemplates = useApplyTemplates();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (selectedDays.length === 0) {
      toast.error('Select at least one day');
      return;
    }

    try {
      await createTemplate.mutateAsync({
        title: title.trim(),
        start_time: startTime,
        end_time: endTime,
        days_of_week: selectedDays,
        is_active: true,
      });
      toast.success('Template created');
      resetForm();
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate.mutateAsync(id);
      toast.success('Template deleted');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleApply = async () => {
    try {
      const result = await applyTemplates.mutateAsync({ templates, date: selectedDate });
      if (result.applied > 0) {
        toast.success(`Applied ${result.applied} template(s) to schedule`);
        setOpen(false);
      } else {
        toast.info('No templates apply to this day');
      }
    } catch (error) {
      toast.error('Failed to apply templates');
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedDays([1, 2, 3, 4, 5]);
    setIsCreating(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Layers className="h-4 w-4" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Schedule Templates
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={handleApply} disabled={applyTemplates.isPending || templates.length === 0} className="w-full gap-2">
            <Check className="h-4 w-4" />
            {applyTemplates.isPending ? 'Applying...' : 'Apply Templates to Today'}
          </Button>

          {isCreating ? (
            <div className="space-y-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Morning Workout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAYS.map((day) => (
                    <label
                      key={day.value}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border cursor-pointer transition-colors ${
                        selectedDays.includes(day.value)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      }`}
                    >
                      <Checkbox
                        checked={selectedDays.includes(day.value)}
                        onCheckedChange={() => toggleDay(day.value)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createTemplate.isPending} className="flex-1">
                  {createTemplate.isPending ? 'Creating...' : 'Create Template'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsCreating(true)} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          )}

          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No templates yet</p>
                  <p className="text-xs">Create templates to auto-populate your schedule</p>
                </div>
              ) : (
                templates.map((template: ScheduleTemplate) => (
                  <TemplateCard key={template.id} template={template} onDelete={handleDelete} />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateCard({ template, onDelete }: { template: ScheduleTemplate; onDelete: (id: string) => void }) {
  return (
    <div className="p-3 bg-card border border-border rounded-lg flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate">{template.title}</h4>
        <p className="text-xs text-muted-foreground">
          {template.start_time.slice(0, 5)} - {template.end_time.slice(0, 5)}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {DAYS.filter((d) => template.days_of_week.includes(d.value)).map((day) => (
            <Badge key={day.value} variant="secondary" className="text-[10px] px-1.5 py-0">
              {day.label}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(template.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
