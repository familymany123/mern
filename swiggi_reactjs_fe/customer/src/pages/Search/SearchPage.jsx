import   { useContext, useEffect, useMemo, useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProductItem from "../../components/ProductItem";
import { SidebarContext } from "../../context/SidebarContext";
import { fetchFoods } from "../../features/foods/foodSlice";

const CATEGORY_ORDER = [
  "combo-an-nhanh",
  "ga-ran",
  "burger",
  "mi-y",
  "mon-phu",
  "thuc-uong",
];

const getCategoryRank = (food) => {
  const slug = food?.category?.slug;
  const categoryIndex = CATEGORY_ORDER.indexOf(slug);

  return categoryIndex === -1 ? CATEGORY_ORDER.length : categoryIndex;
};

const SearchPage = () => {
  const { toggleSidebar } = useContext(SidebarContext);
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
   const foods = useSelector((state) => state.foods.foods);
  const searchStatus = useSelector((state) => state.foods.status);
  const {currentPage, totalPages, next, prev} = useSelector((state) => state.foods);
 
  useEffect(() => {
    dispatch(fetchFoods({ page: currentPage, limit: 100 }));
  }, [dispatch, currentPage]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };
 
  const handlePageChange = (page) => {
    dispatch(fetchFoods({ page, limit: 10 }));
  };
  const filterFoods = useMemo(() => {
    return foods
      .filter((food) =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((food, index) => ({ food, index }))
      .sort((a, b) => {
        const categoryDiff = getCategoryRank(a.food) - getCategoryRank(b.food);

        return categoryDiff || a.index - b.index;
      })
      .map(({ food }) => food);
  }, [foods, searchTerm]);
  return (
    <>
      <div className="d-none">
        <div className="bg-primary p-3 d-flex align-items-center justify-content-between">
          <h4 className="font-weight-bold m-0 text-white">Tìm kiếm</h4>
          <div onClick={toggleSidebar}>
            <FaBars size={24} color="white" />
          </div>
        </div>
      </div>
      <div className="osahan-popular">
        <div className="container">
          <div className="search py-5">
            <div className="input-group mb-4">
              <input
                type="text"
                className="form-control form-control-lg input_search border-right-0"
                id="inlineFormInputGroup"
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={handleInputChange}
              />
              <div className="input-group-prepend">
                <div className="btn input-group-text bg-white border_search border-left-0 text-primary">
                  <FaSearch />
                </div>
              </div>
            </div>

            <ul className="nav nav-tabs border-0" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <a
                  className="nav-link active"
                  id="home-tab"
                  data-toggle="tab"
                  href="#home"
                  role="tab"
                  aria-controls="home"
                  aria-selected="true"
                >
                  Tất cả
                </a>
              </li>
              {/* Thêm các tab khác nếu cần */}
            </ul>

            <div className="tab-content mt-2" id="myTabContent">
              <div
                className="tab-pane fade show active"
                id="home"
                role="tabpanel"
                aria-labelledby="home-tab"
              >
                <div className="row">
                  {searchStatus === "loading" && (
                    <div className="col-md-12 text-center">
                      <LoadingSpinner />
                    </div>
                  )}
                  {searchStatus === "succeeded" &&
                    filterFoods.map((food) => (
                      <div className="col-md-4" key={food._id}>
                        <ProductItem food={food} />
                      </div>
                    ))}
                  {searchStatus === "failed" && (
                    <p>Error occurred while fetching search results.</p>
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
                          className="page-link"
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
              {/* Thêm các tab content khác nếu cần */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPage;
