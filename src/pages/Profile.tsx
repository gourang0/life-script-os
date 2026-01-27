import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserBadges, useBadges } from '@/hooks/useBadges';
import { AppLayout } from '@/components/layout/AppLayout';
import { XPProgressRing } from '@/components/dashboard/XPProgressRing';
import { StreakDisplay } from '@/components/dashboard/StreakDisplay';
import { AvatarPicker } from '@/components/profile/AvatarPicker';
import { ColorThemePicker } from '@/components/profile/ColorThemePicker';
import { DesktopAppSettings } from '@/components/profile/DesktopAppSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: userBadges } = useUserBadges();
  const { data: allBadges } = useBadges();

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6 flex flex-col items-center gap-4">
              <AvatarPicker />
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">{profile?.display_name || 'User'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <XPProgressRing level={profile?.level || 1} currentXP={(profile?.xp_points || 0) % 100} xpForNextLevel={100} />
              <StreakDisplay currentStreak={profile?.current_streak || 0} bestStreak={profile?.best_streak || 0} />
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-primary">{profile?.xp_points?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{profile?.total_tasks_completed || 0}</p>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{userBadges?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{profile?.streak_freeze_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Streak Freezes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        {allBadges && allBadges.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allBadges.map(badge => {
                  const earned = earnedBadgeIds.has(badge.id);
                  return (
                    <div key={badge.id} className={`p-3 rounded-lg border text-center transition-all ${earned ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border opacity-50'}`}>
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="font-medium text-xs mt-1 text-foreground truncate">{badge.name}</p>
                      {earned && <Badge className="mt-1 text-[10px]" variant="secondary">Earned</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Desktop App Settings */}
        <DesktopAppSettings />

        {/* Color Theme Picker */}
        <ColorThemePicker />
      </div>
    </AppLayout>
  );
}
