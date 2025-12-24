import React, { useEffect, useState } from 'react';

interface NotificationProps {
  notification: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
    } else {
      // Allow fade-out animation before removing from DOM
      const timer = setTimeout(() => setIsVisible(false), 300); // Should match animation duration
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!notification && !isVisible) {
    return null;
  }

  const baseClasses = "fixed top-5 right-5 z-50 flex items-center p-4 max-w-sm w-full rounded-lg shadow-lg transition-transform duration-300 ease-in-out";
  
  const typeClasses = {
    success: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    error: 'bg-red-100 text-red-800 border-l-4 border-red-500',
    info: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
  };

  const iconClasses = {
    success: 'fas fa-check-circle text-green-500',
    error: 'fas fa-times-circle text-red-500',
    info: 'fas fa-info-circle text-blue-500',
  };

  const transformClass = notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0';

  return (
    <div 
        className={`${baseClasses} ${typeClasses[notification?.type || 'info']} ${transformClass}`}
        role="alert"
    >
      <div className="text-xl">
        <i className={iconClasses[notification?.type || 'info']}></i>
      </div>
      <div className="ml-3 text-sm font-medium">
        {notification?.message}
      </div>
      <button 
        type="button" 
        className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8 focus:ring-2"
        onClick={onClose} 
        aria-label="Close"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

export default Notification;