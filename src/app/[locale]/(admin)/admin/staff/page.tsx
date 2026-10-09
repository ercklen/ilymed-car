import prisma from '@/lib/db';
import StaffClient from './StaffClient';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminStaffPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    redirect('/fr/admin');
  }

  const staffUsers = await prisma.user.findMany({
    where: {
      role: { in: ['STAFF', 'ADMIN'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <StaffClient 
      staffUsers={staffUsers.map(u => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        role: u.role,
        staffPermissions: u.staffPermissions,
        createdAt: u.createdAt.toISOString(),
      }))} 
    />
  );
}
