// components/PreAssessmentForm.tsx

import React, { useState } from 'react';

type AssessmentOption = {
  assessment_id: string; // Assuming MongoDB ID string
  assessment_data: string; // The title/description
};

type PreAssessmentFormProps = {
  jobId: string; // The job to attach the assessment to
  jobTitle: string; // The title of the job
  assessments: AssessmentOption[]; // List of available assessments
  onCreate: (jobId: string, assessmentId: string) => Promise<void>;
  loading: boolean;
};

const PreAssessmentForm: React.FC<PreAssessmentFormProps> = ({ jobId, jobTitle, assessments, onCreate, loading }) => {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessmentId) {
      alert('Please select an assessment.');
      return;
    }
    await onCreate(jobId, selectedAssessmentId);
    setSelectedAssessmentId('');
  };

  return (
    <div className="mb-8 border p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-xl font-bold mb-4 text-blue-700">Attach Assessment to Job</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Select Assessment:
          </label>
          <select
            className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            disabled={loading || assessments.length === 0}
          >
            <option value="">-- Select an Existing Assessment --</option>
            {assessments.map((assessment) => (
              <option key={assessment.assessment_id} value={assessment.assessment_id}>
                {assessment.assessment_data}
              </option>
            ))}
          </select>
          {assessments.length === 0 && (
            <p className="text-sm text-red-500 mt-2">No assessments available. Ask a developer to create one first.</p>
          )}
        </div>
        
        <button
          type="submit"
          className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition"
          disabled={loading || !selectedAssessmentId}
        >
          {loading 
            ? 'Attaching...' 
            : `Attach to ${jobTitle || `Job ID: ${jobId.substring(0, 8)}...`}`}
        </button>
      </form>
    </div>
  );
};

export default PreAssessmentForm;