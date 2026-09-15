"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NAV_LINKS, NAVBAR_HEIGHT } from "@/src/lib/utils/ui/Navbar.constant";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@redux-store/store";
import { logout } from "@redux-store/user.slice";
import { getLocalStorage, removeLocalStorage } from "@/src/lib/helpers/localStorage";
import { PATHS } from "@/src/lib/utils/ui/Paths.constant";
import { handleIsAdmin } from "@/src/requests/user/auth";

type NavLinkProps = {
  name: string;
  nav_path: string;
  isActive: boolean;
};

const NavLink = ({ name, nav_path, isActive }: NavLinkProps) => {
  return (
    <Link
      href={nav_path}
      className={`
        relative px-4 py-2 text-sm font-semibold uppercase tracking-wide
        transition-all duration-300 group
        ${isActive ? "text-red-600 font-bold" : "text-black hover:text-red-500"}
      `}
    >
      {name}

      <span
        className={`
          absolute left-0 -bottom-1 h-1 w-full rounded-full
          bg-red-600 transform scale-x-0 origin-left transition-transform duration-300
          ${isActive ? "scale-x-100" : "group-hover:scale-x-100"}
        `}
      />
    </Link>
  );
};

const Navbar = () => {
  const pathname = "/" + usePathname().split("/")[1];
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = getLocalStorage("sn-userInfo");
  const username = user?.user?.username;
  const avatar = user?.user?.avatar;
  const email = user?.user.email;
  const [admin, setAdmin] = useState(false);

  const handleSignOut = () => {
    removeLocalStorage("sn-userInfo");
    dispatch(logout());
    router.push("/login");
  };

  const isAdmin = useCallback(async () => {
    if (!email) return false;
    const { result } = await handleIsAdmin();
    setAdmin(result.isAdmin);
  }, [email]);

  useEffect(() => {
    isAdmin();
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full bg-gray-100 shadow-sm z-50 flex items-center justify-between px-6"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <div className="flex items-center gap-6 h-full">
          {NAV_LINKS.map((navLink) => (
            <NavLink
              key={navLink.path}
              name={navLink.name}
              nav_path={navLink.path as string}
              isActive={pathname === navLink.path}
            />
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-red-500 overflow-hidden flex items-center justify-center text-white font-bold uppercase hover:shadow-lg transition border-2 border-red-500"
          >
            {avatar ? (
              <img
                src={avatar}
                alt={username || "User avatar"}
                className="w-full h-full object-cover bg-white"
              />
            ) : (
              username ? username[0] : ""
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
              <div className="flex flex-col py-2">
                <Link
                  href={PATHS.PROFILE_PATH}
                  className="px-4 py-2 hover:bg-gray-100 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>

                {admin ? (
                  <Link
                    href={PATHS.ADMIN_PATH}
                    className="px-4 py-2 hover:bg-gray-100 transition rounded-b-lg"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Admin
                  </Link>
                ) : null}

                <button
                  onClick={handleSignOut}
                  className="text-left px-4 py-2 hover:bg-red-100 text-red-600 font-semibold rounded-t-lg transition"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div style={{ height: NAVBAR_HEIGHT }} />
    </>
  );
};

export default Navbar;
