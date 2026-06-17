import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className='osahan-signup login-page'>
      <div className='fast-food-motion' aria-hidden='true'>
        <div className='motion-glow motion-glow-one'></div>
        <div className='motion-glow motion-glow-two'></div>
        <div className='speed-line speed-line-one'></div>
        <div className='speed-line speed-line-two'></div>
        <div className='sauce-drop sauce-drop-one'></div>
        <div className='sauce-drop sauce-drop-two'></div>
        <div className='food-stage'>
          <div className='fries-pack'>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <div className='fries-box'></div>
          </div>
          <div className='burger-stack'>
            <div className='burger-bun burger-bun-top'>
              <i></i>
              <i></i>
              <i></i>
            </div>
            <div className='burger-lettuce'></div>
            <div className='burger-cheese'></div>
            <div className='burger-patty'></div>
            <div className='burger-bun burger-bun-bottom'></div>
          </div>
          <div className='drink-cup'>
            <div className='drink-lid'></div>
            <div className='drink-straw'></div>
            <div className='drink-body'></div>
          </div>
        </div>
      </div>
      <div className='d-flex align-items-center justify-content-center flex-column vh-100'>
        <div className='px-5 col-md-6 ml-auto'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
