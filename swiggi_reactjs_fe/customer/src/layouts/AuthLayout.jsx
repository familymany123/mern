import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className='osahan-signup login-page'>
      <video loop autoPlay muted id='vid'>
        <source src='img/bg.mp4' type='video/mp4' />
        <source src='img/bg.mp4' type='video/ogg' />
        Your browser does not support the video tag.
      </video>
      <div className='d-flex align-items-center justify-content-center flex-column vh-100'>
        <div className='px-5 col-md-6 ml-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
