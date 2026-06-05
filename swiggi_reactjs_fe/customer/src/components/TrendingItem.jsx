import { FaRegHeart, FaRegStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const TrendingItem = () => {
  return (
    <div className='list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm'>
      <div className='list-card-image'>
        <div className='star position-absolute'>
          <span
            className='badge badge-success'
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: '5px'
            }}
          >
            <FaRegStar className='feather-star' />
            3.1 (300+)
          </span>
        </div>
        <div className='favourite-heart text-danger position-absolute'>
          <Link to='#'>
            <FaRegHeart className='feather-heart' />
          </Link>
        </div>
        <div className='member-plan position-absolute'>
          <span className='badge badge-dark'>Promoted</span>
        </div>
        <Link to='restaurant'>
          <img alt='#' src='img/popular6.png' className='img-fluid item-img w-100' />
        </Link>
      </div>
      <div className='p-3 position-relative'>
        <div className='list-card-body'>
          <h6 className='mb-1'>
            <Link to='restaurant' className='text-black'>
              Thai Famous Indian Cuisine
            </Link>
          </h6>
          <p className='text-gray mb-1 small'>• Indian • Pure veg</p>
          <p className='text-gray mb-1 rating'></p>
          <ul className='rating-stars list-unstyled'>
            <li>
              <FaRegStar className='feather-star star_active' />
              <FaRegStar className='feather-star star_active' />
              <FaRegStar className='feather-star star_active' />
              <FaRegStar className='feather-star star_active' />
              <FaRegStar className='feather-star  ' />
            </li>
          </ul>
          <p></p>
        </div>
        <div className='list-card-badge'>
          <span className='badge badge-success'>OFFER</span> <small>65% off</small>
        </div>
      </div>
    </div>
  )
}

export default TrendingItem
