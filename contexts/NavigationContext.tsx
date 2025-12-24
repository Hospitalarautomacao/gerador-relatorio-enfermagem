
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SectionId, AssessmentSubSectionId } from '../types';

interface NavigationContextType {
  activeSection: SectionId;
  setActiveSection: (section: SectionId) => void;
  activeSubSection: AssessmentSubSectionId;
  setActiveSubSection: (subSection: AssessmentSubSectionId) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('identification');
  const [activeSubSection, setActiveSubSection] = useState<AssessmentSubSectionId>('general');

  return (
    <NavigationContext.Provider 
      value={{ 
        activeSection, 
        setActiveSection,
        activeSubSection,
        setActiveSubSection
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
