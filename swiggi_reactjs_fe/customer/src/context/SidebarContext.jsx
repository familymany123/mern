import { createContext, useState } from 'react';

export const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);

  const toggleSidebar = () => {
    setIsActive(!isActive);
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const nav = document.querySelector(".hc-offcanvas-nav");
    const navParent = document.querySelector(".nav-parent");
    const navContainer = document.querySelector(".nav-container");
    const navWrapper = document.querySelector(".nav-wrapper");
     
    bodyElement.classList.toggle("hc-nav-open");
    htmlElement.classList.toggle("hc-nav-yscroll");
    nav.style.visibility = "visible";
    nav.classList.toggle("nav-open");
    navParent.classList.remove("level-open");
    navWrapper.classList.remove("sub-level-open");
    // remove style attribute from navContainer
    navContainer.removeAttribute("style");

  };

  return (
    <SidebarContext.Provider value={{ isActive, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};