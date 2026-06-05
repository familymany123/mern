import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { ConfirmDeleteModal } from "../../components";
import {
  addToppingToFood,
  fetchFoodById,
  fetchFoodToppings,
  removeToppingFromFood,
} from "../../features/foods/foodSlice";
import { fetchToppings } from "../../features/topping/toppingSlice";

const FoodTopping = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  let foodId = location.state.foodId;

  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toppingsToShow, setToppingsToShow] = useState(10); // Initial number of toppings to show

  const { food, status, error, foodToppings, isUpdated } = useSelector(
    (state) => state.foods
  );
  const { toppings, currentPage } = useSelector((state) => state.toppings);
  useEffect(() => {
    dispatch(fetchFoodById(foodId));
  }, [dispatch, foodId]);
  useEffect(() => {
    dispatch(fetchToppings({ page: currentPage, limit: 1000 }));
  }, [dispatch, currentPage]);

  useEffect(() => {
    dispatch(fetchFoodToppings(foodId));
  }, [foodId, isUpdated]);

  const handleSearchChange = (e) => {
    // tìm kiếm topping
     setSearchQuery(e.target.value);    

  };

  const handleAddTopping = (toppingId) => {
    dispatch(addToppingToFood({ foodId: foodId, toppingId }));
  };
  const handleShowDeleteModal = (foodId) => {
    console.log(foodId);
    setFoodToDelete(foodId);
    setShowDeleteModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setShowDeleteModal(false);
    setFormData({});
  };
  const handleConfirmDelete = () => {
    console.log(foodToDelete);
    dispatch(removeToppingFromFood(foodToDelete));
    setShowDeleteModal(false);
  };
  
  
  const filterToppingg = toppings.filter((topping) =>
    topping.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  return (
    <div className="container-fluid pt-2">
      <div className="row">
        <div className="col-md-3"  >
          <div className="card card-primary card-outline">
            {/* danh sasch topping  */}
            <div className="card-header">
              <h3 className="card-title">Topping</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tìm kiếm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <div className="input-group-append">
                  <button type="submit" className="btn btn-primary">
                    <i className="fas fa-search" />
                  </button>
                </div>
              </div>
              <ul className="list-group mt-2" >
                {filterToppingg.map((topping) => (
                  <li
                    key={topping?._id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {topping?.name}
                    {/* kiểm tra topping đã được thêm hay chưa nếu chưa thì không cho thêm */}
                    {foodToppings.find(
                      (tp) => tp?.topping?._id === topping?._id
                    ) ? (
                      <span className="badge bg-success rounded-pill">
                        Đã thêm
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm rounded-pill"
                        onClick={() => handleAddTopping(topping?._id)}
                      >
                        Thêm
                      </button>
                    )}
                  </li>
                ))}
              </ul>
               
            </div>
          </div>
        </div>
        <div className="col-md-9">
          <div className="card card-primary card-outline">
            {/* thông tin food */}
            <div className="card-header">
              <h3 className="card-title">Thực phẩm</h3>
              <div className="card-tools">
                <button
                  type="button"
                  className="btn btn-tool"
                  data-card-widget="collapse"
                >
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <img
                    src={food?.image || ""}
                    alt={food?.name}
                    className="img-fluid"
                  />
                </div>
                <div className="col-md-8">
                  <h2>{food?.name}</h2>
                  <p>{food?.description}</p>
                  <p>Giá: {food?.price}</p>
                  <p>Loại: {food?.category?.name}</p>
                  <p>Topping: {food?.topping?.name}</p>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-12">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Tên</th>
                        <th>Giá</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {foodToppings?.map((tp, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{tp?.topping?.name}</td>
                          <td>{tp?.topping?.price}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleShowDeleteModal(tp?._id)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        itemName={"Foods"}
      />
    </div>
  );
};

export default FoodTopping;
