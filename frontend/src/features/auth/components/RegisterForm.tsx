'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InlineError } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'One uppercase letter')
      .regex(/[a-z]/, 'One lowercase letter')
      .regex(/\d/, 'One number')
      .regex(/[^A-Za-z0-9]/, 'One special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'bg-destructive', 'bg-destructive', 'bg-warning', 'bg-success/70', 'bg-success'];

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i < score ? colors[score] : 'bg-border',
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', score >= 4 ? 'text-success' : score >= 3 ? 'text-warning' : 'text-destructive')}>
        {labels[score]}
      </p>
    </div>
  );
}

export function RegisterForm() {
  const { registerAsync, registerPending } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch('password', '');

  async function onSubmit({ name, email, password }: FormData) {
    setFormError(null);
    try {
      await registerAsync({ name, email, password });
      toast({ title: 'Account created!', description: 'Welcome to ACH Finance.' });
    } catch {
      setFormError('Registration failed. This email may already be in use.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start managing your finances today — it&apos;s free
        </p>
      </div>

      {formError && <InlineError message={formError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Full name</label>
          <Input
            {...register('name')}
            type="text"
            placeholder="Juan Rodriguez"
            autoComplete="name"
            error={Boolean(errors.name)}
            startIcon={<User className="h-4 w-4" />}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email address</label>
          <Input
            {...register('email')}
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={Boolean(errors.email)}
            startIcon={<Mail className="h-4 w-4" />}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={Boolean(errors.password)}
            startIcon={<Lock className="h-4 w-4" />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <PasswordStrength password={password} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Confirm password</label>
          <Input
            {...register('confirmPassword')}
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            startIcon={<Lock className="h-4 w-4" />}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug select-none">
            I agree to the{' '}
            <Link href="/terms" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={registerPending}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
