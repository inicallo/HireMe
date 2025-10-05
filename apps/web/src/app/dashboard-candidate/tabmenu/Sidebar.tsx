import {
  FiHome,
  FiHeart,
  FiBriefcase,
  FiPrinter,
  FiSettings,
  FiCreditCard,
  FiFileText,
} from 'react-icons/fi';
import { GrCertificate } from 'react-icons/gr';

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
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'appliedJobs' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('appliedJobs')}
      >
        <FiFileText size={20} className="mr-2" /> Applied Jobs
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'favoriteJobs' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('favoriteJobs')}
      >
        <FiHeart size={20} className="mr-2" /> Favorite Jobs
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'Subscription' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('Subscription')}
      >
        <FiBriefcase size={20} className="mr-2" /> Subscription
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'plansBilling' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('plansBilling')}
      >
        <FiCreditCard size={20} className="mr-2" /> Plans & Billing
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'CVGenerator' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('CVGenerator')}
      >
        <FiPrinter size={20} className="mr-2" /> CV Generator
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'userAssessment' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('userAssessment')}
      >
        <GrCertificate size={20} className="mr-2" /> Skill Assessment &
        Certificate
      </li>
      <li
        className={`flex items-center cursor-pointer whitespace-nowrap ${selectedTab === 'settings' ? 'text-blue-500 font-semibold' : ''}`}
        onClick={() => setSelectedTab('settings')}
      >
        <FiSettings size={20} className="mr-2" /> Settings
      </li>
    </ul>
  </aside>
);

export default Sidebar;
