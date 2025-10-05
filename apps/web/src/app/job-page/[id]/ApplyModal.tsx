'use client';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { applyForJob } from '@/lib/applyJob';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { checkPreSelectionTest } from '@/lib/applyJob';

const ApplyModal = ({ jobId }: any) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [hasAssessment, setHasAssessment] = useState(false); // 💡 NEW STATE for assessment status
  const [showConfirmation, setShowConfirmation] = useState<{
    type: 'apply' | 'cancel' | null;
  }>({ type: null });
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setResume(event.target.files[0]);
    }
  };

  const handleCancelClick = () => {
    setShowConfirmation({ type: 'cancel' });
  };

  const handleApplyClick = async () => {
    const hasTest = await checkPreSelectionTest(jobId);
    setHasAssessment(hasTest);

    setShowConfirmation({ type: 'apply' });
  };

  const handleConfirm = async () => {
    if (showConfirmation.type === 'apply') {
      if (!resume) {
        toast.warning('Please upload a resume before applying.');
        return;
      }

      const response = await applyForJob(jobId, coverLetter, resume);

      if (response.ok) {
        toast.success('Application submitted successfully!');

        if (hasAssessment) {
          toast.info(
            'Check your email! You will receive a pre-selection assessment shortly.',
            { autoClose: 8000 },
          );
        }

        router.push(`/job-page`);
        setShowConfirmation({ type: null });
        return;
      } else {
        toast.error(response.msg || 'Failed to submit the application.');
      }
      setShowConfirmation({ type: null });
    } else if (showConfirmation.type === 'cancel') {
      window.history.back();
    }
  };

  const handleDeny = () => {
    setShowConfirmation({ type: null });
  };

  return (
    <div className="modal" role="dialog" id="my_modal_8">
      <div className="modal-box w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-5xl p-4 md:p-6 lg:p-8 overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-center lg:text-left">
          Apply for the Job
        </h3>

        {/* Upload Resume */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Resume
        </label>
        <input
          type="file"
          className="file-input file-input-bordered w-full mb-6"
          onChange={handleFileChange}
          accept=".pdf"
        />

        {/* Cover Letter with Larger Rich Text Editor */}
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Letter
        </label>
        <ReactQuill
          value={coverLetter}
          onChange={setCoverLetter}
          placeholder="Write down your biography here. Let the employers know who you are..."
          style={{ height: '200px', marginBottom: '24px' }}
          modules={{
            toolbar: [
              [{ header: '1' }, { header: '2' }],
              [{ list: 'ordered' }, { list: 'bullet' }],
              ['bold', 'italic', 'underline'],
              [{ color: [] }],
              ['link'],
            ],
          }}
          formats={[
            'header',
            'bold',
            'italic',
            'underline',
            'blockquote',
            'list',
            'bullet',
            'link',
            'color',
          ]}
        />

        {/* Action Buttons with Custom Confirmation Alert */}
        <div className="modal-action flex flex-col sm:flex-row justify-center sm:justify-between items-center mt-10 p-3 space-y-4 sm:space-y-0 sm:space-x-4 w-full">
          <button
            onClick={handleCancelClick}
            className="btn text-gray-600 px-4 py-2 w-full sm:w-auto"
          >
            Close
          </button>
          <button
            onClick={handleApplyClick}
            className="btn bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all w-full sm:w-auto text-sm font-semibold"
          >
            Apply Now
          </button>
        </div>

        {/* Confirmation Alert */}
        {showConfirmation.type && (
          <div
            role="alert"
            className="alert flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-8 p-4 border border-gray-300 rounded-md bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-info h-6 w-6 shrink-0"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                {showConfirmation.type === 'apply'
                  ? 'Are you sure you want to apply for this job?'
                  : 'Are you sure you want to cancel your application?'}
              </span>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <button onClick={handleDeny} className="btn btn-sm">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-sm btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplyModal;
