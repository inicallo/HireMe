'use client';

import React, { useEffect, useState } from 'react';
import {
  getSubstypes,
  updateSubsType,
  createSubsType,
  deleteSubsType,
} from '@/lib/substype';
import { ISubsType } from '@/types/substype';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/iuser';
import { getToken } from '@/lib/server';
import Card from './components/cardsub';

const SubsManage: React.FC = () => {
  const [plans, setPlans] = useState<ISubsType[]>([]);
  const [isEditingAll, setIsEditingAll] = useState(false);
  const [userRole, setUserRole] = useState<DecodedToken['role'] | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await getSubstypes();
      if (response.ok && response.substypes?.subscriptionstypeAll) {
        setPlans(response.substypes.subscriptionstypeAll);
      } else {
        toast.error('Failed to fetch plans.');
      }
    } catch (error) {
      toast.error(`Failed to fetch plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const decodedToken = jwtDecode<DecodedToken>(token);
        setUserRole(decodedToken.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    };
    fetchUserRole();
    fetchPlans();
  }, []);

  // CORRECTED: This function now handles individual field changes and syncs with the backend
  const handlePlanChange = async (id: string, name: string, value: any) => {
    // Optimistically update the UI
    setPlans(currentPlans =>
      currentPlans.map(plan =>
        plan.subs_type_id === id ? { ...plan, [name]: value } : plan
      )
    );

    // Debounce or save logic can go here, for now we save immediately
    try {
      const response = await updateSubsType(id, { [name]: value });
      if (!response.ok) {
        toast.error(response.error || 'Failed to update plan.');
        fetchPlans(); // Revert on failure
      } else {
        toast.success(`Plan ${name} updated!`);
      }
    } catch (error) {
      toast.error(`Failed to update plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
      fetchPlans(); // Revert on failure
    }
  };
  
  const handleAddPlan = async () => {
    const newPlanData = {
      type: 'New Plan',
      description: 'Add a description',
      price: 0,
      features: ['New Feature'],
      is_recomend: false,
    };

    try {
      const response = await createSubsType(newPlanData);
      if (response.ok) {
        toast.success('New plan created successfully');
        fetchPlans();
      } else {
        toast.error(response.error || 'Failed to create new plan.');
      }
    } catch (error) {
      toast.error(`Failed to create new plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (userRole !== 'developer') {
      toast.error('You do not have permission to delete plans.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await deleteSubsType(id);
      if (response.ok) {
        setPlans(plans.filter((plan) => plan.subs_type_id !== id));
        toast.success('Plan deleted successfully');
      } else {
        toast.error(response.error || 'Failed to delete plan.');
      }
    } catch (error) {
      toast.error(`Failed to delete plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <main className="flex-1 p-6 md:p-10">
        <h1 className="text-2xl font-semibold mb-4">
          Dev Subscription Setting
        </h1>
        <div className="flex justify-between mb-6">
          <label className="flex cursor-pointer gap-2 items-center">
            <span className="font-medium">View Mode</span>
            <input
              type="checkbox"
              checked={isEditingAll}
              onChange={(e) => setIsEditingAll(e.target.checked)}
              className="toggle bg-white border-gray-400 [--tglbg:theme(colors.gray.500)] checked:bg-blue-500 checked:border-sky-300 checked:[--tglbg:theme(colors.sky.200)]"
            />
            <span className="font-medium">Edit Mode</span>
          </label>
          {isEditingAll && userRole === 'developer' && (
            <button
              onClick={handleAddPlan}
              className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
            >
              Add New Plan
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <Card
              key={plan.subs_type_id}
              plan={plan}
              onChange={handlePlanChange}
              isEditingAll={isEditingAll}
              onRecommend={(id) => handlePlanChange(id, 'is_recomend', !plan.is_recomend)}
              onDelete={handleDeletePlan}
              onToggleEdit={() => {}}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default SubsManage;