"use client";

import "./globals.css";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Script from "next/script";
import Navbar from "@components/navbar/Navbar";
import SideBar from "@components/sidebar/Sidebar";
import {
  SIDEBAR,
  SIDEBAR_FOR_NAVLINKS,
} from "@/src/lib/utils/ui/Sidebar.constant";
import { toastOptions } from "@/src/lib/utils/ui/toaster";
import { Provider, useSelector } from "react-redux";
import { store, RootState } from "@redux-store/store";
import ClientAuthGaurd from "./auth/AuthGaurd";
import { PATHS } from "../lib/utils/ui/Paths.constant";
import { env_var } from "../config/env.config";

const PAGES_WITH_SCRIPTS = [
  PATHS.LOGIN_PATH,
  PATHS.REGISTER_PATH,
  PATHS.PROFILE_PATH,
  PATHS.ADMIN_PATH,
  PATHS.ARTICLES_PATH,
];

function RouteEnforcer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!user || user.role === "administrator") return;

    const access = user.productAccess;

    console.log(pathname);
    // 1. Operational tool hard-redirects
    if (pathname.startsWith(PATHS.NETWORKING_PATH) && !access?.networking) {
      toast.error("You are not allowed to access the Networking tools.");
      router.replace("/");
      return;
    }

    if (pathname.startsWith(PATHS.SECURITY_PATH) && !access?.security) {
      toast.error("You are not allowed to access Security tools.");
      router.replace("/");
      return;
    }

    if (pathname.startsWith(PATHS.API_PATH) && !access?.api) {
      toast.error("You are not allowed to access API Client tools.");
      router.replace("/");
      return;
    }

    // 2. Articles Soft Gating: Can read feed (/articles), but blocked from write/edit
    if (!access?.articles) {
      if (pathname === "/articles/create" || pathname.endsWith("/edit")) {
        toast.error("You have read-only access to articles.");
        router.replace("/articles");
      }
    }
  }, [pathname, user, router]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const basePath = "/" + (pathname.split("/") || "");

  const staticHideNavbarRoutes = [PATHS.LOGIN_PATH, PATHS.REGISTER_PATH];
  const isInsideArticleWorkspace =
    pathname === "/articles/create" ||
    (pathname.startsWith("/articles/") && pathname !== "/articles");

  const showNavbar =
    !staticHideNavbarRoutes.includes(pathname) && !isInsideArticleWorkspace;
  const showSidebar = SIDEBAR_FOR_NAVLINKS.includes(
    "/" + basePath.split(",")[1],
  );
  const shouldInjectScript = PAGES_WITH_SCRIPTS.includes(pathname);

  return (
    <html lang="en">
      <head>
        {shouldInjectScript && env_var.SCRIPT_PATH && (
          <Script src={env_var.SCRIPT_PATH} strategy="afterInteractive" />
        )}
      </head>
      <body className="flex flex-col min-h-screen bg-gray-50">
        <Provider store={store}>
          <ClientAuthGaurd>
            <RouteEnforcer>
              {showNavbar && <Navbar />}
              <div className="flex flex-1 relative">
                {showSidebar && (
                  <SideBar items={SIDEBAR[basePath.split(",")[1] as string]} />
                )}
                <main
                  className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
                    showSidebar ? "md:ml-64" : ""
                  }`}
                >
                  {children}
                  <Toaster position="top-right" toastOptions={toastOptions} />
                </main>
              </div>
            </RouteEnforcer>
          </ClientAuthGaurd>
        </Provider>
      </body>
    </html>
  );
}
