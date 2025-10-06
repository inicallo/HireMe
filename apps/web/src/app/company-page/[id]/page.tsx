'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCompanyById } from '@/lib/company';
import { Company } from '@/types/company';
import ProtectedRoute from '@/components/ProtectedRoute';
import { getLabel } from '@/utils/getLabel';
import CompanyOverview from './CompanyOverview';
import CompanyJobListings from './CompanyJobListings';
import { industryOptions } from '@/utils/format';
import DOMPurify from 'dompurify';
import Image from 'next/image';
import ReviewsPage from './review';

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { company, ok } = await getCompanyById(id as string);
        if (ok && company) {
          setCompany(company);
        } else {
          setError('Failed to load company details');
        }
      } catch (error) {
        setError('An error occurred while fetching company details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading)
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-50">
        <span className="loading loading-dots loading-lg animate-pulse text-blue-600"></span>
        <p className="mt-4 text-gray-600 text-lg animate-fade">
          Loading, please wait...
        </p>
      </div>
    );

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!company) return <p className="text-center">No company data available</p>;

  return (
      <div className="relative flex flex-col items-center w-full min-h-screen bg-gray-100">
        {/* Banner Section */}
        <div
          className="relative lg:w-[1300px] rounded-lg h-48 -mb-16 bg-cover bg-center"
          style={{
            backgroundImage: `url(${company.banner || '/default-banner.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        ></div>

        {/* Content Section */}
        <div className="relative z-10 w-full max-w-7xl p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-start p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center">
              <Image
                src={company.logo || '/default-logo.png'}
                alt={`${company.company_name} Logo`}
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="ml-4">
                <h1 className="text-3xl font-bold">{company.company_name}</h1>
                <p className="text-lg text-gray-500">
                  {getLabel(industryOptions, company.IndustryType as string)}
                </p>
              </div>
            </div>
          </div>

           {/* Company Details Section */}
           <div className="flex flex-col lg:flex-row gap-8 mt-6">
            <div className="flex-1 bg-white shadow-lg rounded-lg p-4 md:p-6 lg:p-8 space-y-6">
              <h2 className="text-lg font-bold">About Us</h2>
              {/* Render company.aboutUs as HTML */}
              <div
                dangerouslySetInnerHTML={{
                  __html: company.aboutUs || 'No description available.',
                }}
              />
            </div>

            {/* Sidebar with Company Information */}
            <div className="w-full lg:w-1/3 space-y-6">
              <div className="bg-white shadow-lg rounded-lg p-4">
                <h2 className="text-lg font-bold">Company Details</h2>
                <div className="mt-4">
                  <CompanyOverview company={company} />
                </div>
              </div>
            </div>
          </div>

          {/* Job Listings Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Job Listings</h2>
            <CompanyJobListings companyId={company.company_id} />
          </div>
          {/* Reviews Section */}
          <ReviewsPage params={{ companyId: company.company_id }} />
        </div>
      </div>
  );
};

export default CompanyPage;
