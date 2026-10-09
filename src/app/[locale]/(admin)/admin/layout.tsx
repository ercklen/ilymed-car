import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminLayoutClient from './AdminLayoutClient';
import { getAdminNotificationMetrics } from '@/app/actions/admin';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // Not logged in → redirect to login
  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  // Logged in but not admin or staff → redirect to home
  const userRole = (session.user as any).role;
  if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
    redirect(`/${locale}`);
  }

  const staffPermissions = (session.user as any).staffPermissions || '';
  const userName = session.user.name || 'Utilisateur';
  const userEmail = session.user.email || '';

  const notificationData = await getAdminNotificationMetrics();

  return (
    <AdminLayoutClient 
      userRole={userRole} 
      userName={userName} 
      userEmail={userEmail} 
      staffPermissions={staffPermissions}
      notificationData={notificationData}
    >
      {children}
    </AdminLayoutClient>
  );
}
