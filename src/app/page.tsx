import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Homepage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user?.role;

  if (role === "admin") {
    redirect("/admin");
  } else if (role === "parent") {
    redirect("/parent");
  } else if (role === "minister") {
    redirect("/minister");
  } else {
    // Fallback or unauthorized role
    redirect("/login");
  }

  return <div>Redirecting...</div>; // fallback content
}
