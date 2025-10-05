import { ISubsType } from '../types/substype';
import { getToken } from './server';

const base_url = process.env.NEXT_PUBLIC_BASE_API_URL;

interface SubstypeResponse {
  status: string;
  msg: string;
  subscriptionstypeAll: ISubsType[];
}

export const getSubstypes = async (): Promise<{
  substypes: SubstypeResponse | null;
  ok: boolean;
}> => {
  try {
    const response = await fetch(`${base_url}/plans`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: SubstypeResponse = await response.json();
    return { substypes: data, ok: true };
  } catch (error) {
    console.error('Error fetching substypes:', error);
    return { substypes: null, ok: false };
  }
};

type CreateSubsTypeInput = Omit<ISubsType, 'subs_type_id'>;

export const createSubsType = async (
  newSubsType: CreateSubsTypeInput,
): Promise<{ data?: any; error?: string; ok: boolean }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${base_url}/plans`, { // Corrected endpoint
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubsType),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to create new subs type');
    }
    return { data, ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ok: false,
    };
  }
};

export const updateSubsType = async (
  subs_type_id: string,
  updatedSubsType: Partial<ISubsType>, // Use Partial<> for updates
): Promise<{ data?: any; error?: string; ok: boolean }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${base_url}/plans/${subs_type_id}`, { // ✅ CORRECTED: URL path is now correct
      method: 'PATCH', // ✅ CORRECTED: Use PATCH for partial updates
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubsType),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.msg || 'Unknown error occurred');
    }
    return { ok: true, data: result };
  } catch (error) {
    console.error('Error in updateSubsType:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Network error or server unavailable',
    };
  }
};

export const deleteSubsType = async (
  subs_type_id: string, // id is a string
): Promise<{ error?: string; ok: boolean }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${base_url}/plans/${subs_type_id}`, { // Corrected endpoint
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.msg || 'Failed to delete subs type');
    }
    return { ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ok: false,
    };
  }
};