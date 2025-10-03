'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Cv } from '@/types/cvgenerator';
import { downloadCv, getCvs } from '@/lib/cvgenerator';
import { checkSubscriptionStatus } from '@/lib/subsDashboard';
import ResumeForm from './components/resumeform';
import { getToken } from '@/lib/server';

// Define a unique ID for the subscription error toast to prevent duplication in Strict Mode
const SUBSCRIPTION_ERROR_ID = 'inactive-sub-error'; 

export default function CvDashboard() {
  const [isActiveSubscription, setIsActiveSubscription] = useState<
    boolean | null
  >(null);
  const [cv, setCv] = useState<Cv | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fix 1: Position 'fetchCv' correctly for scope
  const fetchCv = async () => {
    setLoading(true);
    try {
      const result = await getCvs();
      if (result.ok && result.cvs && result.cvs.length > 0) {
        setCv(result.cvs[0]);
      } else {
        setCv(null);
      }
    } catch (error) {
      console.error('Error fetching CV:', error);
      toast.error('An error occurred while fetching CV.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSubscription = async () => {
      const token = await getToken();
      if (!token) {
        toast.error('Unauthorized: No token found');
        setIsActiveSubscription(false);
        return;
      }

      // Fix 2: Wrap API call in try...catch to handle thrown errors consistently
      try {
        // NOTE: checkSubscriptionStatus should now THROW an Error on 403 status.
        const result = await checkSubscriptionStatus(token);
        
        if (result.isActive) {
          setIsActiveSubscription(true);
          fetchCv(); // Only call fetchCv on successful subscription check
        } else {
          // This block runs if the API returns 200 OK but isActive: false (less common)
          if (!toast.isActive(SUBSCRIPTION_ERROR_ID)) {
            toast.error('You do not have an active subscription.', {
                toastId: SUBSCRIPTION_ERROR_ID,
            });
          }
          setIsActiveSubscription(false);

          setTimeout(() => {
            router.push('/dashboard-candidate?tab=Subscription');
          }, 3000);
        }
      } catch (error) {
          // Fix 3: This catches the Error THROWN by checkSubscriptionStatus (on 403 Forbidden or network failure).
          console.error("Subscription check failed:", error);
          
          // Use toastId to ensure the user only sees one message, regardless of React running twice.
          if (!toast.isActive(SUBSCRIPTION_ERROR_ID)) {
             toast.error('You do not have an active subscription.', {
                 toastId: SUBSCRIPTION_ERROR_ID,
             });
          }
          setIsActiveSubscription(false);

          setTimeout(() => {
            router.push('/dashboard-candidate?tab=Subscription');
          }, 3000);
      }
      
      // Fix 4: Removed the redundant, unconditional fetchCv() call here.
    };

    checkSubscription();
  }, [router]);

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleUpdate = () => {
    setIsUpdating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsUpdating(false);
  };

  const handleFormSubmit = () => {
    setIsCreating(false);
    setIsUpdating(false);
    fetchCv();
  };

  const handleDownload = async () => {
    if (!cv) {
      toast.error('No CV available for download.');
      return;
    }

    try {
      const result = await downloadCv(cv.cv_id.toString());
      if (result.ok && result.file) {
        const url = window.URL.createObjectURL(result.file);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${cv.cv_id}.pdf`;
        a.click();
      } else {
        toast.error('Failed to download CV.');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      toast.error('An unexpected error occurred.');
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
          CV Generator
        </h2>
        <p className="text-red-500 font-medium">
          You need an active subscription to access this feature. Redirecting to
          subscription plans...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">CV Generator</h1>

        {loading ? (
          <p>Loading...</p>
        ) : isCreating || isUpdating ? (
          <ResumeForm
            onResumeCreated={handleFormSubmit}
            onCancel={handleCancel}
            initialData={isUpdating ? cv?.content : null}
          />
        ) : cv ? (
          <div className="space-y-4">
            <div className="p-4 border rounded bg-gray-50">
              <h2 className="font-bold text-lg">Your CV</h2>
              <p>
                <strong>Full Name:</strong> {cv.content.fullName}
              </p>
              <p>
                <strong>Summary:</strong> {cv.content.summary}
              </p>
              <p>
                <strong>Template:</strong> {cv.template}
              </p>
            </div>
            <div className="flex gap-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleUpdate}
              >
                Update CV
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                onClick={handleDownload}
              >
                Download CV
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-red-500 mb-4">No CV available.</p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleCreate}
            >
              Create CV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}