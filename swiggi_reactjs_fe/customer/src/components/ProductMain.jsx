import React, { useEffect } from "react";
import { FiChevronsRight } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import { fetchFoods } from "../features/foods/foodSlice";
import ProductItem from "./ProductItem";
const ProductMain = () => {
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
  const dispatch = useDispatch();
  const { foods } = useSelector((state) => state.foods);
  useEffect(() => {
    dispatch(fetchFoods(1, 10));
  }, [dispatch]);

  return (
    <>
      <div className="pt-4 pb-2 title d-flex align-items-center">
        <h5 className="m-0">Xu hướng của tuần</h5>
        <Link className="font-weight-bold ml-auto" to="trending">
          Xem tất cả
          <FiChevronsRight />
        </Link>
      </div>

      <div className="trending-slider">
        <Slider {...settingTrendding}>
        
          {foods.map((f,i) => (
            <ProductItem key={i} food={f}/>
          ))}
        </Slider>
      </div>
    </>
  );
};

export default ProductMain;
