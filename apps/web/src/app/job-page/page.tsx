'use client';
import { useEffect, useState, useCallback } from 'react';
import JobFilterBar from './JobFilterBar';
import { fetchJobs } from '@/services/jobService';
import Card from '@/components/JobCard';
import { JobCardProps } from '@/types/job';
import ProtectedRoute from '@/components/ProtectedRoute';
import { fetchUserLocation } from '@/services/locationService';

type Location = { latitude: number; longitude: number } | null;

export default function JobListingsPage() {
  const [jobs, setJobs] = useState<JobCardProps[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 9;
  const [sortOrder, setSortOrder] = useState('latest');
  const [locationAccessDenied, setLocationAccessDenied] = useState(false);
  const [location, setLocation] = useState<Location>(null);

  useEffect(() => {
    fetchUserLocation(setLocation, setLocationAccessDenied);
  }, []);

  const loadJobs = useCallback(
    async (filters = {}, lat?: number, lng?: number, radius = 25) => {
      try {
        const jobFilters: { [key: string]: string | string[] } = {
          ...filters,
          dateRange: sortOrder,
        };

        if (lat !== undefined) jobFilters.lat = lat.toString();
        if (lng !== undefined) jobFilters.lng = lng.toString();
        jobFilters.radius = radius.toString();

        const jobsData = await fetchJobs(sortOrder, jobFilters);

        const formattedJobs = jobsData.map((job) => ({
          job_id: job.job_id,
          job_title: job.job_title,
          location: job.location,
          salary: job.salary ? `$${Number(job.salary).toLocaleString()}` : null,
          company: {
            company_name: job.company.company_name,
            logo: job.company.logo || null,
          },
        }));

        setJobs(formattedJobs || []);
      } catch (error) {
        setJobs([]);
      }
    },
    [sortOrder],
  );

  useEffect(() => {
    if (location) {
      loadJobs({}, location.latitude, location.longitude);
    } else {
      loadJobs();
    }
  }, [sortOrder, location, loadJobs]);

  const handleSearch = (filters: any) => {
    if (location) {
      loadJobs(filters, location.latitude, location.longitude);
    } else {
      loadJobs(filters);
    }
  };

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  const totalPages = Math.ceil(jobs.length / jobsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="bg-[#F1F2F4]">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">
            Find Your Dream Job
          </h1>

          <JobFilterBar
            onSearch={handleSearch}
            manualLocation={locationAccessDenied}
          />

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

          {/* Job Listings */}
          <div className="my-10 flex justify-center items-center w-full h-full">
            {jobs.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
                {currentJobs.map((job) => (
                  <Card key={job.job_id} job={job} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center w-full h-64 space-y-4">
                <span className="loading loading-bars loading-lg"></span>
                <p className="text-gray-500 text-center">
                  No Jobs at the moment...
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
    </div>
  );
}
