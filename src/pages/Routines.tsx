import { useState } from 'react';
import { RotateCcw, Sunrise, Moon, Dumbbell, BookOpen, Briefcase } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useRoutines, useDeleteRoutine, Routine } from '@/hooks/useRoutines';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { CreateRoutineDialog } from '@/components/routines/CreateRoutineDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const categoryIcons = {
  lifestyle: Sunrise,
  health: Dumbbell,
  study: BookOpen,
  work: Briefcase,
  other: Moon,
};

export default function Routines() {
  const { user, loading } = useAuth();
  const { data: routines = [], isLoading } = useRoutines();
  const deleteRoutine = useDeleteRoutine();
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const handleDelete = async (id: string) => {
    try {
      await deleteRoutine.mutateAsync(id);
      toast.success('Routine deleted');
    } catch (error) {
      toast.error('Failed to delete routine');
    }
  };

  const handleEdit = (routine: Routine) => {
    setEditingRoutine(routine);
  };

  const filteredRoutines = activeTab === 'all' 
    ? routines 
    : routines.filter(r => r.category === activeTab);

  const categoryCounts = {
    all: routines.length,
    lifestyle: routines.filter(r => r.category === 'lifestyle').length,
    health: routines.filter(r => r.category === 'health').length,
    study: routines.filter(r => r.category === 'study').length,
    work: routines.filter(r => r.category === 'work').length,
    other: routines.filter(r => r.category === 'other').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <RotateCcw className="w-8 h-8 text-primary" />
              Routines
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your daily recurring activities
            </p>
          </div>
          <CreateRoutineDialog />
        </div>

        {/* Category Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
            <TabsTrigger value="all" className="gap-1">
              All
              <span className="text-xs text-muted-foreground">({categoryCounts.all})</span>
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="gap-1">
              <Sunrise className="w-3 h-3" />
              <span className="hidden sm:inline">Lifestyle</span>
              <span className="text-xs text-muted-foreground">({categoryCounts.lifestyle})</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-1">
              <Dumbbell className="w-3 h-3" />
              <span className="hidden sm:inline">Health</span>
              <span className="text-xs text-muted-foreground">({categoryCounts.health})</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="gap-1">
              <BookOpen className="w-3 h-3" />
              <span className="hidden sm:inline">Study</span>
              <span className="text-xs text-muted-foreground">({categoryCounts.study})</span>
            </TabsTrigger>
            <TabsTrigger value="work" className="gap-1">
              <Briefcase className="w-3 h-3" />
              <span className="hidden sm:inline">Work</span>
              <span className="text-xs text-muted-foreground">({categoryCounts.work})</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-1">
              <Moon className="w-3 h-3" />
              <span className="hidden sm:inline">Other</span>
              <span className="text-xs text-muted-foreground">({categoryCounts.other})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-pulse text-muted-foreground">Loading routines...</div>
              </div>
            ) : filteredRoutines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-xl">
                <RotateCcw className="w-16 h-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {activeTab === 'all' ? 'No routines yet' : `No ${activeTab} routines`}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Create routines for your daily activities like morning workout, meal times, study sessions, and more.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.id}
                    routine={routine}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        {editingRoutine && (
          <CreateRoutineDialog
            editingRoutine={editingRoutine}
            onClose={() => setEditingRoutine(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
