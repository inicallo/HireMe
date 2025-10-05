'use client';
import { useCreateAccountForm } from '@/hooks/useCreateAccountForm';
import { countryOptions } from '@/utils/format';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';
import Background from '../../assets/BG-CreateAccount.png';
import IconCompany from '../../assets/Icon-Company-Trans.png';
import IconJob from '../../assets/Icon-Job-Trans.png';
import IconFacebook from '../../assets/category/Icon-Facebook.png';
import IconGoogle from '../../assets/category/Icon-Google.png';
import 'react-toastify/dist/ReactToastify.css';

const CreateAccount: React.FC = () => {
  const {
    role,
    setRole,
    first_name,
    setFirstName,
    last_name,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    companyName,
    setCompanyName,
    companyEmail,
    setCompanyEmail,
    companyCountry,
    setCompanyCountry,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    handleFormSubmit,
  } = useCreateAccountForm();

  return (
    <div className="min-h-screen flex bg-white">
      <div className="w-full lg:w-1/2 bg-white py-12 lg:py-20 px-6 sm:px-12 flex flex-col justify-center relative">
        <form
          onSubmit={handleFormSubmit}
          className="max-w-md mx-auto m-6 mt-[50px] lg:mt-[-55px] md:mt-[-100px]"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-semibold">Create account.</h2>
            <select
              className="p-2 border rounded-md bg-gray-100"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Category</option>
              <option value="candidate">Candidate</option>
              <option value="admin">Employers</option>
            </select>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>

          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 p-3 border rounded-md"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 p-3 border rounded-md"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              type="email"
              placeholder="Email address"
              className="w-full p-3 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Conditionally render company fields if admin role is selected */}
            {role === 'admin' && (
              <>
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full p-3 border rounded-md"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Company Email Address"
                  className="w-full p-3 border rounded-md"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  required
                />
                <select
                  className="w-full p-3 border rounded-md"
                  value={companyCountry}
                  onChange={(e) => setCompanyCountry(e.target.value)}
                  required
                >
                  <option value="">Select Country</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </>
            )}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full p-3 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 right-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="w-full p-3 border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-3 right-3 cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {/* Terms and Agreement */}
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                required
              />
              <span className="text-gray-600 text-sm">
                I&apos;ve read and agree with your{' '}
                <Link href="#" className="text-blue-600 hover:underline">
                  Terms of Services
                </Link>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 mt-6 rounded-md hover:bg-blue-700 transition"
          >
            Create Account
          </button>

          <div className="text-center my-6 text-gray-500">or</div>

          <div className="flex space-x-6">
            <button className="w-full flex items-center justify-center bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition">
              <Image src={IconFacebook} alt="Facebook" width={24} height={24} />
              <span className="ml-2 text-gray-700">Sign up with Facebook</span>
            </button>
            <button className="w-full flex items-center justify-center bg-gray-100 p-3 rounded-md hover:bg-gray-200 transition">
              <Image src={IconGoogle} alt="Google" width={24} height={24} />
              <span className="ml-2 text-gray-700">Sign up with Google</span>
            </button>
          </div>
        </form>
      </div>

      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${Background.src})` }}
      >
        <div className="absolute inset-0 flex flex-col justify-end items-center text-white pb-36 px-4">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Over 1,75,324 candidates
            </h2>
            <p className="text-xl lg:text-2xl font-light mt-4">
              waiting for good employees.
            </p>
            <div className="mt-12 flex justify-center space-x-8">
              <div className="text-center">
                <Image
                  src={IconJob}
                  alt="Live Jobs"
                  width={50}
                  height={50}
                  className="mx-auto"
                />
                <p className="text-lg font-bold mt-4">1,75,324</p>
                <p className="text-sm">Live Job</p>
              </div>
              <div className="text-center">
                <Image
                  src={IconCompany}
                  alt="Companies"
                  width={50}
                  height={50}
                  className="mx-auto"
                />
                <p className="text-lg font-bold mt-4">97,354</p>
                <p className="text-sm">Companies</p>
              </div>
              <div className="text-center">
                <Image
                  src={IconJob}
                  alt="New Jobs"
                  width={50}
                  height={50}
                  className="mx-auto"
                />
                <p className="text-lg font-bold mt-4">7,532</p>
                <p className="text-sm">New Jobs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;