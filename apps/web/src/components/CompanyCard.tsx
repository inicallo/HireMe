import { Company } from '@/types/company';
import Link from 'next/link';
import Image from 'next/image';

interface CompanyCardProps {
  company: Company;
}

const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => (
  <div className="relative p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 flex flex-col justify-between max-w-lg w-full">
    <div className="flex items-start gap-4">
      {company.logo ? (
        <Image
          src={company.logo}
          alt={`${company.company_name} Logo`}
          width={80}
          height={80}
          className="rounded-full"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-gray-400">No Logo</span>
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-800">{company.company_name}</h3>
        <p className="text-sm text-gray-500">
          {company.IndustryType
            ? company.IndustryType.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
            : ''}
        </p>    
      </div>
    </div>
    <Link href={`/company-page/${company.company_id}`}>
      <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all mt-4">
        View Open Positions →
      </button>
    </Link>
  </div>
);

export default CompanyCard;
