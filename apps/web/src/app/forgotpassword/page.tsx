'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { requestPasswordReset } from '@/services/passwordService';
import Background from '../../assets/BG-CreateAccount.png';
import IconFacebook from '../../assets/category/Icon-Facebook.png';
import IconGoogle from '../../assets/category/Icon-Google.png';

const ForgetPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    try {
      const data = await requestPasswordReset(email);
      if (data.status === 'ok') {
        toast.success(data.msg || 'Password reset link sent! Check your email.');
        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
      } else {
        toast.error(data.msg || 'Failed to send reset link.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 bg-white py-16 lg:py-28 px-6 sm:px-12 flex flex-col justify-center relative">
        <div className="max-w-md mx-auto m-6 lg:mt-[-250px] md:mt-[-120px]">
          <h2 className="text-3xl pb-3 font-semibold">Forget Password</h2>
          <p className="text-sm text-gray-600 mb-4">
            Go back to <Link href="/sign-in" className="text-blue-600 hover:underline">Sign In</Link>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Don’t have an account? <Link href="/sign-up" className="text-blue-600 hover:underline">Create Account</Link>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Verify your Account? <Link href="/email-verify" className="text-blue-600 hover:underline">Verify here</Link>
          </p>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 border rounded-md focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button onClick={handlePasswordReset} className="w-full bg-blue-600 text-white py-3 mt-6 rounded-md hover:bg-blue-700 transition">
            Reset Password
          </button>
          <div className="text-center my-6 text-gray-500">or</div>
          <div className="flex space-x-6">
            <button className="w-full flex items-center justify-center bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition">
              <Image src={IconFacebook} alt="Facebook" width={24} height={24} />
              <span className="ml-2 text-gray-700">Sign in with Facebook</span>
            </button>
            <button className="w-full flex items-center justify-center bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition">
              <Image src={IconGoogle} alt="Google" width={24} height={24} />
              <span className="ml-2 text-gray-700">Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
      <div className="hidden lg:block lg:w-1/2 bg-cover bg-center relative" style={{ backgroundImage: `url(${Background.src})` }}>
        {/* Right Section content */}
      </div>
    </div>
  );
};

export default ForgetPassword;