import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Sidebar } from '@/features/layout/Sidebar';
import { Header } from '@/features/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Header />
          <main className="flex-1 p-6 md:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
