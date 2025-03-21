import React, { useState, useEffect } from 'react';
import TextSolidFilter from '@/assets/icon_pack/text-solid-filter.svg';

// Define types for sidebar items
interface SidebarItemProps {
  id: string;
  label: string;
  icon?: string;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

interface SidebarProps {
  items: SidebarItemProps[];
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  onButtonClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  items, 
  activeItemId, 
  onItemClick, 
  onButtonClick 
}) => {
  // Handler for item click without using state
  const handleItemClick = (id: string) => {
    if (onItemClick) {
      onItemClick(id);
    }
  };

  // State for expandable lists
  const [isNavigationExpanded, setIsNavigationExpanded] = useState(true);
  const [isUserSettingsExpanded, setIsUserSettingsExpanded] = useState(false);
  
  // Split items into two groups
  const navigationItems = items.slice(0, 2);
  const settingsItems = items.slice(2);
  
  return (
    <div className="w-64 h-[700px] max-w-[900px] bg-[#085899] p-4 border-r border-[#085899] rounded-2xl text-white ">
      <div className="mb-6 font-Righteous text-2xl flex justify-between items-center text-white">
        Chat
        <TextSolidFilter className="w-6 h-5 invert opacity-20" />
      </div>
      
      {/* Navigation Section */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setIsNavigationExpanded(!isNavigationExpanded)}
        >
          <h3 className="font-medium">Jabber</h3>
          <span>{isNavigationExpanded ? '▼' : '►'}</span>
        </div>
        
        {isNavigationExpanded && (
          <div className="pl-2">
            {navigationItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center p-2 cursor-pointer rounded hover:bg-[#0a6ab8] ${activeItemId === item.id ? 'bg-[#0a6ab8]' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* User Settings Section */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 cursor-pointer"
          onClick={() => setIsUserSettingsExpanded(!isUserSettingsExpanded)}
        >
          <h3 className="font-medium">Jabber</h3>
          <span>{isUserSettingsExpanded ? '▼' : '►'}</span>
        </div>
        
        {isUserSettingsExpanded && (
          <div className="pl-2">
            {settingsItems.map(item => (
              <div 
                key={item.id} 
                className={`flex items-center p-2 cursor-pointer rounded hover:bg-[#0a6ab8] ${activeItemId === item.id ? 'bg-[#0a6ab8]' : ''}`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SideBar: React.FC = () => {
  // State for active item
  const [activeItem, setActiveItem] = useState('item1');
  const [isClient, setIsClient] = useState(false);
  
  // Effect to check if we're on the client side
  useEffect(() => {
    setIsClient(true);
    
    // If needed, you can still use URL params on the client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlActiveItem = urlParams.get('activeItem');
      if (urlActiveItem) {
        setActiveItem(urlActiveItem);
      }
    }
  }, []);

  const items: SidebarItemProps[] = [
    { id: 'item1', label: 'User' },
    { id: 'item2', label: 'User' },
    { id: 'item3', label: 'User' },
    { id: 'item4', label: 'User' },
  ];
  
  const handleItemClick = (id: string) => {
    setActiveItem(id);
    
    // Update URL only on client side
    if (typeof window !== 'undefined') {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('activeItem', id);
      window.history.pushState({}, '', newUrl);
    }
  };
  
  const handleButtonClick = () => {
    // Only execute on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const actionParam = urlParams.get('action') === 'open' ? 'close' : 'open';
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('action', actionParam);
      window.history.pushState({}, '', newUrl);
    }
  };
  
  return (
    <div className="flex">
      <Sidebar 
        items={items} 
        activeItemId={activeItem}
        onItemClick={handleItemClick}
        onButtonClick={handleButtonClick}
      />
    </div>
  );
};

export default SideBar;