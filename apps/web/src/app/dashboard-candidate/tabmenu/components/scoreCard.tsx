import React from "react";
import { format } from "date-fns";
import { UserAssessmentScore } from "@/types/assessment"; 

interface ScoreCardProps {
  score: UserAssessmentScore;
  onGenerateCertificate: (score_id: string) => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  onGenerateCertificate,
}) => {
  const formatDateToIndonesian = (date: string): string => {
    return format(new Date(date), "dd MMMM yyyy, HH:mm");
  };

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-6 mb-6 border border-gray-300 hover:shadow-xl transition">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-700 mb-2">{score.assessment_data}</h3>
        <p className="text-sm text-gray-500">
          <span className="font-medium">Created At: </span>
          {formatDateToIndonesian(score.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-y-3 text-gray-800 text-sm">
        <div className="font-medium">Badge:</div>
        <div className="text-gray-700">{score.badge || "No Badge Awarded"}</div>

        <div className="font-medium">Score:</div>
        <div className="text-gray-700">{score.score}</div>

        <div className="font-medium">Status:</div>
        <div
          className={`font-semibold ${
            score.status === "passed" ? "text-green-600" : "text-red-600"
          }`}
        >
          {score.status.charAt(0).toUpperCase() + score.status.slice(1)}
        </div>

        <div className="font-medium">Unique Code:</div>
        <div className="break-words text-gray-700">{score.unique_code}</div>
      </div>

      {score.status === "passed" && (
        <div className="mt-6 text-right">
          <button
            onClick={() => onGenerateCertificate(String(score.score_id))}
            className="bg-blue-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Generate Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default ScoreCard;