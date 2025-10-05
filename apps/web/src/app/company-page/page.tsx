'use client';
import { useState, useEffect, useCallback } from 'react';
import CompanyFilterBar from './CompanyFilterBar';
import CompanyCard from '@/components/CompanyCard';
import { getFilteredCompanies } from '@/services/companyService';
import { Company } from '@/types/company';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const companiesPerPage = 9;
  const [sortOrder, setSortOrder] = useState('latest');

  const loadCompanies = useCallback(
    async (filters: { search: string } = { search: '' }) => {
      try {
        const companyFilters: {
          search: string;
          [key: string]: string | string[];
        } = {
          ...filters,
          dateRange: sortOrder,
        };

        const data = await getFilteredCompanies(companyFilters);

        const sortedCompanies = [...data].sort((a, b) => {
          if (sortOrder === 'latest') {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          }
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });

        setCompanies(sortedCompanies);
      } catch (error) {
        setCompanies([]);
      }
    },
    [sortOrder],
  );

  useEffect(() => {
    loadCompanies({ search: '' });
  }, [sortOrder, loadCompanies]);

  const handleSearch = (filters: {
    search: string;
    industry?: string[];
    country?: string;
  }) => {
    loadCompanies(filters);
  };

  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = companies.slice(
    indexOfFirstCompany,
    indexOfLastCompany,
  );

  const totalPages = Math.ceil(companies.length / companiesPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-[#F1F2F4]">
      <ProtectedRoute requiredRole="candidate">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
            Browse Companies
          </h1>

          <CompanyFilterBar onSearch={handleSearch} />

          {/* Sort Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-2">
              <button
                onClick={() => setSortOrder('latest')}
                className={`p-2 rounded-md ${
                  sortOrder === 'latest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortOrder('oldest')}
                className={`p-2 rounded-md ${
                  sortOrder === 'oldest'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                Oldest
              </button>
            </div>
          </div>

          {/* Company Listings */}
          <div className="my-10 flex justify-center items-center w-full h-full">
            {companies.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {currentCompanies.map((company) => (
                  <CompanyCard key={company.company_id} company={company} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
                <span className="loading loading-bars loading-lg"></span>
                <p className="text-gray-500 text-center">
                  No Companies available at the moment...
                </p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="btn btn-outline btn-sm mx-2"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="btn btn-outline btn-sm mx-2"
            >
              Next
            </button>
          </div>
        </div>
      </ProtectedRoute>
    </div>
  );
}
