import { useState, useEffect, ReactNode } from 'react';
import { FiBriefcase, FiUsers } from 'react-icons/fi';
import { getUserInfo } from '@/lib/user';
import { RecentlyPostedJob } from '@/types/job';
import { fetchRecentlyPostedJobs, fetchTotalJobsCount, fetchTotalApplicantsCount } from '@/lib/job'; 
import moment from 'moment';
import Link from 'next/link';
import Image from 'next/image';

interface OverviewProps {
  setSelectedTab: (tab: string) => void;
}

const Overview = ({ setSelectedTab }: OverviewProps) => {
  const [userName, setUserName] = useState('');
  const [totalJobPostCount, setTotalJobPostCount] = useState(0);
  const [totalUserApplied, setTotalUserApplied] = useState(0);
  const [recentlyPostedJobs, setRecentlyPostedJobs] = useState<RecentlyPostedJob[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await getUserInfo();
        if (userResponse.ok && userResponse.user) {
          setUserName(`${userResponse.user.first_name} ${userResponse.user.last_name}`);
          const userId = userResponse.user.user_id;

          // Fetch total jobs posted by this user
          const jobCountResponse = await fetchTotalJobsCount(userId);
          if (jobCountResponse.ok) {
            setTotalJobPostCount(jobCountResponse.totalJobsCount);
          }

          // Fetch the real number of applicants for this user's jobs
          const applicantsCountResponse = await fetchTotalApplicantsCount(userId);
          if (applicantsCountResponse.ok) {
            setTotalUserApplied(applicantsCountResponse.count);
          }

          // Fetch recent jobs posted by this user
          const recentJobsResponse = await fetchRecentlyPostedJobs(userId);
          if (recentJobsResponse.ok) {
            setRecentlyPostedJobs(recentJobsResponse.jobs.slice(0, 5));
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">Hello, {userName}</h1>
        <p className="text-gray-600">Welcome to your dashboard</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 justify-center">
        <SummaryCard
          color="bg-blue-50"
          icon={<FiBriefcase className="text-blue-500 text-3xl" />}
          count={totalJobPostCount}
          label="Total Jobs Posted"
        />
        <SummaryCard
          color="bg-yellow-50"
          icon={<FiUsers className="text-yellow-500 text-3xl" />}
          count={totalUserApplied}
          label="Total Applicants to Your Jobs"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recently Posted Jobs</h2>
          <button
            onClick={() => setSelectedTab('ViewAllJobsPosted')}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center"
          >
            View All
            <span className="ml-2">→</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Job</th>
                <th>Date Posted</th>
                <th>Status</th>
                <th>Expiration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentlyPostedJobs.length > 0 ? (
                recentlyPostedJobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-gray-100">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle h-12 w-12">
                            {job.logo ? (
                              <Image
                                src={job.logo}
                                width={48}
                                height={48}
                                alt={`${job.job_title} logo`}
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <FiBriefcase />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{job.job_title}</div>
                          <div className="text-sm opacity-50">{job.location}</div>
                        </div>
                      </div>
                    </td>
                    <td>{moment(job.created_at).format('D MMM, YYYY')}</td>
                    <td>
                      <span className={`badge ${job.is_active ? 'badge-success' : 'badge-ghost'}`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{job.jobExpired_at ? moment(job.jobExpired_at).format('D MMM, YYYY') : 'N/A'}</td>
                    <td>
                      <Link 
                         href={`/jobs-applicant/${job.job_id}`}
                      >
                        <button className="btn btn-sm btn-outline btn-primary">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No recently posted jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({
  color,
  icon,
  count,
  label,
}: {
  color: string;
  icon: ReactNode;
  count: number;
  label: string;
}) => {
  return (
    <div className={`p-6 ${color} rounded-lg flex items-center space-x-4 shadow-md`}>
      {icon}
      <div>
        <h2 className="text-2xl font-bold">{count.toLocaleString()}</h2>
        <p className="text-gray-600">{label}</p>
      </div>
    </div>
  );
};

export default Overview;