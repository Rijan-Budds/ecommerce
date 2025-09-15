"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { ModeToggle } from "@/components/ui/mode-toggle";
import LoginForm from "../forms/LoginForm";
import SignupForm from "../forms/SignupForm";
import Image from "next/image";

interface CurrentUser {
  id: string;
  email: string;
  username: string;
  role?: "user" | "admin";
}

const Header = () => {
  const [modalType, setModalType] = useState<null | "login" | "signup">(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const closeModal = () => setModalType(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        setCurrentUser(data.user);
      } catch {
        setCurrentUser(null);
      }
    };
    loadMe();
  }, []);

  const handleLoginSubmit = () => {
    // After LoginForm success, refetch me
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleSignupSubmit = () => {
    // After SignupForm success, refetch me
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      setCurrentUser(null);
    } catch {
      // ignore
    }
  };

  return (
    <header>
      {/* Top bar with login/signup or user info */}
      <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] text-sm text-white px-4 py-2 flex justify-end gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3">
            {currentUser.role === "admin" && (
              <Link href="/admin" className="hover:underline">
                Admin
              </Link>
            )}
            <span className="opacity-90">Hi, {currentUser.username}</span>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setModalType("login")}
              className="hover:underline"
            >
              LOGIN
            </button>
            <button
              onClick={() => setModalType("signup")}
              className="hover:underline"
            >
              SIGN UP
            </button>
          </>
        )}
      </div>

      {/* Main header with logo, search, and icons */}
      <div className="bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] px-4 py-4 flex items-center justify-between text-white">
        {/* Title - now redirects to home */}
        <Link href="/" className="flex items-center">
          <Image
            src="/home/logo.jpg"
            alt="Tech Store Logo"
            width={85}
            height={85}
            priority
          />
        </Link>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const query = (e.currentTarget.q as HTMLInputElement).value.trim();
            if (!query) return;
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
          }}
          className="flex flex-1 max-w-xl mx-6"
        >
          <input
            type="text"
            name="q"
            placeholder="Search for item..."
            className="w-full px-4 py-2 rounded-l-md focus:outline-none bg-white text-black"
          />
          <button
            type="submit"
            className="bg-accent px-4 py-2 rounded-r-md text-accent-foreground"
          >
            <FaSearch />
          </button>
        </form>


        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="hover:text-gray-200">
            <FaUser />
          </Link>
          <Link href="/cart" className="hover:text-gray-200">
            <FaShoppingCart />
          </Link>
          <div className="text-white">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded shadow-md w-96 relative transition-transform duration-300 ease-in-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {modalType === "login" ? (
              <>
                <LoginForm onSubmit={handleLoginSubmit} />
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setModalType("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignupForm onSubmit={handleSignupSubmit} />
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => setModalType("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Log In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
