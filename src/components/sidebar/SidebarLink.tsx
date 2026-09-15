"use client";
import Link from "next/link";

import { SideBar_Item_Field } from "@/src/lib/type/ui/sidebar/sidebar.types";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

type SideBarLinkProps = {
  item: SideBar_Item_Field;
};

const SideBarLink = ({ item }: SideBarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === item.path;

  // Determine if logo is an icon or string
  const LogoIcon = typeof item.logo !== "string" ? (item.logo as IconType) : null;

  return (
    <Link
      href={item.path as string}
      className={`
        flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
        ${isActive ? "bg-red-600 text-white shadow-md" : "hover:bg-gray-700 hover:text-white text-gray-300"}
      `}
    >
      {/* Icon */}
      {LogoIcon ? (
        <LogoIcon className="w-8 h-8 text-white flex-shrink-0" />
      ) : (
        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white text-sm font-semibold flex-shrink-0">
          {item.logo?.toString().charAt(0).toUpperCase()}
        </span>
      )}

      {/* Text */}
      <div className="flex flex-col">
        <span className="font-medium">{item.name}</span>
        <span className="text-xs text-white-400">{item.description}</span>
      </div>
    </Link>
  );
};

export default SideBarLink;
