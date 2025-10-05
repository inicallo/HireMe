import {
  FiHome,
  FiFileText,
  FiBriefcase,
  FiSettings,
  FiCreditCard,
  FiUser,
} from 'react-icons/fi';
import { FaBook } from 'react-icons/fa';

interface SidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

const Sidebar = ({ selectedTab, setSelectedTab }: SidebarProps) => (
  <aside className="bg-white shadow-md p-5 w-full z-10">
    <ul className="flex justify-start lg:justify-center space-x-6 overflow-x-auto text-sm lg:text-base text-gray-700">
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'overview' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('overview')}
      >
        <FiHome size={20} className="mr-2" /> Overview
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'ViewAllJobsPosted' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('ViewAllJobsPosted')}
      >
        <FiBriefcase size={20} className="mr-2" /> All Jobs
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'PreAssessmentManage' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('PreAssessmentManage')}
      >
        <FaBook size={20} className="mr-2" /> PreAssessment
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'SettingCompany' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('SettingCompany')}
      >
        <FiSettings size={20} className="mr-2" /> Company Settings
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'accountSettings' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('accountSettings')}
      >
        <FiUser size={20} className="mr-2" /> Account Settings
      </li>
    </ul>
  </aside>
);

export default Sidebar;
