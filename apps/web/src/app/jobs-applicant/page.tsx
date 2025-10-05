'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Typography,
  Button,
  Menu,
  MenuItem,
  TextField,
  Paper,
} from '@mui/material';
import { FilterList } from '@mui/icons-material';
import MyCompanyJobSideBar from '@/components/MyCompanyJobSideBar';
import AllApplications from './components/AllApplications';
import ProtectedRoute from '@/components/ProtectedRoute';

const JobApplications: React.FC = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId'); // Now correctly kept as a string
  const jobTitle = searchParams.get('jobTitle');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sort, setSort] = useState('Newest');
  const [searchName, setSearchName] = useState('');
  const [searchExperience, setSearchExperience] = useState('');
  const [searchEducation, setSearchEducation] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    handleMenuClose();
  };

  if (!jobId) {
    return <div>Loading...</div>;
  }

  const finalJobId = jobId;

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex justify-center items-start bg-gray-100 min-h-screen p-6 space-x-8">
        <MyCompanyJobSideBar />

        <main className="flex-1 max-w-4xl space-y-6">
          <Paper elevation={3} className="p-6 bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Typography variant="h5" className="font-semibold text-gray-800">
                Job Applicants for {jobTitle}
              </Typography>
              <Button
                startIcon={<FilterList />}
                onClick={handleMenuOpen}
                variant="contained"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md text-sm"
              >
                Sort: {sort}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleSortChange('Newest')}>
                  Newest
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('Oldest')}>
                  Oldest
                </MenuItem>
                <MenuItem onClick={() => handleSortChange('CorrectAnswers')}>
                  Correct Answers
                </MenuItem>
              </Menu>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <TextField
                label="Search by Name"
                variant="outlined"
                size="small"
                fullWidth
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="bg-white"
              />
              <TextField
                label="Search by Experience"
                variant="outlined"
                size="small"
                fullWidth
                value={searchExperience}
                onChange={(e) => setSearchExperience(e.target.value)}
                className="bg-white"
              />
              <TextField
                label="Search by Education"
                variant="outlined"
                size="small"
                fullWidth
                value={searchEducation}
                onChange={(e) => setSearchEducation(e.target.value)}
                className="bg-white"
              />
            </div>
          </Paper>

          {/* Application Cards */}
          <div>
            <AllApplications
              jobId={finalJobId}
              sort={sort}
              searchName={searchName}
              searchExperience={searchExperience}
              searchEducation={searchEducation}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default JobApplications;