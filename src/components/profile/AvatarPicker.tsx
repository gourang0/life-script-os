import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CARTOON_AVATARS = [
  { id: 'ninja', emoji: '🥷', bg: 'bg-slate-700' },
  { id: 'robot', emoji: '🤖', bg: 'bg-blue-600' },
  { id: 'alien', emoji: '👽', bg: 'bg-green-600' },
  { id: 'wizard', emoji: '🧙', bg: 'bg-purple-600' },
  { id: 'astronaut', emoji: '👨‍🚀', bg: 'bg-orange-600' },
  { id: 'superhero', emoji: '🦸', bg: 'bg-red-600' },
  { id: 'detective', emoji: '🕵️', bg: 'bg-amber-700' },
  { id: 'pirate', emoji: '🏴‍☠️', bg: 'bg-gray-800' },
  { id: 'dragon', emoji: '🐉', bg: 'bg-emerald-600' },
  { id: 'unicorn', emoji: '🦄', bg: 'bg-pink-500' },
  { id: 'lion', emoji: '🦁', bg: 'bg-yellow-600' },
  { id: 'wolf', emoji: '🐺', bg: 'bg-indigo-600' },
];

export function AvatarPicker() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSelectCartoon = async (avatar: typeof CARTOON_AVATARS[0]) => {
    try {
      await updateProfile.mutateAsync({ 
        avatar_url: `cartoon:${avatar.id}` 
      });
      toast.success('Avatar updated!');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      await updateProfile.mutateAsync({ avatar_url: publicUrl });
      toast.success('Avatar uploaded!');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const getAvatarDisplay = () => {
    if (!profile?.avatar_url) {
      return { type: 'fallback' as const };
    }
    if (profile.avatar_url.startsWith('cartoon:')) {
      const cartoonId = profile.avatar_url.replace('cartoon:', '');
      const cartoon = CARTOON_AVATARS.find(c => c.id === cartoonId);
      return { type: 'cartoon' as const, cartoon };
    }
    return { type: 'image' as const, url: profile.avatar_url };
  };

  const avatarDisplay = getAvatarDisplay();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative group">
          <Avatar className="h-24 w-24 border-4 border-primary/20 group-hover:border-primary transition-colors">
            {avatarDisplay.type === 'cartoon' && avatarDisplay.cartoon ? (
              <div className={`w-full h-full flex items-center justify-center ${avatarDisplay.cartoon.bg} text-4xl`}>
                {avatarDisplay.cartoon.emoji}
              </div>
            ) : avatarDisplay.type === 'image' ? (
              <AvatarImage src={avatarDisplay.url} alt="Profile" />
            ) : (
              <AvatarFallback className="bg-primary/10">
                <User className="h-12 w-12 text-primary" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="cartoon" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cartoon">Cartoon Characters</TabsTrigger>
            <TabsTrigger value="upload">Upload Photo</TabsTrigger>
          </TabsList>
          <TabsContent value="cartoon" className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {CARTOON_AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleSelectCartoon(avatar)}
                  className={`aspect-square rounded-xl ${avatar.bg} flex items-center justify-center text-3xl hover:scale-110 transition-transform hover:ring-2 ring-primary`}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Upload a photo from your device<br />
                <span className="text-xs">Max 2MB, JPG or PNG</span>
              </p>
              <Button disabled={uploading} asChild>
                <label className="cursor-pointer">
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                </label>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
