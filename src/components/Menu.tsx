import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";

const menuItems = [
  {
    title: "MAIN MENU",
    items: [
      {
        icon: "/home.svg",
        label: "Home",
        href: "/",
        visible: ["admin", "minister", "parent"],
      },
      {
        icon: "/",
        label: "Statistics",
        href: "/statistics",
        visible: ["admin", "minister"],
      },
      {
        icon: "/",
        label: "Approvals",
        href: "/approvals",
        visible: ["admin", "teacher"],
      },
    ],
  },
  {
    title: "OTHER MENU",
    items: [
      {
        icon: "/",
        label: "Fines",
        href: "/fines",
        visible: ["admin", "minister", "parent"],
      },
      {
        icon: "/",
        label: "Rewards",
        href: "/rewards",
        visible: ["admin", "minister", "parent"],
      },
    ],
  },
];

const Menu = () => {
  return (
    <div className="mt-4 text-sm">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block text-white font-light my-4">
            {i.title}
          </span>
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-white py-2 md:px-4 rounded-full hover:bg-[#8447AB]"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;