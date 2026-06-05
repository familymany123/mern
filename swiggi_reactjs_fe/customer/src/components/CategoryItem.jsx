import { Link } from "react-router-dom";

const CategoryItem = ({ category }) => {
  return (
    <div className="cat-item px-1 py-3">
      <Link
        className="bg-white rounded d-block p-2 text-center shadow-sm"
        to={`/category/${category?._id}`}
      >
        <img
          alt="#"
          src={category?.image}
          className="  mb-2"
          style={{
            objectFit: "cover",
            height: "100px",
            width: "100%",
            borderRadius: "6px",
          }}
        />
        <p className="m-0 small">{category?.name}</p>
      </Link>
    </div>
  );
};

export default CategoryItem;
