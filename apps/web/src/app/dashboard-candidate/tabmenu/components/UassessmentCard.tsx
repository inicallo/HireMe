import React, { useState } from 'react';
import { Question } from '@/types/assessment';

type AssessmentCardProps = {
  questions: Question[];
  onSubmit: (responses: { question_id: string; answer_id: string; answer_text: string }[]) => void;
  loading: boolean;
};

const AssessmentCard: React.FC<AssessmentCardProps> = ({ questions, onSubmit, loading }) => {
  const [responses, setResponses] = useState<
    { question_id: string; answer_id: string; answer_text: string }[]
  >([]);

  const handleAnswer = (question_id: string, answer_id: string, answer_text: string) => {
    setResponses((prev) => [
      ...prev.filter((res) => res.question_id !== question_id),
      { question_id, answer_id, answer_text },
    ]);
  };

  const handleSubmit = () => {
    if (responses.length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }
    onSubmit(responses);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Assessment</h1>
      {questions.map((question) => (
        <div
          key={question.question_id}
          className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{question.question_text}</h3>
          <ul className="space-y-3">
            {question.answers.map((answer) => (
              <li key={answer.answer_id}>
                <label
                  htmlFor={`answer_${answer.answer_id}`}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    id={`answer_${answer.answer_id}`}
                    type="radio"
                    name={`question_${question.question_id}`}
                    onChange={() =>
                      handleAnswer(
                        String(question.question_id),
                        String(answer.answer_id),
                        String(answer.answer_text)
                      )
                    }
                    className="mr-3 h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 group-hover:text-blue-500 transition">
                    {answer.answer_text}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        className={`mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </div>
  );
};

export default AssessmentCard;