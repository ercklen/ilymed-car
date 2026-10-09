'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    throw new Error('Action réservée aux administrateurs.');
  }
}

export async function createStaffMember(formData: FormData) {
  await requireAdmin();

  const firstName        = (formData.get('firstName') as string)?.trim();
  const lastName         = (formData.get('lastName') as string)?.trim();
  const email            = (formData.get('email') as string)?.trim().toLowerCase();
  const phone            = (formData.get('phone') as string)?.trim() || null;
  const password         = formData.get('password') as string;
  const role             = (formData.get('role') as string) || 'STAFF';
  const permissionsList  = formData.getAll('permissions') as string[];
  const staffPermissions = permissionsList.join(',');

  if (!firstName || !lastName || !email || !password) {
    throw new Error('Veuillez remplir tous les champs obligatoires.');
  }

  if (password.length < 8) {
    throw new Error('Le mot de passe doit comporter au moins 8 caractères.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  // Hash password
  const { createHash, randomBytes } = await import('crypto');
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(password + salt).digest('hex');
  const passwordHash = `${salt}:${hash}`;

  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: role as 'STAFF' | 'ADMIN',
      staffPermissions: role === 'ADMIN' ? 'all' : staffPermissions,
    },
  });

  revalidatePath('/fr/admin/staff');
}

export async function updateStaffMember(userId: string, formData: FormData) {
  await requireAdmin();

  const firstName        = (formData.get('firstName') as string)?.trim();
  const lastName         = (formData.get('lastName') as string)?.trim();
  const phone            = (formData.get('phone') as string)?.trim() || null;
  const role             = (formData.get('role') as string) || 'STAFF';
  const newPassword      = (formData.get('password') as string)?.trim();
  const permissionsList  = formData.getAll('permissions') as string[];
  const staffPermissions = permissionsList.join(',');

  if (!firstName || !lastName) {
    throw new Error('Le prénom et le nom sont obligatoires.');
  }

  const dataToUpdate: any = {
    firstName,
    lastName,
    phone,
    role: role as 'STAFF' | 'ADMIN',
    staffPermissions: role === 'ADMIN' ? 'all' : staffPermissions,
  };

  if (newPassword && newPassword.length >= 8) {
    const { createHash, randomBytes } = await import('crypto');
    const salt = randomBytes(16).toString('hex');
    const hash = createHash('sha256').update(newPassword + salt).digest('hex');
    dataToUpdate.passwordHash = `${salt}:${hash}`;
  }

  await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate,
  });

  revalidatePath('/fr/admin/staff');
}

export async function deleteStaffMember(userId: string) {
  await requireAdmin();

  // Prevent deleting the main admin account
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.email === 'admin@ilymedcar.com') {
    throw new Error('Impossible de supprimer le compte administrateur principal.');
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath('/fr/admin/staff');
}
