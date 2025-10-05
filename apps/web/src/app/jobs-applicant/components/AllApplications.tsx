'use client';

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { getStatusLabel } from '@/utils/format';
import base_url from '@/lib/user';
import Image from 'next/image';
import BadgeSystem from '@/components/badgesystem';

type Applicant = {
  id: string;
  user_id: string;
  name: string;
  position: string;
  experience: string;
  education: string;
  dateApplied: string;
  status: string;
  photoUrl?: string;
  email: string;
  resume?: string;
  phone: string;
  correctAnswers: number;
};

type AllApplicationsProps = {
  jobId: string;
  sort: string;
  searchName: string;
  searchExperience: string;
  searchEducation: string;
};

const AllApplications: React.FC<AllApplicationsProps> = ({
  jobId,
  sort,
  searchName,
  searchExperience,
  searchEducation,
}) => {
  const [allApplicants, setAllApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    if (!jobId || jobId.length < 10) {
      console.warn('Job ID is invalid or missing. Skipping API call.');
      return;
    }

    const fetchApplicants = async () => {
      try {
        const response = await axios.get(
          `${base_url}/applications/job/${jobId}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get('token')}`,
            },
          },
        );
        setAllApplicants(response.data.applications);
      } catch (error) {
        toast.error('Failed to load applications.');
      }
    };

    fetchApplicants();
  }, [jobId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      await axios.patch(
        `${base_url}/applications/${applicantId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        },
      );

      setAllApplicants((prevApplicants) =>
        prevApplicants.map((applicant) =>
          applicant.id === applicantId
            ? { ...applicant, status: newStatus }
            : applicant,
        ),
      );

      toast.success(`Status updated to ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error('Failed to update status.');
    }
  };

  const filteredAndSortedApplicants = useMemo(() => {
    // Note: The filtering and sorting logic still needs to be implemented here.
    // This currently just copies the array.
    let result = [...allApplicants];
    return result;
  }, [allApplicants]); // Corrected dependencies

  function toProperCase(education: string): string {
    if (!education) return '';
    return education
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  return (
    <Paper elevation={3} className="bg-white shadow-lg rounded-lg p-6 w-full">
      <Typography
        variant="h6"
        className="font-semibold mb-4 text-center text-gray-800"
      >
        All Applications ({filteredAndSortedApplicants.length} of{' '}
        {allApplicants.length})
      </Typography>

      {filteredAndSortedApplicants.map((applicant) => (
        <div key={applicant.id} className="border-b border-gray-300 py-4">
          <div className="flex items-center mb-3">
            <Image
              src={
                applicant.photoUrl ||
                'https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp'
              }
              width={64}
              height={64}
              alt={`${applicant.name}'s photo`}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <Typography className="font-semibold text-gray-800 text-sm flex items-center">
                {applicant.name}
                <BadgeSystem userId={applicant.user_id} />
              </Typography>
              <Typography className="text-xs text-gray-500">
                {applicant.position}
              </Typography>
            </div>
          </div>
          <div className="text-center mb-2">
            <Typography className="text-xs text-gray-600">
              {applicant.experience || 'No Experience Listed'} Years of
              Experience
            </Typography>
            <Typography className="text-xs text-gray-600">
              Education: {toProperCase(applicant.education)}
            </Typography>
            <Typography className="text-xs text-gray-600">
              Email:{' '}
              {applicant.email ? (
                <a
                  href={`mailto:${applicant.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {applicant.email}
                </a>
              ) : (
                'No Email Provided'
              )}
            </Typography>
            <Typography className="text-xs text-gray-600">
              Phone:{' '}
              {applicant.phone ? (
                <a
                  href={`tel:${applicant.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {applicant.phone}
                </a>
              ) : (
                'No Phone Provided'
              )}
            </Typography>
            <Typography className="text-xs text-gray-600">
              Applied: {formatDate(applicant.dateApplied)}
            </Typography>
            <Typography className="text-xs text-gray-800 font-semibold">
              Correct Answers: {applicant.correctAnswers}
            </Typography>
          </div>

          {applicant.resume && (
            <div className="text-center">
              <Typography className="text-xs text-blue-600">
                <a
                  href={applicant.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Resume
                </a>
              </Typography>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={applicant.status}
                label="Status"
                onChange={(e) =>
                  handleStatusChange(applicant.id, e.target.value as string)
                }
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="interview">Interview</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="hired">Hired</MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>
      ))}
      {filteredAndSortedApplicants.length === 0 && (
        <Typography className="text-center text-gray-500 mt-4">
          No applicants match the current filter criteria.
        </Typography>
      )}
    </Paper>
  );
};

export default AllApplications;
