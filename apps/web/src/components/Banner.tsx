'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import Illustration from '../assets/Illustration.png';
import JobIcon from '../assets/Icon_Job.png';
import CompIcon from '../assets/Icon_Company.png';
import PeopleIcon from '../assets/Icon_People.png';
import Select from 'react-select';
import Flag from 'react-world-flags';
import { GoLocation } from 'react-icons/go';

const countries = [
  { code: '', name: 'All Countries' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
];

const countryOptions = countries.map((country) => ({
  value: country.name,
  label: (
    <div className="flex items-center p-2.5">
      <Flag
        code={country.code || 'XX'}
        alt={country.name}
        className="mr-2 w-6 h-4"
      />
      <span>{country.name}</span>
    </div>
  ),
}));

const LandingPage = () => {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius] = useState(25);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        () => {},
      );
    }
  }, []);

  return (
    <div className="min-h-screen mt-10 pt-16 lg:pt-0 pb-8 lg:pb-0 lg:-mt-7 bg-[#F1F2F4] flex flex-col justify-center md:mt-10">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="text-center lg:text-left mb-8 lg:mb-0 lg:w-1/2">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4">
              Find a job that suits <br className="hidden sm:block" />{' '}
              your interest & skills.
            </h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base lg:text-lg">
              Explore endless opportunities and take the next step in your
              career.
              <br className="hidden sm:block" />{' '}
              Discover jobs that align with your skills and passions.
            </p>

            {/* Job Search Input */}
            <div className="flex flex-col sm:flex-row items-center bg-white p-4 sm:p-6 rounded-lg shadow-md space-y-4 sm:space-y-0">
              <div className="flex items-center flex-grow bg-white border border-gray-300 rounded-md p-2.5 sm:p-3">
                <FaSearch className="text-blue-600 mr-2" />
                <input
                  type="text"
                  placeholder="Job title, Keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-grow bg-white focus:outline-none"
                />
              </div>

              {/* Country Select Dropdown */}
              <div className="flex-grow sm:ml-4">
                <Select
                  options={countryOptions}
                  placeholder={
                    <div className="flex items-center flex-grow p-2.5">
                      <GoLocation className="text-blue-600 mr-2" />
                      <span>Location</span>
                    </div>
                  }
                  onChange={(option) => setCountry(option ? option.value : '')}
                  isSearchable={false}
                  classNamePrefix="react-select"
                  styles={{
                    container: (base) => ({ ...base, width: '100%' }),
                    control: (base) => ({ ...base, minHeight: '44px' }),
                  }}
                />
              </div>

              {/* Redirect Find Job Button */}
              <Link
                href={{
                  pathname: '/job-page',
                  query: {
                    search,
                    location: country,
                    lat: latitude?.toString() || '',
                    lng: longitude?.toString() || '',
                    radius: radius.toString(),
                  },
                }}
              >
                <button className="bg-blue-600 text-white ml-3 py-2 sm:py-3 px-6 sm:px-8 rounded-md hover:bg-blue-700 transition-colors mt-4 sm:mt-0 w-full sm:w-auto">
                  Find Job
                </button>
              </Link>
            </div>

            {/* Suggestions */}
            <p className="text-sm text-gray-500 mt-4">
              Suggestion: Designer,
              <span className="text-blue-500 cursor-pointer"> Programming</span>
              , Digital Marketing, Video, Animation.
            </p>
          </div>

          {/* Illustration Image */}
          <div className="mt-8 lg:pr-16 lg:mt-0 lg:w-1/2 flex justify-center lg:justify-end">
            <div className="max-w-full lg:max-w-lg w-[90%] sm:w-[80%] lg:w-auto">
              <Image
                src={Illustration}
                alt="Illustration"
                width={700}
                height={700}
                priority
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="mb-4">
              <Image src={JobIcon} alt="Icon" width={50} height={50} />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
              1,75,324
            </p>
            <p className="text-gray-600 text-sm sm:text-base">Live Jobs</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="mb-4">
              <Image src={CompIcon} alt="Icon" width={50} height={50} />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
              97,354
            </p>
            <p className="text-gray-600 text-sm sm:text-base">Companies</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="mb-4">
              <Image src={PeopleIcon} alt="Icon" width={50} height={50} />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
              38,47,154
            </p>
            <p className="text-gray-600 text-sm sm:text-base">Candidates</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <div className="mb-4">
              <Image src={JobIcon} alt="Icon" width={50} height={50} />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
              7,532
            </p>
            <p className="text-gray-600 text-sm sm:text-base">New Jobs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
