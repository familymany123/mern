import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaChevronDown, FaMapMarkerAlt, FaRegStar } from "react-icons/fa";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import Slider from "react-slick";
import baseApi from "../../api/baseApi";
import { addItemToCart } from "../../features/cart/cartSlice";
import { fetchDetailsFoods } from "../../features/foods/foodSlice";
import { fetchRatings, submitRating } from "../../features/rating/ratingSlice";
import { formatMoney } from "../../utils/formatMoney";

const Foods = () => {
  const param = useParams();
  const dispatch = useDispatch();
  const [foodToppings, setFoodToppings] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [onChange, setOnChange] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const { food } = useSelector((state) => state.foods);
  const { ratings, avgStar } = useSelector((state) => state.rating);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  useEffect(() => {
    dispatch(fetchDetailsFoods(param.id));
  }, [dispatch, param]);

  useEffect(() => {
    if (param.id) {
      dispatch(fetchRatings(param.id));
    }
  }, [param.id, dispatch]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await baseApi.get(`/foods/topping/${param.id}`);
        setFoodToppings(response.data);
        console.log(response.data);
      } catch (error) {
        setFoodToppings([]);
        console.log(error);
      }
    }
    fetchData();
  }, [param.id]);

  useEffect(() => {
    if (onChange) {
      dispatch(fetchRatings(param.id));
    }
  }, [dispatch, onChange, param.id]);

  const handleSelectItem = (item) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };
  const handleQuantityChange = (e) => {
    setQuantity(Number(e.target.value));
  };

  const calculateTotalPrice = () => {
    const foodPrice = food?.price || 0;
    const toppingsPrice = selectedItems.reduce(
      (total, item) => total + (item?.topping?.price || 0),
      0
    );
    return (foodPrice + toppingsPrice) * quantity;
  };
  const handleRatingSubmit = async () => {
    const isLoggedIn = localStorage.getItem("accessToken");
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để đánh giá");
      return;
    }

    // check if rating is empty
    if (!rating) {
      toast.error("Vui lòng chọn số sao");
      return;
    }
    if (!comment) {
      toast.error("Vui lòng nhập bình luận");
      return;
    }

    try {
      await dispatch(
        submitRating({ foodId: param.id, star: rating, content: comment })
      ).unwrap();
    } catch (error) {
      console.log(error);
    } finally {
      setOnChange(!onChange);
      setRating(0);
      setComment("");
    }
  };
  const handleAddToCart = () => {
    //  kiểm tra xem người dùng đã đăng nhập chưa
    if (!localStorage.getItem("accessToken")) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    dispatch(
      addItemToCart({
        food,
        toppings: selectedItems.map((item) => item.topping),
        quantity,
      })
    );
  };
  const settingTrendding = {
    slidesToShow: 3,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "40px",
          slidesToShow: 1,
        },
      },
    ],
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = ratings.slice(indexOfFirstReview, indexOfLastReview);

  const totalPages = Math.ceil(ratings.length / reviewsPerPage);

  return (
    <>
      <div className="d-none">
        <div className="bg-primary p-3 d-flex align-items-center">
          <a className="toggle togglew toggle-2" href="#">
            <span></span>
          </a>
          <h4 className="font-weight-bold m-0 text-white">{food?.name}</h4>
        </div>
      </div>
      <div className="offer-section py-4">
        <div className="container position-relative">
          <img alt="#" src={food?.image} className="restaurant-pic" />
          <div className="pt-3 text-white">
            <h2 className="font-weight-bold">{food?.name}</h2>
            <div className="d-inline-block h6 m-0">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaRegStar
                  key={star}
                  className={`feather-star ${
                    star <= avgStar ? "text-warning" : ""
                  }`}
                />
              ))}
              {avgStar > 0 ? (
                <span className="text-warning ml-2">
                  {" "}
                  {ratings.length} đánh giá
                </span>
              ) : (
                <span className="text-white ml-2">Chưa có đánh giá</span>
              )}
            </div>
          </div>
          <div className="pb-4">
            <div className="row">
              <div className="col-6 col-md-2">
                <p className="text-white-50 font-weight-bold m-0 small">Loại</p>
                <p className="text-white m-0">{food?.type}</p>
              </div>
              <div className="col-6 col-md-2">
                <p className="text-white-50 font-weight-bold m-0 small">
                  Thời gian làm
                </p>
                <p className="text-white m-0">{food?.cooking_time}</p>
              </div>
            </div>
          </div>
          <div className="pb-4">
            <div className="row">
              <div className="col-6 col-md-2">
                <p
                  className="text-white-50 font-weight-bold m-0 "
                  style={{
                    fontSize: "20px",
                  }}
                >
                  Giá tiền
                </p>
                <p
                  className="text-white m-0"
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {formatMoney(food?.price)}
                </p>
              </div>
              <div className="col-6 col-md-2">
                <p className="text-white-50 font-weight-bold m-0 small">
                  Số lượng đã bán
                </p>
                <p className="text-white m-0">{food?.sold}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="p-3 bg-primary mt-n3 rounded position-relative">
          <div className="d-flex align-items-center">
            <div className="feather_icon">
              <a
                href="#ratings-and-reviews"
                className="text-decoration-none text-dark"
              >
                <i className="p-2 bg-light rounded-circle">
                  <MdOutlineDriveFolderUpload />
                </i>
              </a>
              <a
                href="#ratings-and-reviews"
                className="text-decoration-none text-dark mx-2"
              >
                <i className="p-2 bg-light rounded-circle">
                  <FaRegStar />
                </i>
              </a>
              <a
                href="#ratings-and-reviews"
                className="text-decoration-none text-dark"
              >
                <i className="p-2 bg-light rounded-circle">
                  <FaMapMarkerAlt />
                </i>
              </a>
            </div>
            <Link to="/contact" className="btn btn-sm btn-outline-light ml-auto">
              Liên hệ
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="">
          <p className="font-weight-bold pt-4 m-0">TOPPING</p>
          <div className="trending-slider rounded">
            <Slider {...settingTrendding}>
              {foodToppings &&
                foodToppings.map((item, index) => (
                  <div
                    key={index}
                    className={`osahan-slider-item  ${
                      selectedItems.includes(item) ? "selected-food" : ""
                    }`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="list-card bg-white h-100 rounded overflow-hidden position-relative shadow-sm">
                      <div className="p-3 position-relative">
                        <div className="list-card-body">
                          <h6 className="mb-1">
                            <span className="text-black">
                              {item?.topping?.name}
                            </span>
                          </h6>
                          <p className="text-gray mb-3">{food?.type}</p>
                          <p className="text-gray m-0">
                            <span className="text-black-50">
                              {" "}
                              {formatMoney(item?.topping?.price)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </Slider>
          </div>
        </div>
      </div>

      <div className="order-details-section py-4">
        <div className="container">
          <div className="row">
            {/* Food Item Image and Details */}
            <div className="col-md-6">
              <div id="basicsAccordion">
                <div className="box border-bottom bg-white mb-2 rounded shadow-sm overflow-hidden">
                  <div id="basicsHeadingOne">
                    <h5 className="mb-0">
                      <button
                        className="shadow-none btn btn-block d-flex justify-content-between card-btn p-3 collapsed"
                        data-toggle="collapse"
                        data-target="#basicsCollapseOne"
                        aria-expanded="false"
                        aria-controls="basicsCollapseOne"
                      >
                        Mô tả sản phẩm
                        <span className="card-btn-arrow">
                          <FaChevronDown />
                        </span>
                      </button>
                    </h5>
                  </div>
                  <div
                    id="basicsCollapseOne"
                    className="collapse show"
                    aria-labelledby="basicsHeadingOne"
                    data-parent="#basicsAccordion"
                  >
                    <div className="card-body border-top p-3 text-muted">
                      {food?.description}
                    </div>
                  </div>
                </div>
              </div>
              <div
                id="ratings-and-reviews"
                className="bg-white shadow-sm d-flex align-items-center rounded p-3 mb-3 clearfix restaurant-detailed-star-rating"
              >
                <h6 className="mb-0"> Đánh giá trung bình</h6>
                <div className="star-rating ml-auto">
                  <div className="d-inline-block h6 m-0">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaRegStar
                        key={star}
                        className={`feather-star ${
                          star <= avgStar ? "text-warning" : ""
                        }`}
                      />
                    ))}
                  </div>
                  <b className="text-black ml-2"> {avgStar}</b>
                </div>
              </div>
              <div className="bg-white p-3 mb-3 restaurant-detailed-ratings-and-reviews shadow-sm rounded">
                <a className="text-primary float-right" href="#">
                  Đánh giá cao nhất
                </a>
                <h6 className="mb-1"> Đánh giá và bình luận</h6>
                {currentReviews &&
                  currentReviews.map((rating, index) => (
                    <>
                      <div className="reviews-members py-3" key={index}>
                        <div className="media">
                          <div className="media-body">
                            <div className="reviews-members-header">
                              <div className="star-rating float-right">
                                <div
                                  className="d-inline-block"
                                  style={{ fontSize: "16px" }}
                                >
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FaRegStar
                                      key={star}
                                      className={`feather-star ${
                                        star <= rating.star
                                          ? "text-warning"
                                          : ""
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <h6 className="mb-0">
                                <a className="text-dark" href="#">
                                  {rating?.user?.fullname}
                                </a>
                              </h6>
                              <p className="text-muted small">
                                {new Date(
                                  rating.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="reviews-members-body">
                              <p>{rating.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <hr />
                    </>
                  ))}
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`btn ${
                        currentPage === index + 1 ? "btn-primary" : "btn-light"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white p-3 rating-review-select-page rounded shadow-sm">
                <h6 className="mb-3"> Đánh giá sản phẩm</h6>
                <div className="d-flex align-items-center mb-3">
                  <p className="m-0 small"> Chọn số sao</p>
                  <div className="star-rating ml-auto">
                    <div className="d-inline-block">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaRegStar
                          key={star}
                          className={`feather-star ${
                            star <= rating ? "text-warning" : ""
                          }`}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <form>
                  <div className="form-group">
                    <label className="form-label small">
                      Nhập đánh giá của bạn
                    </label>
                    <textarea
                      className="form-control"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group mb-0">
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={handleRatingSubmit}
                    >
                      Gửi đánh giá
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Information */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h4 className="m-0">Chi tiết đơn hàng</h4>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <p className="font-weight-bold">Số lượng:</p>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      onChange={handleQuantityChange}
                      min="1"
                    />
                  </div>
                  <div className="mb-3">
                    <p className="font-weight-bold">Giá tiền:</p>
                    <p className="text-success font-weight-bold">
                      {formatMoney(food?.price)}
                    </p>
                  </div>
                  <div className="mb-3">
                    <p className="font-weight-bold">Tổng cộng:</p>
                    <p className="text-danger font-weight-bold">
                      {formatMoney(calculateTotalPrice())}
                    </p>
                  </div>
                  <button
                    className="btn btn-success btn-block btn-lg"
                    onClick={handleAddToCart}
                  >
                    Thêm giỏ hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Foods;
