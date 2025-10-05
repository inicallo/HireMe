// components/PreAssessmentList.tsx

import React from 'react';

type LinkedAssessment = {
  assessment_id: string; // ID of the linked assessment
  assessment_data: string; // Title/Description of the linked assessment
};

type PreAssessmentListProps = {
  linkedAssessment: LinkedAssessment | null; // The currently linked assessment
  onDelete: (assessmentId: string) => void;
  loading: boolean;
};

const PreAssessmentList: React.FC<PreAssessmentListProps> = ({ linkedAssessment, onDelete, loading }) => {
  return (
    <div className="mb-8 p-6 rounded-lg shadow-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Current Job Assessment Status</h3>
      
      {loading ? (
        <p>Checking status...</p>
      ) : linkedAssessment ? (
        <div className="p-4 border border-green-300 bg-green-50 rounded-lg flex justify-between items-center">
          <div>
            <p className="font-semibold text-green-700">Assessment Linked:</p>
            <p className="text-lg">{linkedAssessment.assessment_data}</p>
            <p className="text-sm text-gray-600">Candidates will receive this test upon application.</p>
          </div>
          <button
            onClick={() => onDelete(linkedAssessment.assessment_id)}
            className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
            disabled={loading}
          >
            Unlink Test
          </button>
        </div>
      ) : (
        <div className="p-4 border border-yellow-300 bg-yellow-50 rounded-lg text-yellow-800">
          No pre-selection assessment is currently linked to this job.
        </div>
      )}
    </div>
  );
};

export default PreAssessmentList;