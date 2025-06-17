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
        try {
          const user = USERS.find((u) => u.username === credentials?.username);
          if (user && user.password === credentials?.password) {
            return { id: user.id, name: user.name, role: user.role };
          }
          throw new Error("Invalid credentials");
        } catch (error) {
          // Return null instead of throwing to prevent NextAuth error redirect
          console.error("Authentication error:", error);
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
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  // Remove error page configuration
  // pages: {
  //   signIn: "/login",
  // },
};