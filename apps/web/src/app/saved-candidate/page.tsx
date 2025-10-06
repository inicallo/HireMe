'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Paper,
  Box,
} from '@mui/material';
import SelectApplicants from './components/SelectApplicants';
import InterviewSchedules from './components/InterviewSchedules';
import MyCompanyJobSideBar from '@/components/MyCompanyJobSideBar';
import Cookies from 'js-cookie';
import base_url from '@/lib/user';

type Applicant = {
  id: number;
  name: string;
  position: string;
  experience: string;
  education: string;
};

type InterviewSchedule = {
  id: number;
  applicantId: number;
  applicantName: string;
  date: string;
  time: string;
};

const SchedulePage: React.FC = () => {
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [company, setCompany] = useState<{ name: string } | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [schedules, setSchedules] = useState<InterviewSchedule[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await fetch(`${base_url}/companies/user`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const data = await response.json();

        if (response.ok && data.company) {
          setCompanyId(data.company.company_id);
          setCompany({ name: data.company.company_name });
        } else {
          throw new Error('Failed to fetch company data');
        }
      } catch (error) {
        console.error('Error fetching company data:', error);
      }
    };

    fetchCompanyData();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`${base_url}/applications/interview-schedules/${companyId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get('token')}`,
          },
        });
        const data = await response.json();
  
        if (response.ok && data.schedules) {
          setSchedules(data.schedules); 
        } else {
          throw new Error('Failed to fetch interview schedules');
        }
      } catch (error) {
        console.error('Error fetching interview schedules:', error);
      }
    };
  
    if (companyId) {
      fetchSchedules();
    }
  }, [companyId]);
  

  const handleOpenDialog = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setDate('');
    setTime('');
  };

  const handleSaveSchedule = () => {
    if (selectedApplicant && date && time) {
      const newSchedule: InterviewSchedule = {
        id: schedules.length + 1,
        applicantId: selectedApplicant.id,
        applicantName: selectedApplicant.name,
        date,
        time,
      };
      setSchedules([...schedules, newSchedule]);
      handleCloseDialog();
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    try {
      const response = await fetch(`${base_url}/applications/interview-schedules/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${Cookies.get('token')}`,
        },
      });
  
      if (response.ok) {
        setSchedules(schedules.filter((schedule) => schedule.id !== id)); // Perbarui state
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  if (!companyId) {
    return (
      <Box className="flex justify-center items-center h-screen">
        <Typography variant="h6" className="text-gray-600">
          Loading company information...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex justify-center bg-gray-100 min-h-screen p-6 space-x-6">
      <MyCompanyJobSideBar />

      <Paper elevation={3} className="w-full max-w-5xl p-6 rounded-lg shadow-lg space-y-6 bg-white">
        <Typography variant="h4" className="font-semibold text-center text-blue-800">
          {company ? `Interview Schedule for ${company.name}` : 'Interview Schedule Management'}
        </Typography>

        <SelectApplicants companyId={companyId} />
        <InterviewSchedules
          schedules={schedules}
          onDelete={handleDeleteSchedule}
        />

        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <DialogTitle className="text-blue-800 font-semibold">Schedule Interview</DialogTitle>
          <DialogContent className="space-y-4">
            <Typography variant="subtitle1" className="mb-2 text-gray-700">
              Applicant: <span className="font-medium">{selectedApplicant?.name}</span>
            </Typography>
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              className="mb-4"
            />
            <TextField
              label="Time"
              type="time"
              fullWidth
              value={time}
              onChange={(e) => setTime(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </DialogContent>
          <DialogActions className="p-4">
            <Button onClick={handleCloseDialog} color="secondary" className="text-gray-600">
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule} variant="contained" color="primary" className="bg-blue-600">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default SchedulePage;
