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
  CheckSquare
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AppLayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/goals', label: 'Goals', icon: Goal },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/schedule', label: 'Schedule', icon: Calendar },
  { path: '/routines', label: 'Routines', icon: RotateCcw },
  { path: '/health', label: 'Health', icon: Heart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/exceptions', label: 'Exceptions', icon: AlertCircle },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: profile } = useProfile();

  const xpForNextLevel = 100;
  const currentLevelXP = profile ? profile.xp_points % xpForNextLevel : 0;
  const xpProgress = (currentLevelXP / xpForNextLevel) * 100;

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
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">KARTAVYA</span>
            </Link>
          </div>

          {/* XP Bar */}
          {profile && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Level {profile.level}</span>
                  <span className="text-xs text-muted-foreground">
                    {currentLevelXP}/{xpForNextLevel} XP
                  </span>
                </div>
                <div className="flex items-center gap-1 text-accent-foreground">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{profile.current_streak}</span>
                </div>
              </div>
              <Progress value={xpProgress} className="h-2" />
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
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Total XP */}
          {profile && (
            <div className="p-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total XP</span>
                <span className="font-bold text-primary">{profile.xp_points.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent-foreground flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">KARTAVYA</span>
          </div>
          {profile && (
            <div className="flex items-center gap-1 text-accent-foreground">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-bold">{profile.current_streak}</span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
