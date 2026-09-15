"use client";
import { useState } from "react";
import SideBarLink from "./SidebarLink";
import { NAVBAR_HEIGHT } from "@/src/lib/utils/ui/Navbar.constant";
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { SideBar_Item } from "@/src/lib/type/ui/sidebar/sidebar.types";

type SideBarProps = {
  items: SideBar_Item[];
};


const SideBar = ({ items }: SideBarProps) => {
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSection = (name: string) => {
    setOpenSections((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-17 left-0 z-50 p-2 bg-red-600 text-white rounded-md shadow-lg"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      
        <div
  style={{ top: NAVBAR_HEIGHT, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}
  className={`
    fixed left-0 w-64 bg-black text-white shadow-lg z-50
    transform transition-transform duration-300
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
>

     <aside className="w-64 h-full overflow-y-auto p-4 border-r border-white/20 sidebar-scrollbar">
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 bg-red-600 rounded-md"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {items.map((section) => {
            const isOpen = openSections.includes(section.name as string);
            return (
              <div key={section.name as string} className="mb-4">
                <button
                  onClick={() => toggleSection(section.name as string)}
                  className={`w-full flex justify-between items-center py-2 px-3 rounded-md
                    font-semibold uppercase tracking-wide text-sm transition-all text-white
                  `}
                >
                  {section.name}
                  <ChevronRightIcon
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isOpen ? "rotate-90" : "rotate-0"
                    }`}
                  />
                </button>

                <div
                  className={`mt-2 flex flex-col gap-2 overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-[1000px]" : "max-h-0"
                  }`}
                >
                  {section.fields.map((field, index) => (
                    <SideBarLink key={index} item={field} />
                  ))}
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </>
  );
};

export default SideBar;
