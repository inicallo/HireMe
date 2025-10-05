'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getToken } from '@/lib/server';
import base_url from '@/lib/user';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/iuser';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import CompanySettings from './components/SettingCompany';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import ViewAllJobsPosted from './components/VIewAllJobs';
import SettingsTab from './components/SettingAccount';
import PreAssessmentManage from './components/PreAssessmentManage';

const AdminDashboard = () => {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [userName, setUserName] = useState('');

  const jobId = searchParams.get('jobId');
  const jobTitle = searchParams.get('jobTitle');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error('No token found');

        const decodedToken: DecodedToken = jwtDecode<DecodedToken>(token);
        const userId = decodedToken.user_id;

        if (!userId) throw new Error('User ID not found in token');

        const response = await fetch(`${base_url}/user/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserName(`${data.user.firstName} ${data.user.lastName}`);
        } else {
          toast.error(data.msg || 'Failed to fetch user data.');
        }
      } catch (error) {
        toast.error('An error occurred while fetching user data.');
      }
    };

    fetchData();
  }, []);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'overview':
        return <OverviewTab setSelectedTab={setSelectedTab} />;
      case 'ViewAllJobsPosted':
        return <ViewAllJobsPosted />;
      case 'PreAssessmentManage':
        return <PreAssessmentManage jobId={jobId} jobTitle={jobTitle} />;
      case 'SettingCompany':
        return <CompanySettings />;
      case 'accountSettings':
        return <SettingsTab />;
      default:
        return <OverviewTab setSelectedTab={setSelectedTab} />;
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-100 pt-20 lg:pt-0">
        <Sidebar selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
        <main className="p-4">{renderTabContent()}</main>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
