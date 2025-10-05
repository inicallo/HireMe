import React, { useState, useEffect } from 'react';
import {
  FaArrowRight,
  FaCheckCircle,
  FaPencilAlt,
  FaPlusCircle,
  FaTrashAlt,
} from 'react-icons/fa';
import { BsFillSave2Fill } from 'react-icons/bs';
import { ISubsType } from '@/types/substype';

interface CardProps {
  plan: ISubsType;
  // ✅ CORRECTED: All 'id' parameters are now strings
  onChange: (id: string, name: string, value: any) => void;
  isEditingAll: boolean;
  onRecommend: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleEdit: (id: string) => void;
}

const Card: React.FC<CardProps> = ({
  plan,
  onChange,
  isEditingAll,
  onRecommend,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [localPlan, setLocalPlan] = useState<ISubsType>(plan);

  useEffect(() => {
    // Sync local state if the parent's global edit mode changes
    if (isEditingAll) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setLocalPlan(plan);
  }, [isEditingAll, plan]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setLocalPlan({ ...localPlan, [name]: name === 'price' ? parseFloat(value) || 0 : value });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...localPlan.features];
    updatedFeatures[index] = value;
    setLocalPlan({ ...localPlan, features: updatedFeatures });
  };

  const addFeature = () => {
    setLocalPlan((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = localPlan.features.filter((_, i) => i !== index);
    setLocalPlan({ ...localPlan, features: updatedFeatures });
  };

  const handleSave = () => {
    // Call onChange for each field that has changed to update the parent state
    (Object.keys(localPlan) as Array<keyof ISubsType>).forEach(key => {
      // Use a deep comparison for features array
      if (key === 'features') {
        if (JSON.stringify(localPlan[key]) !== JSON.stringify(plan[key])) {
          onChange(plan.subs_type_id, key, localPlan[key]);
        }
      } else {
        if (localPlan[key] !== plan[key]) {
          onChange(plan.subs_type_id, key, localPlan[key]);
        }
      }
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setLocalPlan(plan);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(plan.subs_type_id);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-md w-full max-w-xs md:max-w-sm lg:max-w-md relative flex flex-col justify-between h-full">
      {plan.is_recomend && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-2 md:px-3 py-1 rounded-bl-lg">
          Recommendation
        </div>
      )}
      {isEditingAll && (
        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          className="absolute top-0 left-0 bg-gray-200 text-gray-700 text-xs md:text-sm font-semibold px-2 md:px-3 py-1 rounded-br-lg flex items-center space-x-1"
        >
          {isEditing ? <BsFillSave2Fill /> : <FaPencilAlt />}
          <span>{isEditing ? 'Save' : 'Edit'}</span>
        </button>
      )}

      <div className="flex-grow pt-8">
        {isEditing ? (
          <>
            <input
              type="text"
              name="type"
              value={localPlan.type || ''}
              onChange={handleInputChange}
              className="text-md md:text-lg font-semibold mb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="Enter title"
            />
            <textarea
              name="description"
              value={localPlan.description || ''}
              onChange={handleInputChange}
              className="text-sm md:text-gray-500 mb-4 w-full border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
              placeholder="Enter description"
            />
            <div className="text-2xl md:text-3xl font-bold text-blue-500 mb-1">
              <input
                type="number"
                name="price"
                value={localPlan.price || 0}
                onChange={handleInputChange}
                className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-md md:text-lg font-semibold mb-2">
              {plan.type || 'No title available'}
            </h2>
            <p className="text-sm md:text-gray-500 mb-4">
              {plan.description || 'No description available'}
            </p>
            <div className="text-2xl md:text-3xl font-bold text-blue-500 mb-1">
              {plan.price > 0
                ? formatCurrency(plan.price)
                : '0'}{' '}
              <span className="text-gray-500 text-sm md:text-lg font-normal">
                /Monthly
              </span>
            </div>
          </>
        )}
        <ul className="space-y-2 mb-4 md:mb-6 mt-3 md:mt-4">
          {isEditing
            ? localPlan.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-sm md:text-gray-500">
                  <FaCheckCircle className="text-blue-500 mr-2" />
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="w-full border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
                  />
                  <button onClick={() => removeFeature(index)} className="ml-2 text-red-500">
                    <FaTrashAlt />
                  </button>
                </li>
              ))
            : plan.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-sm md:text-gray-500">
                  <FaCheckCircle className="text-blue-500 mr-2" />
                  <div className="my-1">{feature}</div>
                </li>
              ))}
          {isEditing && (
            <li>
              <button onClick={addFeature} className="text-blue-500 flex items-center">
                <FaPlusCircle className="mr-2" /> Add Feature
              </button>
            </li>
          )}
        </ul>
      </div>
      <button className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center mt-auto text-sm md:text-base">
        Choose Plan <FaArrowRight className="ml-2" />
      </button>
      {isEditing && (
        <>
          <button
            onClick={() => onRecommend(plan.subs_type_id)}
            className="mt-2 md:mt-4 w-full bg-gray-200 text-gray-700 py-2 rounded-lg flex items-center justify-center text-sm md:text-base"
          >
            {plan.is_recomend ? 'Unrecommend' : 'Recommend'}
          </button>
          <button
            onClick={handleDelete}
            className="mt-2 md:mt-4 w-full bg-red-500 text-white py-2 rounded-lg flex items-center justify-center text-sm md:text-base"
          >
            Delete Plan <FaTrashAlt className="ml-2" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="mt-2 md:mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded-lg flex items-center justify-center text-sm md:text-base"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default Card;