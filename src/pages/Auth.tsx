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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  });

  useEffect(() => {
    // Check if intro was already shown this session
    const introShown = sessionStorage.getItem('lampIntroShown');
    if (introShown) {
      setShowIntro(false);
      setShowContent(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('lampIntroShown', 'true');
    setShowIntro(false);
    setTimeout(() => setShowContent(true), 100);
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

  return (
    <>
      {showIntro && <LampIntro onComplete={handleIntroComplete} />}
      
      <div className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        
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
