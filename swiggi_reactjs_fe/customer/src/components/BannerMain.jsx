import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Slider from "react-slick";
import { fetchBanners } from "../features/banner/bannerSlice";
import SliderItem from "./SliderItem";

const BannerMain = () => {
  const settingOther = {
    slidesToShow: 2,
slidesToScroll: 1,
autoplay: true,
autoplaySpeed: 3000,
infinite: true,
dots: true,
speed: 300,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: true,
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
          slidesToShow: 2,
        },
      },
    ],
  };
  const dispatch = useDispatch();

  const { banners } = useSelector((state) => state.banners);
  useEffect(() => {
    dispatch(fetchBanners(1, 10));
  }, [dispatch]);
  console.log(banners);
  return (
    <div className="bg-white">
      <div className="container">
        <div className="offer-slider">
          <Slider {...settingOther}>
            {banners.map((b, index) => {
              return <SliderItem key={index} banner={b} />;
            })}
           
          </Slider>
        </div>
      </div>
    </div>
  );
};

export default BannerMain;
