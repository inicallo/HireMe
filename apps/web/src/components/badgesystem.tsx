import { fetchUserBadgesById } from "@/lib/assessment";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import badge from "@/assets/badge.gif";

const BadgeSystem: React.FC<{ userId: string | number }> = ({ userId }) => {
  const [badges, setBadges] = useState<{ badge: string; assessment_data: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const data = await fetchUserBadgesById(String(userId)); 
        if (data.length > 0) {
          setBadges([data[0]]);
        } else {
          setBadges([]); 
        }
      } catch (err: any) {
        setError(err.message || "Failed to load badges");
      }
    };

    loadBadges();
  }, [userId]);

  if (error) {
    return null; 
  }

  return (
    <div className="flex items-center">
      {badges.length > 0 ? (
        <div
          key={badges[0].badge}
          className="group relative flex flex-col items-center"
        >
          {/* Badge icon */}
          <Image
            src={badge} 
            alt={badges[0].badge}
            width={40}
            height={40}
          />

          
          <div className="w-28 absolute bottom-5 left-12 transform -translate-x-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {badges[0].badge}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default BadgeSystem;
