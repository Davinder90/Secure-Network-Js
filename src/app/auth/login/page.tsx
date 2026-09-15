"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/redux-store/store";
import { login } from "@redux-store/user.slice";
import { getLocalStorage, setLocalStorage } from "@/src/lib/helpers/localStorage";
import { handleGetUserAuthToken } from "@requests/user/auth";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const stored = getLocalStorage('sn-userInfo');

  

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [disable, setDisable] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisable(true);

    if (!isEmailValid || password === "") {
      toast.error("Please enter valid credentials");
      setDisable(false);
      return;
    }

    const data = await handleGetUserAuthToken({ email, password });

    setDisable(false);

    if (data?.success) {
      setLocalStorage("sn-userInfo", { ...data?.result});

      dispatch(
        login({
          name: data?.result?.username,
          email: email,
          isAllowed: data?.result?.isAllowed,
        })
      );

      if(data?.result?.isAllowed){
        toast.success("Welcome back!");
      }
      router.push("/");
    } else {
      toast.error(data?.message || "Login failed");
    }
  };

  useEffect(() => {
    if(stored?.access_token){
      router.push('/')
    }
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-200 overflow-hidden px-4">
      <div className="absolute w-[500px] h-[500px] bg-cyan-400 opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-blue-100">
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/applogo2.png"
            alt="SecureNet Logo"
            className="w-14 mb-3"
          />
          <h2 className="text-2xl font-bold text-gray-800">
            Secure<span className="text-cyan-600">Net</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Secure Access Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Email Address
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-sm text-cyan-600 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            disabled={disable}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 shadow-lg ${
              disable
                ? "bg-cyan-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-xl hover:scale-[1.02] active:scale-95"
            }`}
          >
            {disable ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Link to Sign Up */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
