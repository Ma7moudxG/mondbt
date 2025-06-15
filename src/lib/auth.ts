// src/lib/auth.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Dummy user data for demonstration
const USERS = [
  { id: "1", username: "admin", password: "admin", name: "Admin User", role: "admin" },
  { id: "2", username: "minister", password: "minister", name: "Minister User", role: "minister" },
  { id: "3", username: "parent", password: "parent", name: "Parent User", role: "parent" },
  { id: "4", username: "manager", password: "manager", name: "Manager User", role: "manager" },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = USERS.find((u) => u.username === credentials?.username);
        if (user && user.password === credentials?.password) {
          console.log(`AUTH_DEBUG: ✅ Authorization successful for user: ${user.name} Role: ${user.role}`);
          return { id: user.id, name: user.name, role: user.role };
        } else {
          console.log(`AUTH_DEBUG: ❌ Authorization failed for username: ${credentials?.username}`);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // false for localhost
      },
    },
  },
};

// Export the 'auth', 'signIn', and 'signOut' helpers directly from NextAuth
// This is crucial for the middleware to use.
export const { auth, signIn, signOut } = NextAuth(authOptions);

// Keep the handler exports for the /api/auth/[...nextauth] route
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };