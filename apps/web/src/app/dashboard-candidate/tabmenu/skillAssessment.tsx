'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  fetchAllAssessments,
  fetchStartAssessment,
  fetchSubmitAssessment,
  fetchUserScores,
} from '@/lib/assessment';
import { fetchGenerateCertificate } from '@/lib/certif';
import { Assessment, Question, UserAssessmentScore } from '@/types/assessment';
import SkillAssessmentList from './components/UassessmentList';
import AssessmentCard from './components/UassessmentCard';
import { getToken } from '@/lib/server';
import { checkSubscriptionStatus } from '@/lib/subsDashboard';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ScoreCard from './components/scoreCard';

const UserAssessment: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [isActiveSubscription, setIsActiveSubscription] = useState<
    boolean | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const router = useRouter();
  const [userScores, setUserScores] = useState<UserAssessmentScore[]>([]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          toast.error('Unauthorized: No token found');
          setIsActiveSubscription(false);
          return;
        }

        const result = await checkSubscriptionStatus(token);
        if (result.isActive) {
          setIsActiveSubscription(true);
        } else {
          toast.error('You do not have an active subscription.');
          setIsActiveSubscription(false);

          setTimeout(() => {
            router.push('/dashboard-candidate?tab=Subscription');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        toast.error('An unexpected error occurred while verifying subscription.');
        setIsActiveSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [router]);

  const handleAutoSubmit = useCallback(async () => {
    try {
      const token = localStorage.getItem('assessmentToken');

      if (!token) {
        toast.error('Failed to auto-submit: Token is missing.');
        return;
      }

      toast.warn('Time is up! Auto-submitting the assessment.');

      const data = { responses: [], token }; // Submit token with empty data
      await fetchSubmitAssessment(data);

      toast.success('Assessment auto-submitted successfully.');
      setQuestions(null); // Reset questions in state
      router.push('/dashboard-candidate'); // Navigate to results or dashboard page
    } catch (error: any) {
      console.error('Error auto-submitting assessment:', error);
      toast.error(error.message || 'Failed to auto-submit assessment.');
    }
  }, [router]);

  useEffect(() => {
    if (questions && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }

    if (timeLeft === 0) {
      handleAutoSubmit();
    }
  }, [questions, timeLeft, handleAutoSubmit]);

  useEffect(() => {
    if (isActiveSubscription) {
      loadAssessments();
      loadUserScores();
    }
  }, [isActiveSubscription]);

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

  const handleStartAssessment = async (assessmentId: number) => {
    try {
      setLoading(true);
      const { token, assessment } = await fetchStartAssessment(assessmentId);

      localStorage.setItem('assessmentToken', token); // Save token
      setQuestions(assessment.questions); // Save questions
      setTimeLeft(30 * 60); // Reset timer

      toast.success('Assessment started!');
    } catch (error: any) {
      console.error('Error starting assessment:', error);
      toast.error(error.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async (
    responses: { question_id: number; answer_text: string }[],
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('assessmentToken');
      const data = { responses, token }; // Submit token with data
      await fetchSubmitAssessment(data);
      setQuestions(null); // Reset questions after submit
      toast.success('Assessment submitted successfully!');
      router.push('/dashboard-candidate'); // Navigate to main page
    } catch (error: any) {
      console.error('Error submitting assessment:', error);
      toast.error(error.message || 'Failed to submit assessment');
    } finally {
      setLoading(false);
    }
  };

  const loadUserScores = async () => {
    try {
      setLoading(true);
      const scores = await fetchUserScores();
      setUserScores(scores);
    } catch (error: any) {
      console.error('Error loading user scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (score_id: number) => {
    try {
      const certificateBlob = await fetchGenerateCertificate(score_id);
      const url = window.URL.createObjectURL(certificateBlob);

      // Unduh file sertifikat
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${score_id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate. Please try again.');
    }
  };

  if (isActiveSubscription === null) {
    return (
      <div className="flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            Checking subscription status...
          </p>
        </div>
      </div>
    );
  }

  if (!isActiveSubscription) {
    return (
      <div className="flex flex-col justify-center text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Skill Assessment & Certificate
        </h2>
        <p className="text-red-500 font-medium">
          You need an active subscription to access this feature. Redirecting to
          subscription plans...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {!questions ? (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Skill Assessments & Certificate
          </h1>
          {assessments.length > 0 ? (
            <SkillAssessmentList
              assessments={assessments}
              onStart={handleStartAssessment}
              loading={loading}
            />
          ) : (
            <div className="text-center text-gray-600">
              <p>No assessments available at the moment.</p>
            </div>
          )}
          <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              User Scores
            </h2>
            {userScores.length > 0 ? (
              userScores.map((score) => (
                <ScoreCard
                  key={score.score_id}
                  badge={score.badge}
                  score={score.score}
                  status={score.status}
                  unique_code={score.unique_code}
                  created_at={score.created_at}
                  assessment_data={score.assessment_data}
                  score_id={score.score_id} // Berikan score_id
                  onGenerateCertificate={handleGenerateCertificate} // Fungsi menerima score_id
                />
              ))
            ) : (
              <div className="text-center text-gray-600">
                <p>No scores available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-red-500 font-medium text-lg">
            Time Remaining: {Math.floor(timeLeft / 60)}:
            {timeLeft % 60 < 10 ? '0' : ''}
            {timeLeft % 60}
          </p>
          <div className="relative w-full h-2 bg-gray-200 rounded mt-2">
            <div
              className="absolute h-full bg-blue-500 rounded"
              style={{ width: `${(timeLeft / (30 * 60)) * 100}%` }}
            ></div>
          </div>
          <AssessmentCard
            questions={questions}
            onSubmit={handleSubmitAssessment}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default UserAssessment;
