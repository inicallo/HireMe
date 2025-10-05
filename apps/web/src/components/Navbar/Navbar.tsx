'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMenu, FiX } from 'react-icons/fi';
import { deleteToken } from '@/lib/server';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { logoutAction } from '@/redux/slice/authorSlice';
import { UserRole } from '@/types/role';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import NavLinks from './NavLinks';
import AuthButtons from './AuthButtons';
import MobileMenu from './MobileMenu';
import Notification from './Notification/notification';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.user);
  const isLoggedIn = !!user.user_id;

  const onLogout = async () => {
    toast.success('Logged out successfully!');
    await deleteToken();
    dispatch(logoutAction());
    router.push('/');
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md z-50 fixed w-full top-0 lg:relative">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo and Branding */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={40}
            height={40}
            style={{ objectFit: 'cover' }}
          />
          <Link href="/" className="text-2xl font-bold text-gray-700">
            HireMe
          </Link>
        </div>

        {/* Desktop Navigation Links and Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <ul className="flex space-x-6 text-gray-700">
            <NavLinks userRole={user.role as UserRole | null} />
          </ul>
          <AuthButtons
            isLoggedIn={isLoggedIn}
            userRole={user.role as UserRole | null}
            onLogout={onLogout}
          />
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center lg:hidden space-x-2">
          <Notification />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700"
          >
            {menuOpen ? (
              <FiX className="text-2xl" />
            ) : (
              <FiMenu className="text-2xl" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <MobileMenu
          isLoggedIn={isLoggedIn}
          userRole={user.role as UserRole | null}
          onLogout={onLogout}
          onClose={handleCloseMenu}
        />
      )}
    </nav>
  );
};

export default Navbar;