import { Link } from "react-router-dom";

const SliderItem = ({ banner }) => {
  return (
    <div className="px-2 py-3">
      <Link className="d-block text-center shadow-sm rounded overflow-hidden">
        <img
          alt="banner"
          src={banner?.image}
          className="img-fluid w-100"
          style={{
            height: "260px",
            objectFit: "cover",
            borderRadius: "12px",
          }}
        />
      </Link>
    </div>
  );
};

export default SliderItem;