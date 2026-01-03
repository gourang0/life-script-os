import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  Calendar, 
  RotateCcw, 
  Heart, 
  BarChart3, 
  AlertCircle, 
  User,
  Menu,
  Flame,
  Zap,
  Goal,
  CheckSquare,
  Snowflake,
  Gift
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useStreakRestoreEligibility, useRestoreStreakFreeze } from '@/hooks/useStreakRestore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface AppLayoutProps {
  children: ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Goal },
  { path: '/schedule', label: 'Habit Quest', icon: Calendar },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/exceptions', label: 'Exceptions', icon: AlertCircle },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppLayout({ children, sidebarCollapsed = false, onSidebarToggle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: profile } = useProfile();
  const { data: restoreEligibility } = useStreakRestoreEligibility();
  const restoreFreeze = useRestoreStreakFreeze();

  const xpForNextLevel = 100;
  const currentLevelXP = profile ? profile.xp_points % xpForNextLevel : 0;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

  const handleRestoreFreeze = async () => {
    try {
      await restoreFreeze.mutateAsync();
      toast.success('Streak freeze restored! 🎉');
    } catch (error) {
      toast.error('Failed to restore streak freeze');
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          sidebarCollapsed ? "lg:w-0 lg:border-0 lg:overflow-hidden" : "lg:translate-x-0 w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Header */}
          <div className="p-4 border-b border-border">
            <Link to="/profile" className="flex items-center gap-3 group">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground font-bold">
                  {getInitials(profile?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {profile?.display_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">Level {profile?.level || 1}</p>
              </div>
              <ThemeToggle />
            </Link>
          </div>

          {/* XP Bar */}
          {profile && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {currentLevelXP}/{xpForNextLevel} XP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-accent-foreground">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold">{profile.current_streak}</span>
                </div>
              </div>
              <Progress value={xpProgress} variant="gradient" className="h-2" />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg glow-sm"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground hover:-translate-x-1"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Streak Freezes & Restore */}
          {profile && (
            <div className="p-4 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Snowflake className="h-4 w-4 text-blue-400" />
                  Streak Freezes
                </span>
                <span className="font-bold text-primary">{profile.streak_freeze_count}/3</span>
              </div>
              {restoreEligibility?.canRestore && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full gap-1 text-xs hover:bg-primary/10 hover:border-primary"
                  onClick={handleRestoreFreeze}
                  disabled={restoreFreeze.isPending}
                >
                  <Gift className="h-3 w-3" />
                  Restore Freeze (5 days worked!)
                </Button>
              )}
              {!restoreEligibility?.atMax && !restoreEligibility?.canRestore && (
                <p className="text-xs text-muted-foreground">
                  Work {5 - (restoreEligibility?.consecutiveDays || 0)} more days to earn a freeze
                </p>
              )}
            </div>
          )}

          {/* Total XP */}
          {profile && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Total XP
                </span>
                <span className="font-bold gradient-text">{profile.xp_points.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          
          {/* User profile in mobile header */}
          {profile && (
            <Link to="/profile" className="flex items-center gap-2">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.display_name || 'User'} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-chart-2 text-primary-foreground text-xs font-bold">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{profile.display_name || 'User'}</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile && (
              <div className="flex items-center gap-1 text-accent-foreground">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-bold">{profile.current_streak}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}