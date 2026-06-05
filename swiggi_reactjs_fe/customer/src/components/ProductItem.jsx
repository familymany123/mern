import { FaRegClock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/formatMoney";

const ProductItem = ({ food }) => {
  return (
    <div className="osahan-slider-item">
      <div className="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm">
        <div className="list-card-image">
          <Link to={`/foods/${food._id}`}>
            <img
              alt="#"
              src={food?.image || "img/trending3.png"}
              className="img-fluid item-img w-100 "
              style={{
                height: "200px",
                objectFit: "cover",
              }}
            />
          </Link>
        </div>
        <div className="p-3 position-relative">
          <div className="list-card-body">
            <h6 className="mb-1">
              <Link to={`/foods/${food._id}`} className="text-black">
                {food?.name}
              </Link>
            </h6>

            <p className="text-gray mb-3 time d-flex justify-content-between algin-items-center">
              <span
                className="bg-light text-dark rounded-sm pl-2 pb-1 pt-1 pr-2 d-flex   justify-content-start align-items-center"
                style={{ gap: "5px" }}
              >
                <FaRegClock className="feather-clock mr-1" size={16} />
                <span>{food?.cooking_time} </span>
              </span>
              <span className="float-right text-black-50 ">
                {" "}
                {formatMoney(food?.price)}
              </span>
            </p>
          </div>
          <div className="list-card-badge">
            <small>{food?.category?.name}</small>
          </div>
          <p>Đã bán {food?.sold}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
