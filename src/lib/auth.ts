import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const users = [
          { id: "1", username: "admin", password: "admin", role: "admin" },
          { id: "2", username: "parent", password: "parent", role: "parent" },
          { id: "3", username: "minister", password: "minister", role: "minister" },
        ];

        const user = users.find(
          u => u.username === credentials?.username?.toLowerCase() && 
               u.password === credentials?.password
        );

        if (!user) return null;
        
        return {
          id: user.id,
          name: user.username,
          role: user.role
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };