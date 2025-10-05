'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import {
  fetchAllAssessments,
  fetchLinkAssessmentToJob,
  fetchUnlinkAssessmentFromJob,
  fetchJobAssessmentStatus,
} from '@/lib/assessment';
import PreAssessmentForm from '../components/PreAssessmentForm';
import PreAssessmentList from '../components/PreAssessmentList';

type AssessmentOption = { assessment_id: string; assessment_data: string };
type LinkedAssessment = { assessment_id: string; assessment_data: string };

type PreAssessmentManageProps = {
  jobId: string | null;
  jobTitle: string | null;
};

const PreAssessmentManage: React.FC<PreAssessmentManageProps> = ({
  jobId,
  jobTitle,
}) => {
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [linkedAssessment, setLinkedAssessment] =
    useState<LinkedAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const loadData = useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      // Fetch all available assessments
      const allAssessments = await fetchAllAssessments();
      setAssessments(
        allAssessments.map((a) => ({
          ...a,
          assessment_id: String(a.assessment_id),
        })),
      );

      // Fetch the current status for this job
      const currentStatus = await fetchJobAssessmentStatus(jobId);
      setLinkedAssessment(currentStatus);
    } catch (error: any) {
      toast.error('Failed to load assessment data.');
    } finally {
      setLoading(false);
      setIsDataLoaded(true);
    }
  }, [jobId]);

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId, loadData]);

  const handleLinkAssessment = async (jobId: string, assessmentId: string) => {
    try {
      setLoading(true);
      await fetchLinkAssessmentToJob(jobId, assessmentId);
      toast.success('Assessment successfully linked to job!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to link assessment.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkAssessment = async (assessmentId: string) => {
    if (!jobId || !linkedAssessment) return;
    try {
      setLoading(true);
      await fetchUnlinkAssessmentFromJob(jobId, assessmentId);
      toast.success('Assessment successfully unlinked!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlink assessment.');
    } finally {
      setLoading(false);
    }
  };

  if (!jobId) {
    return (
      <div className="p-6 text-center text-xl text-red-600">
        Please select a job to manage its pre-assessment. (Go back to Overview)
      </div>
    );
  }

  if (loading && !isDataLoaded) {
    return (
      <div className="p-6 text-center">
        Loading assessment management interface...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Manage Pre-Selection Test
      </h1>
      <p className="text-xl font-semibold mb-4 text-blue-800">
        Job: {jobTitle || `ID: ${jobId}`}
      </p>

      <PreAssessmentList
        linkedAssessment={linkedAssessment}
        onDelete={handleUnlinkAssessment}
        loading={loading}
      />

      {!linkedAssessment && (
        <PreAssessmentForm
          jobId={jobId}
          jobTitle={jobTitle || `ID: ${jobId}`}
          assessments={assessments}
          onCreate={handleLinkAssessment}
          loading={loading}
        />
      )}
    </div>
  );
};

export default PreAssessmentManage;