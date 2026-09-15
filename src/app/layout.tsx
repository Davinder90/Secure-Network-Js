"use client";

import "./globals.css";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Navbar from "@components/navbar/Navbar";
import SideBar from "@components/sidebar/Sidebar";
import { SIDEBAR, SIDEBAR_FOR_NAVLINKS } from "@/src/lib/utils/ui/Sidebar.constant";
import { toastOptions } from "@/src/lib/utils/ui/toaster";
import { Provider } from "react-redux";
import { store } from "@redux-store/store";
import ClientAuthGaurd from "./auth/AuthGaurd";
import { PATHS } from "../lib/utils/ui/Paths.constant";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const basePath = "/" + (pathname.split("/") || "");

  // 1. Core Static Hidden Routes (Authentication Pages)
  const staticHideNavbarRoutes = [
    PATHS.LOGIN_PATH, 
    PATHS.REGISTER_PATH
  ];

  // 2. Refined Article Studio & Reader Matches
  // - Show Navbar on: "/articles" (Main Feed listing page)
  // - Hide Navbar on: "/articles/create", "/articles/[id]", "/articles/[id]/edit"
  const isInsideArticleWorkspace = 
    pathname === "/articles/create" || 
    (pathname.startsWith("/articles/") && pathname !== "/articles");
  const showNavbar = !staticHideNavbarRoutes.includes(pathname) && !isInsideArticleWorkspace;
  const showSidebar = SIDEBAR_FOR_NAVLINKS.includes("/"+basePath.split(',')[1]);

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Provider store={store}>
          <ClientAuthGaurd>
            {showNavbar && <Navbar />}
            <div className="flex flex-1 relative">
              {showSidebar && (
                <SideBar
                  items={SIDEBAR[basePath.split(",")[1] as string]}
                />
              )}
              <main
                className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
                  showSidebar ? "md:ml-64" : ""
                }`}
            >
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={toastOptions}
                />
              </main>
            </div>
          </ClientAuthGaurd>
        </Provider>
      </body>
    </html>
  );
}
