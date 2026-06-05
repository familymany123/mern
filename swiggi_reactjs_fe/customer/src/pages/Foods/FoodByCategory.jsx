import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Fragment, useContext, useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProductItem from "../../components/ProductItem";
import { SidebarContext } from "../../context/SidebarContext";
import {
  fetchCategoryById,
  fetchFoodByCategory,
} from "../../features/category/categorySlice";
import { formatMoney } from "../../utils/formatMoney";

const maxPrice = 2000000;
const minPrice = 0;
const FoodByCategory = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { toggleSidebar } = useContext(SidebarContext);

  const {
    foodByCategory,
    category,
    status,
    currentPage,
    totalPages,
    prev,
    next,
  } = useSelector((state) => state.category);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [fiterChange, setFilterChange] = useState(false);

  const [priceFilter, setPriceFilter] = useState("none");
  const [filteredFoods, setFilteredFoods] = useState([]);

  const handlePriceFilterChange = (event) => {
    setPriceFilter(event.target.value);
  };

  const handlePriceRangeChange = (range) => {
    setPriceRange(range);
    setFilterChange(true);
  };
  const applyFilter = () => {
    let filtered = [...foodByCategory];
    if (fiterChange) {
      filtered = filtered.filter(
        (f) =>
          Number(f.price) >= Number(priceRange[0]) &&
          Number(f.price) <= Number(priceRange[1])
      );
    }
    if (filtered.length === 0) {
      setFilteredFoods([]);
      return;
    }

    filtered = filtered.sort((a, b) => {
      if (priceFilter === "highToLow") {
        return b.price - a.price;
      } else if (priceFilter === "lowToHigh") {
        return a.price - b.price;
      } else if (priceFilter === "nameAtoZ") {
        return a.name.localeCompare(b.name);
      } else if (priceFilter === "nameZtoA") {
        return b.name.localeCompare(a.name);
      } else if (priceFilter === "sold") {
        return b.sold - a.sold;
      }
      return 0;
    });
    setFilterChange(false);
    setFilteredFoods(filtered);
  };
  const resetFilter = () => {
    setPriceRange([minPrice, maxPrice]);
    setPriceFilter("none");
    setFilteredFoods(foodByCategory);
  };

  useEffect(() => {
    dispatch(fetchFoodByCategory({ id, page, limit }));
  }, [dispatch, id, page]);

  useEffect(() => {
    dispatch(fetchCategoryById({ id }));
  }, [dispatch, id]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  useEffect(() => {
    if (foodByCategory.length > 0) {
      setFilteredFoods(foodByCategory);
    }
  }, [foodByCategory]);

  return (
    <>
      <div className="d-none">
        <div className="bg-primary border-bottom p-3 d-flex align-items-center justify-content-between">
          <h4 className="font-weight-bold m-0 text-white">Danh sách món ăn</h4>
          <div onClick={toggleSidebar}>
            <FaBars size={24} color="white" />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="py-5">
          <div className="d-flex align-items-center mb-4 justify-content-between">
            <h2>Danh sách món ăn của {category?.name}</h2>
            <a
              href="#"
              data-toggle="modal"
              data-target="#filters"
              className="ml-auto btn btn-primary"
            >
              Lọc
            </a>
          </div>
          <div className="row g-4 mb-4">
            {status === "loading" && (
              <div className="col-md-12 text-center">
                <LoadingSpinner />
              </div>
            )}
            {filteredFoods.map((food, index) => (
              <Fragment key={index}>
                <div className="col-md-3 mb-3" key={index}>
                  <ProductItem food={food} />
                </div>
              </Fragment>
            ))}
            {status === "succeeded" && filteredFoods.length === 0 && (
              <div
                className="col-md-12 text-center"
                style={{ fontSize: "20px" }}
              >
                <p>Không có món ăn</p>
              </div>
            )}
          </div>
          <div className="row mt-4">
            <div className="col-md-12">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${!prev ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!prev}
                    >
                      Prev
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      key={index}
                      className={`page-item ${
                        index + 1 === currentPage ? "active" : ""
                      }`}
                    >
                      <button
                        className="bg-primary page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${!next ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!next}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="filters"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Lọc</h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body p-0">
              <div className="osahan-filter">
                <div className="filter">
                  <div className="p-3 bg-light border-bottom">
                    <h6 className="m-0">Sắp xếp</h6>
                  </div>
                  <div className="custom-control border-bottom px-0 custom-radio">
                    <input
                      type="radio"
                      id="customRadio3f"
                      name="priceFilter"
                      value="highToLow"
                      className="custom-control-input"
                      onChange={handlePriceFilterChange}
                    />
                    <label
                      className="custom-control-label py-3 w-100 px-3"
                      htmlFor="customRadio3f"
                    >
                      Giá cao đến thấp
                    </label>
                  </div>
                  <div className="custom-control border-bottom px-0 custom-radio">
                    <input
                      type="radio"
                      id="customRadio4f"
                      name="priceFilter"
                      value="lowToHigh"
                      className="custom-control-input"
                      onChange={handlePriceFilterChange}
                    />
                    <label
                      className="custom-control-label py-3 w-100 px-3"
                      htmlFor="customRadio4f"
                    >
                      Giá thấp đến cao
                    </label>
                  </div>
                  {/* lọc theo tên từ a-z. z-a */}
                  <div className="custom-control border-bottom px-0 custom-radio">
                    <input
                      type="radio"
                      id="nameAtoZ"
                      name="priceFilter"
                      value="nameAtoZ"
                      className="custom-control-input"
                      onChange={handlePriceFilterChange}
                    />
                    <label
                      className="custom-control-label py-3 w-100 px-3"
                      htmlFor="nameAtoZ"
                    >
                      Tên từ a-z
                    </label>
                  </div>
                  <div className="custom-control border-bottom px-0 custom-radio">
                    <input
                      type="radio"
                      id="nameZtoA"
                      name="priceFilter"
                      value="nameZtoA"
                      className="custom-control-input"
                      onChange={handlePriceFilterChange}
                    />
                    <label
                      className="custom-control-label py-3 w-100 px-3"
                      htmlFor="nameZtoA"
                    >
                      Tên từ z-a
                    </label>
                  </div> 
                  <div className="custom-control border-bottom px-0 custom-radio">
                    <input
                      type="radio"
                      id="sold"
                      name="priceFilter"
                      value="sold"
                      className="custom-control-input"
                      onChange={handlePriceFilterChange}
                    />
                    <label
                      className="custom-control-label py-3 w-100 px-3"
                      htmlFor="sold"
                    >
                     Số lượng bán
                    </label>
                  </div>
                  <div className="p-3 bg-light border-bottom">
                    <h6 className="m-0">Khoảng giá</h6>
                  </div>
                  <div className="px-3 py-3">
                    <Slider
                      range
                      min={minPrice}
                      max={maxPrice}
                      step={50000}
                      onChange={handlePriceRangeChange}
                      value={priceRange}
                      style={{
                        margin: "10px 0",
                        padding: "5px 0",
                        width: "100%",
                      }}
                    />
                    <div className="d-flex justify-content-between mt-2">
                      <span>{formatMoney(priceRange[0])}</span>
                      <span>{formatMoney(priceRange[1])}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer p-0 border-0">
              <div className="col-4 m-0 p-0">
                <button
                  type="button"
                  className="btn border-top btn-lg btn-block"
                  data-dismiss="modal"
                >
                  Đóng
                </button>
              </div>
              <div className="col-4 m-0 p-0">
                <button
                  type="button"
                  className="btn btn-secondary btn-lg btn-block"
                  onClick={resetFilter}
                >
                  Đặt lại
                </button>
              </div>
              <div className="col-4 m-0 p-0">
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={applyFilter}
                  data-dismiss="modal"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FoodByCategory;
