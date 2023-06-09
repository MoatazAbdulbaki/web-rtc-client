import React, { useState } from "react";

interface PopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({ children, content }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handlePopoverOpen = () => {
    setIsPopoverOpen(true);
  };

  const handlePopoverClose = () => {
    setIsPopoverOpen(false);
  };

  return (
    <div className="relative inline-block">
      <div
        className="inline-block cursor-pointer"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {children}
      </div>
      {isPopoverOpen && (
        <div className="absolute z-10 mt-2 px-2 bg-gray-300 rounded top-[-30px] text-sm w-fit whitespace-nowrap">
          {content} 
        </div>
      )}
    </div>
  );
};

export default Popover;
