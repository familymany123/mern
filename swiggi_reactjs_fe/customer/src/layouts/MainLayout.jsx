import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import Navbar from '../components/Navbar'

const MainLayout = () => {
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
