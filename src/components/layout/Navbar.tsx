'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import LoginForm from '../forms/LoginForm';
import SignupForm from '../forms/SignupForm';

interface CurrentUser {
  id: string;
  email: string;
  username: string;
  role?: 'user' | 'admin';
}

const Navbar = () => {
  const [modalType, setModalType] = useState<null | 'login' | 'signup'>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const closeModal = () => setModalType(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
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
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleSignupSubmit = () => {
    // After SignupForm success, refetch me
    fetch('/api/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setCurrentUser(null);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="bg-primary text-sm text-primary-foreground px-4 py-2 flex justify-end gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3">
            {currentUser.role === 'admin' && (
              <Link href="/admin" className="hover:underline">Admin</Link>
            )}
            <span className="opacity-90">Hi, {currentUser.username}</span>
            <Link href="/profile" className="hover:underline">Profile</Link>
            <button onClick={handleLogout} className="hover:underline">Logout</button>
          </div>
        ) : (
          <>
            <button onClick={() => setModalType('login')} className="hover:underline">LOGIN</button>
            <button onClick={() => setModalType('signup')} className="hover:underline">SIGN UP</button>
          </>
        )}
      </div>

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

            {modalType === 'login' ? (
              <>
                <LoginForm onSubmit={handleLoginSubmit} />
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setModalType('signup')}
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
                  Already have an account?{' '}
                  <button
                    onClick={() => setModalType('login')}
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
    </>
  );
};

export default Navbar;
