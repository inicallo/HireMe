'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { resetPassword } from '@/services/passwordService';

const ResetPassword = () => {
  const router = useRouter();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error('Token is missing.');
    }
  }, []);

  const handleSubmit = async () => {
    if (!newPassword || !confirmNewPassword) {
      toast.error('Both password fields are required.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const data = await resetPassword(token, newPassword, confirmNewPassword);

      if (data.status === 'ok') {
        toast.success(data.msg || 'Password has been reset successfully!');
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        toast.error(data.msg || 'Failed to reset password.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center m-6 mt-[-80px] lg:mt-[-280px] md:mt-[-280px]">
        <h2 className="text-3xl font-semibold mb-4">Reset Password</h2>
        <p className="text-gray-600 mb-8">
          Enter and confirm your new password below to securely update your
          account. Make sure your new password is strong and unique.
        </p>
        <div className="space-y-4">
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="New Password"
              className="w-full p-3 border rounded-md focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span onClick={() => setShowNewPassword(!showNewPassword)} className="absolute top-3 right-3 cursor-pointer text-gray-500">
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded-md focus:outline-none"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute top-3 right-3 cursor-pointer text-gray-500">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-3 mt-6 rounded-md hover:bg-blue-700 transition">
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
