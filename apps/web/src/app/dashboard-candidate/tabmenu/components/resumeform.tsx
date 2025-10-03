'use client';
import { createCv } from '@/lib/cvgenerator';
import { ResumeContent } from '@/types/cvgenerator';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ResumeFormProps {
  onResumeCreated: () => void;
  onCancel: () => void;
  initialData?: ResumeContent | null; // Data existing untuk update
}

export default function ResumeForm({
  onResumeCreated,
  onCancel,
  initialData,
}: ResumeFormProps) {
  const [resumeContent, setResumeContent] = useState<ResumeContent>(
    initialData || {
      fullName: '',
      email: '',
      phone: '',
      summary: '',
      experiences: [
        { company: '', position: '', years: 0, responsibilities: '' },
      ],
      skills: [],
      education: [{ institution: '', degree: '', year: 0 }],
    },
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof ResumeContent, value: any) => {
    setResumeContent({ ...resumeContent, [field]: value });
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const updatedExperiences = [...resumeContent.experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    handleChange('experiences', updatedExperiences);
  };

  const handleEducationChange = (index: number, field: string, value: any) => {
    const updatedEducation = [...resumeContent.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    handleChange('education', updatedEducation);
  };

  const handleAddExperience = () => {
    handleChange('experiences', [
      ...resumeContent.experiences,
      { company: '', position: '', years: 0, responsibilities: '' },
    ]);
  };

  const handleAddEducation = () => {
    handleChange('education', [
      ...resumeContent.education,
      { institution: '', degree: '', year: 0 },
    ]);
  };

  const validateForm = (): boolean => {
    if (!resumeContent.fullName.trim()) {
      toast.error('Full Name is required.');
      return false;
    }
    if (
      !resumeContent.email.trim() ||
      !/^\S+@\S+\.\S+$/.test(resumeContent.email)
    ) {
      toast.error('Valid email is required.');
      return false;
    }
    if (!resumeContent.phone.trim() || !/^\d+$/.test(resumeContent.phone)) {
      toast.error('Valid phone number is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await createCv('ATS', resumeContent);

      if (result.ok && result.cv) {
        toast.success(
          initialData
            ? 'Resume updated successfully!'
            : 'Resume created successfully!',
        );
        onResumeCreated();

        // Reset form jika berhasil dibuat
        if (!initialData) {
          setResumeContent({
            fullName: '',
            email: '',
            phone: '',
            summary: '',
            experiences: [
              { company: '', position: '', years: 0, responsibilities: '' },
            ],
            skills: [],
            education: [{ institution: '', degree: '', year: 0 }],
          });
        }
      } else {
        toast.error('Failed to save resume. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded bg-white shadow">
      <h2 className="text-lg font-bold mb-4">
        {initialData ? 'Update Resume' : 'Create Resume (ATS Friendly)'}
      </h2>
      <div className="mb-4">
        <label className="block font-bold mb-2">Full Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={resumeContent.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Email</label>
        <input
          type="email"
          className="w-full p-2 border rounded"
          value={resumeContent.email}
          onChange={(e) => handleChange('email', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Phone</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={resumeContent.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Summary</label>
        <textarea
          className="w-full p-2 border rounded"
          value={resumeContent.summary}
          onChange={(e) => handleChange('summary', e.target.value)}
        />
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-2">Work Experience</h3>
        {resumeContent.experiences.map((experience, index) => (
          <div key={index} className="mb-4 border p-2 rounded">
            <input
              type="text"
              placeholder="Company"
              className="w-full mb-2 p-2 border rounded"
              value={experience.company}
              onChange={(e) =>
                handleExperienceChange(index, 'company', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Position"
              className="w-full mb-2 p-2 border rounded"
              value={experience.position}
              onChange={(e) =>
                handleExperienceChange(index, 'position', e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Years"
              className="w-full p-2 border rounded"
              value={experience.years}
              onChange={(e) =>
                handleExperienceChange(index, 'years', e.target.value)
              }
            />
            <textarea
              placeholder="Responsibilities"
              className="w-full p-2 border rounded"
              value={experience.responsibilities}
              onChange={(e) =>
                handleExperienceChange(
                  index,
                  'responsibilities',
                  e.target.value,
                )
              }
            />
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddExperience}
        >
          Add Experience
        </button>
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Skills</label>
        <textarea
          className="w-full p-2 border rounded"
          value={
            Array.isArray(resumeContent.skills)
              ? resumeContent.skills.join(', ')
              : ''
          } // Pastikan skills adalah array
          onChange={(e) =>
            handleChange(
              'skills',
              e.target.value.split(',').map((skill) => skill.trim()), // Pecah string menjadi array
            )
          }
        />
      </div>
      <div className="mb-4">
        <h3 className="font-bold mb-2">Education</h3>
        {resumeContent.education.map((edu, index) => (
          <div key={index} className="mb-4 border p-2 rounded">
            <input
              type="text"
              placeholder="Institution"
              className="w-full mb-2 p-2 border rounded"
              value={edu.institution}
              onChange={(e) =>
                handleEducationChange(index, 'institution', e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Degree"
              className="w-full mb-2 p-2 border rounded"
              value={edu.degree}
              onChange={(e) =>
                handleEducationChange(index, 'degree', e.target.value)
              }
            />
            <input
              type="number"
              placeholder="Year"
              className="w-full p-2 border rounded"
              value={edu.year}
              onChange={(e) =>
                handleEducationChange(index, 'year', e.target.value)
              }
            />
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddEducation}
        >
          Add Education
        </button>
      </div>
      <div className="flex gap-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : initialData
              ? 'Update Resume'
              : 'Create Resume'}
        </button>
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
