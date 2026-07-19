import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: 'FindMyTrial <onboarding@resend.dev>',
      sendVerificationRequest: async ({ identifier, url }) => {
        await resend.emails.send({
          from: 'FindMyTrial <onboarding@resend.dev>',
          to: [identifier],
          subject: 'Sign in to FindMyTrial',
          html: `
            <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:24px;">
              <h2 style="color:#0F1F3D;">Sign in to FindMyTrial</h2>
              <p style="color:#6b7280;">Click the button below to sign in. 
                 This link expires in 24 hours.</p>
              <a href="${url}" 
                 style="display:inline-block;background:#C8922A;color:white;
                        padding:12px 24px;border-radius:24px;text-decoration:none;
                        font-weight:500;margin:16px 0;">
                Sign In
              </a>
              <p style="color:#9ca3af;font-size:12px;">
                If you didn't request this, you can ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
