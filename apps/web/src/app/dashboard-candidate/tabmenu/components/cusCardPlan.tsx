import React from 'react';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { ISubsType } from '@/types/substype';

interface CustomerCardProps {
  plan: ISubsType;
  onChoose: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ plan, onChoose }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full relative flex flex-col justify-between h-full">
      {plan.is_recomend && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          Recommended
        </div>
      )}
      <h2 className="text-lg font-semibold mb-2">{plan.type}</h2>
      <p className="text-gray-500 mb-4">{plan.description}</p>
      <div className="text-3xl font-bold text-blue-500 mb-1">
        {formatCurrency(plan.price)}{' '}
        <span className="text-gray-500 text-lg font-normal">/Monthly</span>
      </div>
      <ul className="space-y-2 mb-6 mt-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-500">
            <FaCheckCircle className="text-blue-500 mr-2" />
            {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={plan.price > 0 ? onChoose : undefined}
        className={`w-full py-2 rounded-lg flex items-center justify-center ${
          plan.price > 0
            ? 'bg-blue-500 text-white'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
        disabled={plan.price === 0}
      >
        {plan.price > 0 ? 'Choose Plan' : 'Current Plan'}
        <span>{plan.price > 0 ? <FaArrowRight className="ml-2" /> : ''}</span>
      </button>
    </div>
  );
};

export default CustomerCard;
