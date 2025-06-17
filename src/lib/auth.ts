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
  secret: process.env.NEXTAUTH_SECRET,
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
          return { id: user.id, name: user.name, role: user.role };
        }
        return null;
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
        token.role = (user as any).role; // Temporary workaround
      }
      return token;
    },
  // pages: {
  //   signIn: "/login",
  // },
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
