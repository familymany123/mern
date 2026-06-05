import { FaRegClock, FaRegHeart, FaRegStar } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const ProductSale = () => {
  return (
    <div className='d-flex align-items-center list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm'>
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
          <img alt='#' src='img/sales1.png' className='img-fluid item-img w-100' />
        </Link>
      </div>
      <div className='p-3 position-relative'>
        <div className='list-card-body'>
          <h6 className='mb-1'>
            <Link to='restaurant' className='text-black'>
              The osahan Restaurant
            </Link>
          </h6>
          <p className='text-gray mb-3'>North • Hamburgers • Pure veg</p>
          <p className='text-gray mb-3 time'>
            <span className='bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2'>
              <FaRegClock className='feather-clock' /> 15–25 min
            </span>
            <span className='float-right text-black-50'> $500 FOR TWO</span>
          </p>
        </div>
        <div className='list-card-badge'>
          <span className='badge badge-danger'>OFFER</span> <small>65% OSAHAN50</small>
        </div>
      </div>
    </div>
  )
}

export default ProductSale
