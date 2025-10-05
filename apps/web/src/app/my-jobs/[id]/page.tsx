'use client';

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Box,
  Grid, // Import Grid component
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import {
  countryOptions,
  jobCategories,
  jobEducationLevels,
  jobExperienceLevels,
  jobTypeOptions,
} from '@/utils/format';

const JobDetail = ({ params }: { params: { id: string } }) => {
  const jobId = params.id;

  const [formData, setFormData] = useState({
    job_title: '',
    description: '',
    location: '',
    country: '',
    salary: '',
    jobCategory: '',
    jobEducationLevel: '',
    jobExperience: '',
    jobType: '',
    is_active: true,
  });

  const fetchJobDetail = async (jobId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/jobs/${jobId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch job details');
      }

      const result = await response.json();

      if (result.job) {
        setFormData({
          job_title: result.job.job_title || '',
          description: result.job.description || '',
          location: result.job.location || '',
          country: result.job.country || '',
          salary: result.job.salary?.toString() || '',
          jobCategory: result.job.jobCategory || '',
          jobEducationLevel: result.job.jobEducationLevel || '',
          jobExperience: result.job.jobExperience || '',
          jobType: result.job.jobType || '',
          is_active: result.job.is_active || false,
        });
      } else {
      }
    } catch (error) {
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: SelectChangeEvent, field: string) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleFormSubmit = async () => {
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary),
        is_active: formData.is_active === true,
      };
  
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/jobs/${jobId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Failed to update job: ${errorData.msg || 'Unknown error'}`);
        return;
      }
  
      alert('Job updated successfully!');
    } catch (error) {
      alert('Failed to update job information.');
    }
  };
  
  useEffect(() => {
    if (jobId) {
      fetchJobDetail(jobId);
    }
  }, [jobId]);

  return (
    <Paper
      elevation={3}
      // Removed gradient for a cleaner look, but you can add it back if you prefer
      sx={{ p: 4, maxWidth: '800px', mx: 'auto', borderRadius: '12px' }}
    >
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
        Edit Job Details
      </Typography>

      <Box component="form" noValidate autoComplete="off">
        <Grid container spacing={3}>
          {/* Row 1: Job Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Job Title"
              name="job_title"
              value={formData.job_title}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Row 2: Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </Grid>

          {/* Row 3: Location and Country */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Location (e.g., City, State)"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={formData.country}
                label="Country"
                onChange={(e) => handleSelectChange(e, 'country')}
              >
                {countryOptions.map((option) => (
                  <MenuItem key={option.code} value={option.code}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 4: Salary and Job Category */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Job Category</InputLabel>
              <Select
                value={formData.jobCategory}
                label="Job Category"
                onChange={(e) => handleSelectChange(e, 'jobCategory')}
              >
                {jobCategories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 5: Education and Experience */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Education Level</InputLabel>
              <Select
                value={formData.jobEducationLevel}
                label="Education Level"
                onChange={(e) => handleSelectChange(e, 'jobEducationLevel')}
              >
                {jobEducationLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Experience Level</InputLabel>
              <Select
                value={formData.jobExperience}
                label="Experience Level"
                onChange={(e) => handleSelectChange(e, 'jobExperience')}
              >
                {jobExperienceLevels.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 6: Job Type and Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={formData.jobType}
                label="Job Type"
                onChange={(e) => handleSelectChange(e, 'jobType')}
              >
                {jobTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.is_active ? 'Active' : 'Expire'}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.value === 'Active' })
                }
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Expire">Expire</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Row 7: Submit Button */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFormSubmit}
                sx={{ py: 1.5, px: 4, fontSize: '1rem' }}
              >
                Save Changes
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default JobDetail;