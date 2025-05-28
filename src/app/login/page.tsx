"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
  
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      callbackUrl: "/", // must hit root so middleware redirects correctly
    });

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl mb-4">Login</h1>
        <div className="mb-4">
          <label className="block mb-2">Username</label>
          <input 
            name="username" 
            type="text" 
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Password</label>
          <input 
            name="password" 
            type="password" 
            className="p-2 border rounded w-full"
            required
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>
    </div>
  );
}