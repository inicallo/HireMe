import { DashboardData } from '@/types/subsDashboard';
import { getToken } from './server';

const base_url = process.env.NEXT_PUBLIC_BASE_API_URL;

export const fetchSubsDashboardData = async (): Promise<{
  data?: DashboardData;
  error?: string;
}> => {
  try {
    const token = await getToken();

    if (!token) {
      throw new Error('No token found. Please log in.');
    }

    const response = await fetch(`${base_url}/subscription/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch dashboard data');
    }

    const data: DashboardData = await response.json();
    return { data };
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return { error: error.message };
  }
};

export const checkSubscriptionStatus = async (
  token: string,
): Promise<{ isActive: boolean; message?: string }> => {
  const response = await fetch(`${base_url}/subscription/check-active`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    // THROW on 403 Forbidden status, ensuring the frontend component's try/catch runs.
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message || 'Subscription check failed with non-200 status.';

    throw new Error(errorMessage);
  }

  // If response is 200 OK, return the active status.
  const data = await response.json();
  return { isActive: data.isActive };
};
