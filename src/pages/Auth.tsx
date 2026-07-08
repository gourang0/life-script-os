import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Zap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { LampIntro } from '@/components/auth/LampIntro';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [lampEnabled, setLampEnabled] = useState(true);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: 'demo@lifescript.com', password: 'demopassword123', displayName: 'Demo User' },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Check if lamp is disabled
    const lampDisabled = localStorage.getItem('lampIntroDisabled') === 'true';
    setLampEnabled(!lampDisabled);
    
    // Check if intro was already shown this session or lamp is disabled
    const introShown = sessionStorage.getItem('lampIntroShown');
    if (introShown || lampDisabled) {
      setShowIntro(false);
      setShowContent(true);
    }
  }, []);

  const handleLightOn = () => {
    setTimeout(() => {
      setShowContent(true);
    }, 1200);
  };

  const handleIntroComplete = () => {
    sessionStorage.setItem('lampIntroShown', 'true');
    setShowIntro(false);
    setShowContent(true);
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoEmail = 'demo@lifescript.com';
    const demoPassword = 'demopassword123';
    try {
      let { error } = await signIn(demoEmail, demoPassword);
      
      // If the user does not exist in this Supabase instance yet, sign them up
      if (error && (
        error.message.toLowerCase().includes('invalid login credentials') || 
        error.message.toLowerCase().includes('user not found') ||
        error.message.toLowerCase().includes('invalid credentials')
      )) {
        const signupRes = await signUp(demoEmail, demoPassword, 'Demo User');
        error = signupRes.error;
      }

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Welcome to Demo Mode!', description: 'Redirecting to dashboard...' });
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AuthFormData) => {
    setLoading(true);
    try {
      const { error } = isLogin 
        ? await signIn(data.email, data.password)
        : await signUp(data.email, data.password, data.displayName);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: isLogin ? 'Welcome back!' : 'Account created!', description: 'Redirecting to dashboard...' });
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const replayLampIntro = () => {
    if (!lampEnabled) return;
    sessionStorage.removeItem('lampIntroShown');
    setShowContent(false);
    setShowIntro(true);
  };

  const toggleLampEnabled = () => {
    const newValue = !lampEnabled;
    setLampEnabled(newValue);
    localStorage.setItem('lampIntroDisabled', String(!newValue));
    toast({ title: newValue ? 'Lamp intro enabled' : 'Lamp intro disabled' });
  };

  return (
    <>
      {showIntro && lampEnabled && (
        <LampIntro 
          onComplete={handleIntroComplete} 
          onLightOn={handleLightOn}
        />
      )}
      
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        
        {/* Top right controls */}
        {showContent && (
          <div className="fixed top-4 right-4 z-20 flex items-center gap-2 animate-fade-in">
            {/* Toggle lamp button */}
            <button
              onClick={toggleLampEnabled}
              className="p-2 rounded-full backdrop-blur-sm border shadow-lg transition-all hover:scale-110"
              style={{
                background: 'hsl(var(--card) / 0.8)',
                borderColor: 'hsl(var(--border))',
              }}
              title={lampEnabled ? 'Disable lamp intro' : 'Enable lamp intro'}
            >
              <svg 
                className="w-5 h-5" 
                fill={lampEnabled ? 'currentColor' : 'none'}
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'hsl(var(--primary))' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            
            {/* Replay lamp button */}
            {lampEnabled && (
              <button
                onClick={replayLampIntro}
                className="p-2 rounded-full backdrop-blur-sm border shadow-lg transition-all hover:scale-110"
                style={{
                  background: 'hsl(var(--card) / 0.8)',
                  borderColor: 'hsl(var(--border))',
                }}
                title="Replay lamp animation"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  style={{ color: 'hsl(var(--primary))' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Main content */}
        <div 
          className={`relative z-10 min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-full max-w-md">
            {/* Glassmorphism card */}
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-[hsl(var(--chart-2))] to-primary rounded-2xl blur-xl opacity-30 animate-pulse" />
              
              <div className="relative backdrop-blur-xl bg-card/80 border border-border/50 rounded-2xl p-8 shadow-2xl">
                {/* Logo section */}
                <div className="text-center mb-8">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl animate-pulse" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--chart-2))] flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                      <Zap className="w-12 h-12 text-primary-foreground" />
                    </div>
                  </div>
                  
                  <h1 className="mt-6 text-3xl font-bold tracking-tight">
                    <span className="gradient-text">KARTAVYA</span>
                  </h1>
                  <p className="mt-2 text-muted-foreground flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    {isLogin ? 'Welcome back, warrior!' : 'Begin your journey'}
                    <Sparkles className="w-4 h-4 text-primary" />
                  </p>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {!isLogin && (
                      <FormField control={form.control} name="displayName" render={({ field }) => (
                        <FormItem className="animate-fade-in">
                          <FormLabel className="text-foreground/80">Display Name</FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input 
                                placeholder="Your name" 
                                className="pl-11 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all" 
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                    
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="email" 
                              placeholder="you@example.com" 
                              className="pl-11 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground/80">Password</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="pl-11 h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold group relative overflow-hidden"
                      disabled={loading}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                          <>
                            {isLogin ? 'Sign In' : 'Create Account'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>

                    <Button 
                      type="button" 
                      variant="outline"
                      className="w-full h-12 text-base font-semibold border-primary/30 hover:border-primary/80 transition-colors flex items-center justify-center gap-2 text-primary"
                      disabled={loading}
                      onClick={handleDemoLogin}
                    >
                      <Sparkles className="w-5 h-5 text-primary" />
                      Explore Demo Account
                    </Button>
                  </form>
                </Form>

                {/* Toggle */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <p className="text-center text-sm text-muted-foreground">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button 
                      onClick={() => setIsLogin(!isLogin)} 
                      className="text-primary font-medium hover:underline underline-offset-4 transition-all"
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom decorative text */}
            <p className="text-center mt-6 text-muted-foreground/60 text-xs">
              Discipline is the bridge between goals and accomplishment
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
