import React from 'react';
import { Assessment } from '@/types/assessment';

type SkillAssessmentListProps = {
  assessments: Assessment[];
  onStart: (id: string) => void;
  loading: boolean;
};

const SkillAssessmentList: React.FC<SkillAssessmentListProps> = ({ assessments, onStart, loading }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Available Skill Assessments</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-4">
          {assessments.map((assessment) => (
            <li
              key={assessment.assessment_id}
              className="p-4 border rounded-lg bg-gray-50 shadow-md flex justify-between items-center"
            >
              <span className="text-lg font-semibold text-blue-700">{assessment.assessment_data}</span>
              <button
                onClick={() => onStart(String(assessment.assessment_id))}
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Start
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SkillAssessmentList;