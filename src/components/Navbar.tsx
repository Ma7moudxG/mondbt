"use client";
import { signOut, useSession } from "next-auth/react";
import moment from "moment-hijri";


export default function Header() {
  const hijri = moment().format("iD iMMMM iYYYY هـ");
  const gregorian = moment().format("DD MMMM YYYY"); // Corrected from invalid char to YYYY
  const { data: session, status } = useSession(); // Get status for loading state

  // Optional: Handle loading state
  if (status === "loading") {
    return (
      <header className="flex justify-between items-center p-4">
        <div className="text-sm text-gray-600">
          اليوم:{hijri}الموافق:{gregorian}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      </header>
    );
  }

  // Get the role safely
  const userRole = session?.user?.role;
  let greetingName = "Guest"; // Default greeting

  if (userRole) {
    greetingName = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  } else if (session?.user?.name) { // Fallback to user's name if role is not present
    greetingName = session.user.name;
  } else if (session?.user?.email) { // Fallback to user's email
    greetingName = session.user.email;
  }


  return (
    <header className="flex justify-between items-center p-4">
      {/* 🗓️ Date Line */}
      <div className="text-xs text-[#9B9B9B] text-right font-bold">
        <span className="text-[#5EB89D]">اليوم</span> : {hijri} <span className="text-[#5EB89D]">الموافق</span>: {gregorian}
      </div>

      {/* 👋 Greeting and Logout */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-[#9B9B9B]">
          Hello, {greetingName}!
        </span>
        {session && ( // Only show logout if there's a session
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-white rounded-full text-[#9B9B9B] text-sm font-medium px-4 py-2 hover:text-white  hover:bg-[#8447AB]"
          >
            Logout
          </button>
        )}
        {!session && status !== "loading" && ( // Optional: Show login button if not authenticated
            <a
              href="/login" // Or use Next.js Link component
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Login
            </a>
        )}
      </div>
    </header>
  );
}