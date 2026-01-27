import { useAutoLaunch } from '@/hooks/useElectronNotifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Monitor, Rocket, Bell, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function DesktopAppSettings() {
  const { autoLaunch, setAutoLaunch, loading, isElectron } = useAutoLaunch();

  // Only show this component when running in Electron
  if (!isElectron) {
    return (
      <Card className="border-dashed opacity-60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Desktop App Settings</CardTitle>
            <Badge variant="outline" className="ml-2 text-xs">Not Available</Badge>
          </div>
          <CardDescription>
            These settings are only available when running Life Script OS as a desktop app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Build and install the desktop version to access auto-launch and system tray features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Desktop App Settings</CardTitle>
          <Badge variant="secondary" className="ml-2 text-xs bg-primary/10 text-primary">Active</Badge>
        </div>
        <CardDescription>
          Configure how Life Script OS behaves on your desktop.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Auto-launch Setting */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Label htmlFor="auto-launch" className="text-sm font-medium">
                Launch on Startup
              </Label>
              <p className="text-xs text-muted-foreground">
                Automatically start Life Script OS when you log in to Windows
              </p>
            </div>
          </div>
          <Switch
            id="auto-launch"
            checked={autoLaunch}
            onCheckedChange={setAutoLaunch}
            disabled={loading}
          />
        </div>

        {/* System Tray Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-2/10">
              <Bell className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <Label className="text-sm font-medium">
                System Tray Widget
              </Label>
              <p className="text-xs text-muted-foreground">
                Hover over the tray icon to see today's stats at a glance
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">Always On</Badge>
        </div>

        {/* Background Running Info */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Tip:</strong> When you close the window, the app minimizes to the system tray 
            and continues running in the background. Right-click the tray icon for quick actions, or double-click to open.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
