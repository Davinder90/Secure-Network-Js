"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { handleCreateUserAccount } from "@requests/user/auth";
import { getLocalStorage } from "@/src/lib/helpers/localStorage";

export default function SignUpForm() {
  const router = useRouter();
  const stored = getLocalStorage('sn-userInfo');

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [disable, setDisable] = useState(false);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.length < 3) {
      toast.error("Full name must be at least 3 characters long");
      return;
    }

    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setDisable(true);

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    };

    try {
      const response = await handleCreateUserAccount(payload);
      setDisable(false);

      if (response?.success) {
        toast.success(response?.message || "Account registered successfully!");
        router.push("/auth/login");
      } else {
        toast.error(response?.message || "Registration failed. Please check details.");
      }
    } catch {
      setDisable(false);
      toast.error("An error occurred during account creation");
    }
  };

  
  useEffect(() => {
      if(stored?.access_token){
        router.push('/')
      }
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-100 to-blue-200 overflow-hidden py-12 px-4">
      {/* Ambient background glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-400 opacity-20 blur-3xl rounded-full animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-lg bg-white p-8 sm:p-10 rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/applogo2.png"
            alt="SecureNet Logo"
            className="w-14 mb-3 object-contain"
          />
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Create an Account on <span className="text-cyan-600">SecureNet</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Access enterprise network telemetry, diagnostics, and security auditing
          </p>
        </div>

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm text-gray-800"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Full Name
            </label>
          </div>

          {/* Email Address */}
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm text-gray-800"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Work Email Address
            </label>
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm text-gray-800"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Password
            </label>

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-cyan-600 transition"
              aria-label="Toggle password visibility"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder=" "
              className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition text-sm text-gray-800"
            />
            <label className="absolute left-4 top-3 text-gray-500 text-sm transition-all pointer-events-none peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-cyan-600 peer-focus:font-semibold peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-cyan-600 bg-white px-1">
              Confirm Password
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={disable}
            className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg mt-2 ${
              disable
                ? "bg-cyan-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-cyan-500/25 hover:shadow-xl hover:scale-[1.01] active:scale-95"
            }`}
          >
            {disable ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Link to Sign In */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-cyan-600 hover:text-cyan-700 hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
