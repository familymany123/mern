import { createContext, useCallback, useEffect, useState } from 'react';

export const SidebarContext = createContext();

// eslint-disable-next-line react/prop-types
export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);

  const setSidebarDomState = useCallback((isOpen) => {
    const htmlElement = document.documentElement;
    const bodyElement = document.body;

    bodyElement.classList.toggle("hc-nav-open", isOpen);
    htmlElement.classList.toggle("hc-nav-yscroll", isOpen);
  }, []);

  const openSidebar = useCallback(() => {
    setIsActive(true);
    setSidebarDomState(true);
  }, [setSidebarDomState]);

  const closeSidebar = useCallback(() => {
    setIsActive(false);
    setSidebarDomState(false);
  }, [setSidebarDomState]);

  const toggleSidebar = useCallback(() => {
    setIsActive((current) => {
      const next = !current;
      setSidebarDomState(next);
      return next;
    });
  }, [setSidebarDomState]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      setSidebarDomState(false);
    };
  }, [closeSidebar, setSidebarDomState]);

  return (
    <SidebarContext.Provider value={{ isActive, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
