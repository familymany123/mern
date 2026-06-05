import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { useContext, useEffect, useMemo, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import ProductItem from "../../components/ProductItem";
import { SidebarContext } from "../../context/SidebarContext";
import { fetchFoods } from "../../features/foods/foodSlice";
import { formatMoney } from "../../utils/formatMoney";

const minPrice = 0;
const maxPrice = 2000000;

const MostPopular = () => {
  const dispatch = useDispatch();
  const { toggleSidebar } = useContext(SidebarContext);
  const { foods, status } = useSelector((state) => state.foods);

  const [sortType, setSortType] = useState("sold");
  const [priceRange, setPriceRange] = useState([minPrice, maxPrice]);
  const [isPriceChanged, setIsPriceChanged] = useState(false);

  useEffect(() => {
    dispatch(fetchFoods({ page: 1, limit: "all", sort: "sold" }));
  }, [dispatch]);

  const filteredFoods = useMemo(() => {
    let result = [...foods];

    if (isPriceChanged) {
      result = result.filter(
        (food) =>
          Number(food.price) >= Number(priceRange[0]) &&
          Number(food.price) <= Number(priceRange[1])
      );
    }

    result.sort((a, b) => {
      if (sortType === "highToLow") return Number(b.price) - Number(a.price);
      if (sortType === "lowToHigh") return Number(a.price) - Number(b.price);
      if (sortType === "nameAtoZ") return a.name.localeCompare(b.name);
      if (sortType === "nameZtoA") return b.name.localeCompare(a.name);
      return Number(b.sold || 0) - Number(a.sold || 0);
    });

    return result;
  }, [foods, isPriceChanged, priceRange, sortType]);

  const resetFilter = () => {
    setSortType("sold");
    setPriceRange([minPrice, maxPrice]);
    setIsPriceChanged(false);
  };

  return (
    <>
      <div className="d-none">
        <div className="bg-primary border-bottom p-3 d-flex align-items-center justify-content-between">
          <h4 className="font-weight-bold m-0 text-white">Món bán chạy</h4>
          <div onClick={toggleSidebar}>
            <FaBars size={24} color="white" />
          </div>
        </div>
      </div>

      <div className="osahan-trending">
        <div className="container">
          <div className="most_popular py-5">
            <div className="d-flex align-items-center mb-4">
              <h3 className="font-weight-bold text-dark mb-0">Món bán chạy</h3>
              <a
                href="#"
                data-toggle="modal"
                data-target="#popularFilters"
                className="ml-auto btn btn-primary"
              >
                Lọc
              </a>
            </div>

            {status === "loading" && <p>Đang tải món ăn...</p>}

            <div className="row">
              {filteredFoods.map((food) => (
                <div className="col-12 col-sm-6 col-md-3 mt-3" key={food._id}>
                  <ProductItem food={food} />
                </div>
              ))}
            </div>

            {status !== "loading" && filteredFoods.length === 0 && (
              <p className="text-muted mt-3">Không có món phù hợp.</p>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="popularFilters"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="popularFiltersLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="popularFiltersLabel">
                Lọc món bán chạy
              </h5>
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

                  {[
                    ["sold", "Bán chạy nhất"],
                    ["highToLow", "Giá cao đến thấp"],
                    ["lowToHigh", "Giá thấp đến cao"],
                    ["nameAtoZ", "Tên từ A-Z"],
                    ["nameZtoA", "Tên từ Z-A"],
                  ].map(([value, label]) => (
                    <div className="custom-control border-bottom px-0 custom-radio" key={value}>
                      <input
                        type="radio"
                        id={`popular-${value}`}
                        name="popularSort"
                        value={value}
                        checked={sortType === value}
                        className="custom-control-input"
                        onChange={(event) => setSortType(event.target.value)}
                      />
                      <label
                        className="custom-control-label py-3 w-100 px-3"
                        htmlFor={`popular-${value}`}
                      >
                        {label}
                      </label>
                    </div>
                  ))}

                  <div className="p-3 bg-light border-bottom">
                    <h6 className="m-0">Khoảng giá</h6>
                  </div>
                  <div className="px-3 py-3">
                    <Slider
                      range
                      min={minPrice}
                      max={maxPrice}
                      step={50000}
                      value={priceRange}
                      onChange={(range) => {
                        setPriceRange(range);
                        setIsPriceChanged(true);
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

export default MostPopular;
