"use client"; // This directive makes it a Client Component

import React, { useState, useEffect } from "react"; // Import useState and useEffect
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";

// Define the types locally or import them if shared
type UserRole = "admin" | "minister" | "parent" | "manager";

interface MenuItem {
  icon: string;
  label: string; // This will be the translation key
  href: string;
  visible: UserRole[];
}

interface MenuSection {
  title: string; // This will be the translation key
  items: MenuItem[];
}

interface TranslatedMenuContentProps {
  menuItems: MenuSection[];
  currentUserRole: UserRole | null;
}

export default function TranslatedMenuContent({
  menuItems,
  currentUserRole,
}: TranslatedMenuContentProps) {
  const { t } = useTranslation(); // useTranslation is now used in a Client Component

  // START: Hydration Fix Additions
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This effect runs only once, after the component has mounted on the client
    setMounted(true);
  }, []);
  // END: Hydration Fix Additions

  return (
    <>
      {menuItems.map((menuSection) => {
        const filteredItems = menuSection.items.filter((item) => {
          if (!currentUserRole) return false;
          return item.visible.includes(currentUserRole);
        });

        if (filteredItems.length === 0) return null;

        return (
          <div className="flex flex-col gap-2" key={menuSection.title}>
            <span className="hidden lg:block text-white font-light my-4">
              {/* START: Hydration Fix - Conditionally render translation */}
              {mounted ? t(menuSection.title) : menuSection.title}{" "}
              {/* During SSR, render the key itself for consistency */}
              {/* END: Hydration Fix */}
            </span>
            {filteredItems.map((item) => (
              <Link
                href={`/${currentUserRole}/${item.href}`}
                key={item.label}
                className="flex items-center justify-center lg:justify-start gap-4 text-white py-2 md:px-4 rounded-full hover:bg-[#8447AB]"
              >
                <Image
                  src={item.icon || "/default-icon.svg"}
                  alt="" // Your alt text is currently empty, consider adding a translated alt.
                  width={20}
                  height={20}
                />
                <span className="hidden lg:block">
                  {/* START: Hydration Fix - Conditionally render translation */}
                  {mounted ? t(item.label) : item.label}{" "}
                  {/* During SSR, render the key itself for consistency */}
                  {/* END: Hydration Fix */}
                </span>
              </Link>
            ))}
          </div>
        );
      })}
    </>
  );
}