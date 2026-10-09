import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './lib/db';
import { createHash } from 'crypto';

function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(':');
  const computedHash = createHash('sha256').update(password + salt).digest('hex');
  return computedHash === storedHash;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/fr/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email    = credentials.email as string;
        const password = credentials.password as string;

        // Hard-coded admin shortcut (for development convenience)
        if (email === 'admin@ilymedcar.com' && password === 'admin') {
          let adminUser = await prisma.user.findUnique({ where: { email } });
          if (!adminUser) {
            adminUser = await prisma.user.create({
              data: {
                email,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
              }
            });
          }
          return { id: adminUser.id, name: 'Admin', email: adminUser.email, role: 'ADMIN' };
        }

        // Real DB lookup
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const valid = verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        return {
          id:               user.id,
          name:             `${user.firstName} ${user.lastName}`,
          email:            user.email,
          role:             user.role,
          staffPermissions: user.staffPermissions,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id               = user.id;
        token.role             = (user as any).role;
        token.staffPermissions = (user as any).staffPermissions;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id               = token.id;
        (session.user as any).role             = token.role;
        (session.user as any).staffPermissions = token.staffPermissions;
      }
      return session;
    },
  },
});
