import React from "react";
import { format } from "date-fns";

interface ScoreCardProps {
  badge: string;
  score: number;
  status: string;
  unique_code: string;
  created_at: string;
  assessment_data: string;
  score_id: number;
  onGenerateCertificate: (score_id: number) => void;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  badge,
  score,
  status,
  unique_code,
  created_at,
  assessment_data,
  score_id,
  onGenerateCertificate,
}) => {
  const formatDateToIndonesian = (date: string): string => {
    return format(new Date(date), "dd MMMM yyyy, HH:mm");
  };

  return (
    <div className="bg-gray-100 shadow-md rounded-lg p-6 mb-6 border border-gray-300 hover:shadow-xl transition">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-700 mb-2">{assessment_data}</h3>
        <p className="text-sm text-gray-500">
          <span className="font-medium">Created At: </span>
          {formatDateToIndonesian(created_at)}
        </p>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-y-3 text-gray-800 text-sm">
        <div className="font-medium">Badge:</div>
        <div className="text-gray-700">{badge || "No Badge Awarded"}</div>

        <div className="font-medium">Score:</div>
        <div className="text-gray-700">{score}</div>

        <div className="font-medium">Status:</div>
        <div
          className={`font-semibold ${
            status === "passed" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>

        <div className="font-medium">Unique Code:</div>
        <div className="break-words text-gray-700">{unique_code}</div>
      </div>

      {/* Footer */}
      {status === "passed" && (
        <div className="mt-6 text-right">
          <button
            onClick={() => onGenerateCertificate(score_id)}
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
