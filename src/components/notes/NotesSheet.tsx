import { useState } from 'react';
import { format } from 'date-fns';
import { StickyNote, Plus, Trash2, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotes, useCreateNote, useDeleteNote, Note } from '@/hooks/useNotes';
import { toast } from 'sonner';

export function NotesSheet() {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const handleCreate = async () => {
    if (!content.trim()) {
      toast.error('Note content is required');
      return;
    }

    try {
      await createNote.mutateAsync({ title: title.trim() || undefined, content: content.trim() });
      toast.success('Note created');
      setTitle('');
      setContent('');
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote.mutateAsync(id);
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <StickyNote className="h-5 w-5" />
          {notes.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              {notes.length > 9 ? '9+' : notes.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Quick Notes
          </SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          {isCreating ? (
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
              <Input
                placeholder="Title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                placeholder="Write your note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={createNote.isPending} className="flex-1">
                  {createNote.isPending ? 'Saving...' : 'Save Note'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          )}

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-3 pr-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No notes yet</p>
                </div>
              ) : (
                notes.map((note: Note) => (
                  <NoteCard key={note.id} note={note} onDelete={handleDelete} />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <div className="p-4 bg-card border border-border rounded-lg space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h4 className="font-medium text-foreground truncate">{note.title}</h4>
          )}
          <p className="text-xs text-muted-foreground">
            {format(new Date(note.created_at), 'MMM d, yyyy · h:mm a')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}
