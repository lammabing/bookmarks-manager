import React from 'react';
import { Lock, Globe, Users } from 'lucide-react';

const SharingBadge = ({ visibility, className = "" }) => {
  const getBadgeConfig = () => {
    switch (visibility) {
      case 'private':
        return {
          icon: Lock,
          text: 'Private',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
      case 'public':
        return {
          icon: Globe,
          text: 'Public',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'selected':
        return {
          icon: Users,
          text: 'Shared',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      default:
        return {
          icon: Lock,
          text: 'Private',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon size={14} className={`mr-1 ${config.iconColor}`} />
      {config.text}
    </div>
  );
};

export default SharingBadge;