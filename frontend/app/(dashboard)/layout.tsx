'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Calendar,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = session?.user?.role === 'ADMIN';
  const isManager = session?.user?.role === 'MANAGER' || isAdmin;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Teams',
      href: '/teams',
      icon: Users,
      current: pathname.startsWith('/teams'),
      show: isAdmin,
    },
    {
      name: 'Employees',
      href: '/employees',
      icon: UserCircle,
      current: pathname.startsWith('/employees'),
      show: isManager,
    },
    {
      name: 'Leaves',
      href: '/leaves',
      icon: Calendar,
      current: pathname.startsWith('/leaves'),
    },
  ].filter((item) => item.show !== false);

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">You are not logged in</h1>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  const initials = session?.user?.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
        <div className="font-semibold">Employee Management</div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <div className="text-lg font-medium">Employee Management</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        item.current
                          ? 'text-gray-500'
                          : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="border-t border-gray-200 p-4">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-gray-900"
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center h-16 px-4 border-b">
            <div className="text-lg font-medium">Employee Management</div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    item.current
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5',
                      item.current
                        ? 'text-gray-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{session?.user?.name}</div>
                <div className="text-xs text-gray-500">{session?.user?.email}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:text-gray-900"
              onClick={() => signOut({ callbackUrl: '/login' })}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center h-16 px-4 border-b">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center px-2 py-2">
                  <Skeleton className="h-5 w-5 mr-3" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </nav>
          </div>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    </div>
  );
}