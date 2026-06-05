import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";
import ProductItem from "./ProductItem";
import { SidebarContext } from "../context/SidebarContext";
import { fetchFoods } from "../features/foods/foodSlice";

const FoodCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dữ liệu từ API
    useEffect(() => {
        const fetchCategories = async () => {
        try {
            const response = await fetch("http://127.0.0.1:3001/list_category");
            if (!response.ok) {
            throw new Error("Failed to fetch categories");
            }
            const data = await response.json();
            setCategories(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
        };

        fetchCategories();
    }, []);

    // Render Component
    return (
        <>
            <div className="osahan-popular mb-4 mt-4">
                {loading && (
                <div className="text-center">
                    <LoadingSpinner />
                </div>
                )}
                {error && <p className="text-danger text-center">{error}</p>}
                {!loading &&
                !error &&
                categories.map((category) => (
                    <div key={category._id} className="mb-4">
                    {/* Hiển thị tiêu đề của chuyên mục */}
                    <h5 className="mb-3">{category.name}</h5>
                    <div className="row">
                        {/* Hiển thị danh sách món ăn thuộc chuyên mục */}
                        {category.foods.map((food) => (
                        <div className="col-md-4" key={food._id}>
                            <ProductItem food={food} />
                        </div>
                        ))}
                    </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default FoodCategory;
