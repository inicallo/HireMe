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

export const getSubstypeById = async (
  id: string,
): Promise<{ substype: ISubsType | null; ok: boolean }> => {
  try {
    const res = await fetch(`${base_url}/plans/${id}`);
    if (!res.ok) {
      throw new Error('Failed to fetch subs type by ID');
    }

    const result: ISubsType = await res.json();

    return { substype: result, ok: true };
  } catch (error) {
    console.error('Error fetching substype by ID:', error);
    return { substype: null, ok: false };
  }
};

export const updateSubsType = async (
  subs_type_id: number,
  updatedSubsType: ISubsType,
): Promise<{ data?: any; error?: string; ok: boolean }> => {
  try {
    const token = await getToken();

    const response = await fetch(`${base_url}/plans/update/${subs_type_id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedSubsType),
    });

    const result = await response.json();

    return {
      ok: response.ok,
      data: result.data,
      error: result.error || result.message || 'Unknown error occurred',
    };
  } catch (error) {
    console.error('Error in updateSubsType:', error);

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : 'Network error or server unavailable',
    };
  }
};

export const createSubsType = async (
  newSubsType: ISubsType,
): Promise<{ data?: any; error?: string; ok: boolean }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${base_url}/plans/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newSubsType),
    });

    if (!response.ok) {
      throw new Error('Failed to create new subs type');
    }

    const data = await response.json();
    return { data, ok: true };
  } catch (error) {
    console.error('Error creating subs type:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ok: false,
    };
  }
};

export const deleteSubsType = async (
  subs_type_id: number,
): Promise<{ error?: string; ok: boolean }> => {
  try {
    const token = await getToken();
    const response = await fetch(`${base_url}/plans/delete/${subs_type_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete subs type');
    }

    return { ok: true };
  } catch (error) {
    console.error('Error deleting subs type:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      ok: false,
    };
  }
};
