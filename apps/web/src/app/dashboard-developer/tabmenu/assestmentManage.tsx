'use client';

import React, { useState, useEffect } from 'react';
import {
  fetchAllAssessments,
  fetchCreateAssessment,
  fetchDeleteAssessment,
} from '@/lib/assessment';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Assessment } from '@/types/assessment';
import AssessmentForm from './components/assessmentForm';
import AssessmentList from './components/assessmentList';

const DeveloperAssessment: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // State to control form visibility

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAssessments();
      setAssessments(data);
    } catch (error: any) {
      console.error('Error loading assessments:', error);
      toast.error(error.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (data: any) => {
    try {
      setLoading(true);
      await fetchCreateAssessment(data);
      toast.success('Assessment created successfully!');
      await loadAssessments();
      setShowForm(false); // Hide form after creation
    } catch (error: any) {
      console.error('Error creating assessment:', error);
      toast.error(error.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (id: number) => {
    try {
      setLoading(true);
      await fetchDeleteAssessment(id.toString());
      toast.success('Assessment deleted successfully!');
      await loadAssessments();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      toast.error(error.message || 'Failed to delete assessment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Developer Assessment Management
      </h1>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Cancel' : 'Create Assessment'}
      </button>

      {showForm && (
        <AssessmentForm onCreate={handleCreateAssessment} loading={loading} />
      )}

      <AssessmentList
        assessments={assessments}
        onDelete={handleDeleteAssessment}
        loading={loading}
      />
    </div>
  );
};

export default DeveloperAssessment;
