'use client';

import * as React from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
