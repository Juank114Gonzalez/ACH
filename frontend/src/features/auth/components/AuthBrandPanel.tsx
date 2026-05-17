import { BarChart3, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    description: 'Track your spending patterns with beautiful charts',
  },
  {
    icon: Wallet,
    title: 'Smart budgeting',
    description: 'Set category budgets with automatic alerts at 80% and 100%',
  },
  {
    icon: TrendingUp,
    title: 'Portfolio tracking',
    description: 'Monitor your net worth growth over time',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-grade security',
    description: 'JWT + refresh token rotation, bcrypt, rate limiting',
  },
];

interface Props {
  variant?: 'login' | 'register';
}

export function AuthBrandPanel({ variant = 'login' }: Props) {
  return (
    <div className="relative hidden w-[480px] shrink-0 flex-col overflow-hidden bg-slate-950 lg:flex">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl" />

      <div className="relative flex flex-1 flex-col justify-between p-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <div>
            <p className="font-bold text-white">ACH Finance</p>
            <p className="text-xs text-slate-400">Personal Finance Platform</p>
          </div>
        </div>

        {/* Central content */}
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold leading-tight text-white">
              {variant === 'register'
                ? 'Take control of your finances'
                : 'Your money, clearly organized'}
            </h1>
            <p className="mt-3 text-slate-400">
              {variant === 'register'
                ? 'Join thousands managing their personal finances with confidence.'
                : 'A professional-grade platform for tracking income, expenses, and budgets.'}
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating stat cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Savings Rate', value: '63%', positive: true },
            { label: 'Monthly Balance', value: '+$5,330', positive: true },
            { label: 'Active Budgets', value: '6', positive: null },
            { label: 'Transactions', value: '247', positive: null },
          ].map(({ label, value, positive }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
            >
              <p className="text-xs text-slate-400">{label}</p>
              <p
                className={cn(
                  'mt-0.5 text-lg font-bold',
                  positive === true ? 'text-success' : 'text-white',
                )}
              >
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
