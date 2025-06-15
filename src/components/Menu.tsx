import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { cookies } from 'next/headers';
import TranslatedMenuContent from "./TranslatedMenuContent"; // Import the new client component
type UserRole = "admin" | "minister" | "parent" | "manager";

const menuItems = [
  {
    title: "MAIN MENU",
    items: [
      {
        icon: "/home.svg",
        label: "Home",
        href: "", // Corrected href as it seems to be relative to the role base, will become e.g. /admin/ or /parent/
        visible: ["admin", "minister", "parent", "manager"],
      },
    ],
  },
  {
    title: "Statistics",
    items: [
      {
        icon: "/approvals.svg",
        label: "Attendance",
        href: "", 
        visible: ["minister", "parent", "manager"],
      },
      {
        icon: "/approvals.svg",
        label: "Attendance",
        href: "attendance", 
        visible: ["admin"],
      },
      {
        icon: "/absence.svg",
        label: "Absence",
        href: "",
        visible: ["admin", "minister", "parent", "manager"],
      },
      {
        icon: "/late.svg",
        label: "Late",
        href: "",
        visible: ["admin", "parent", "minister", "manager"],
      },
      {
        icon: "/excuse.svg",
        label: "Excuses",
        href: "",
        visible: ["admin", "manager", "minister", "parent"],
      },
    ],
  },
];

export default async function Menu() {
  const session = await getServerSession(authOptions);
 const cookieStore = cookies(); 
 const currentUserRole: UserRole | null = (session?.user?.role as UserRole) || null;

return (
    <div className="mt-4 text-sm">
      <TranslatedMenuContent menuItems={menuItems} currentUserRole={currentUserRole} />
    </div>
  );
}