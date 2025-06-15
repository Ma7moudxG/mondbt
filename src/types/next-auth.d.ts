// next-auth.d.ts
declare module "next-auth" {
  interface User {
    id: string;
    role: string; // Use string type instead of union
  }
  
  interface Session {
    user: {
      id: string;
      role: string; // Match JWT structure
      name?: string;
      email?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}