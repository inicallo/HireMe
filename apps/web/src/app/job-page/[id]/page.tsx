'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getJobById } from '@/lib/job';
import { checkApplicationStatus } from '@/lib/applyJob';
import { Job } from '@/types/job';
import HeaderSection from './HeaderSection';
import JobOverview from './JobOverview';
import CompanyInfo from './CompanyInfo';
import ApplyModal from './ApplyModal';
import { useRouter } from 'next/navigation';
import ShareButton from '@/components/share/ShareButton';

const JobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { job, ok } = await getJobById(id as string);
        if (ok && job) {
          setJob(job);

          const appliedStatus = await checkApplicationStatus(job.job_id);
          setHasApplied(appliedStatus);
        } else {
          setError('Failed to load job details');
        }
      } catch (error) {
        setError('An error occurred while fetching job details');
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
  if (error) return <div className="">{error}</div>;
  if (!job) return <p>No job data available</p>;

  const handleSaveClick = () => {
    setIsSaved(!isSaved);
  };

  // --- Helper function to render text with proper formatting ---
  const renderFormattedText = (text: string | null | undefined) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3">
        {line || <>&nbsp;</>}
      </p>
    ));
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8 pt-24 md:mt-16 lg:mt-0">
      <div className="max-w-6xl w-full">
        {/* Main Layout for Job and Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Job Details Section */}
          <div className="flex-1 bg-white shadow-lg rounded-lg p-4 md:p-6 lg:p-8 space-y-8">
            <HeaderSection
              job={job}
              isSaved={isSaved}
              handleSaveClick={handleSaveClick}
              hasApplied={hasApplied}
            />

            {/* --- STYLING UPDATE: Job Description Section --- */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Job Description
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
                {renderFormattedText(job.description)}
              </div>
            </section>

            {/* --- STYLING UPDATE: Responsibilities Section --- */}
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                Responsibilities
              </h2>
              <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
                {renderFormattedText(job.responsibility)}
              </div>
            </section>

            <ShareButton id={job.job_id} />
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-1/3 space-y-6">
            <JobOverview job={job} />
            <CompanyInfo job={job} />
          </div>
        </div>
      </div>

      {/* Apply Modal Component */}
      {job && <ApplyModal jobId={job.job_id} hasApplied={hasApplied} />}
    </div>
  );
};

export default JobPage;
