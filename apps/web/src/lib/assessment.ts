import { Assessment, UserAssessmentScore } from '@/types/assessment';
import { getToken } from './server';

const base_url = process.env.NEXT_PUBLIC_BASE_API_URL;

export async function fetchAllAssessments(): Promise<Assessment[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/all`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch assessments');
  }

  const data = await response.json();
  return data.assessments;
}

export async function fetchCreateAssessment(data: any): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create assessment');
  }
}

export async function fetchDeleteAssessment(id: string): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/delete/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete assessment');
  }
}

export async function fetchUserAssessments(userId: string): Promise<any> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user assessments');
  }

  return await response.json();
}

export async function fetchStartAssessment(assessmentId: string): Promise<any> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/start/${assessmentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start assessment');
  }

  return await response.json();
}

export async function fetchSubmitAssessment(data: {
  responses: any[];
  token: string | null;
}): Promise<any> {
  const { token, responses } = data;
  if (!token) {
    throw new Error('Missing assessment token');
  }

  const response = await fetch(`${base_url}/assessment/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ responses }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Failed to submit assessment');
    } catch {
      throw new Error(errorText || 'Failed to submit assessment');
    }
  }

  return await response.json();
}

export async function fetchAssessmentToken(
  assessmentId: string,
): Promise<string> {
  const userToken = await getToken();
  if (!userToken) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(`${base_url}/assessment/start/${assessmentId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch assessment token.');
  }

  const data = await response.json();
  return data.token;
}

export async function fetchUserScores(): Promise<UserAssessmentScore[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Failed to retrieve authentication token');
  }

  const response = await fetch(`${base_url}/assessment/user-score`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user scores');
  }

  const data = await response.json();
  return data.scores;
}

export async function fetchUserBadgesById(
  userId: string,
): Promise<{ badge: string; assessment_data: string | null }[]> {
  const response = await fetch(
    `${base_url}/assessment/user-score/badge/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch user badges');
  }

  const data = await response.json();
  return data.badges;
}

export async function fetchJobAssessmentStatus(
  jobId: string,
): Promise<{ assessment_id: string; assessment_data: string } | null> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(`${base_url}/preselection/job/${jobId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || 'Failed to fetch job assessment status',
    );
  }

  const data = await response.json();
  return data.assessment;
}

export const fetchLinkAssessmentToJob = async (
  jobId: string,
  assessmentId: string,
) => {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(`${base_url}/preselection/job/${jobId}/link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ assessmentId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || 'Failed to link assessment');
  }

  return response.json();
};

export async function fetchUnlinkAssessmentFromJob(
  jobId: string,
  assessmentId: string,
): Promise<void> {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication token is missing.');
  }

  const response = await fetch(`${base_url}/preselection/job/${jobId}/unlink`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ assessmentId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || 'Failed to unlink assessment from job',
    );
  }
}
