import { useContext, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Navbar from '../components/Navbar'
import { SidebarContext } from '../context/SidebarContext'

const MainLayout = () => {
  const location = useLocation()
  const { closeSidebar } = useContext(SidebarContext)

  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  return (
    <>
      <div className='fixed-bottom-bar'>
        <Header />
        <Outlet />
        <Footer />
        <Navbar />
      </div>
    </>
  )
}

export default MainLayout
