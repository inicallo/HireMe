import React from 'react';
import Image from 'next/image';

const PromoSection: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4">
      {/* Bagian Teks */}
      <div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Buy Premium Subscription to Premium Feature
        </h2>
        <p className="text-gray-600">
          Gain a competitive edge in the job market with our exclusive features.
          Upgrade your plan to access advanced tools, unlimited skill
          assessments, and priority application support.
        </p>
      </div>

      {/* Bagian Gambar */}
      <div className="md:w-1/2 flex justify-center">
        <Image
          src="/assets/Subsmenu.png"
          alt="Illustration"
          width={400}
          height={300}
          className="object-contain"
        />
      </div>
    </div>
  );
};

export default PromoSection;
