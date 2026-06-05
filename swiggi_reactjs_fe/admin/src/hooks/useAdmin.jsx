import { createContext, useState } from "react";
import { useDispatch } from "react-redux";
import baseApi from "../api/baseApi";
import { logOut as clearAuth, setCredentials } from "../features/auth/authSlice";

const AuthContext = createContext();
export { AuthContext };
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const dispatch = useDispatch();
  const loginAction = async (payload) => {
    try {
      const response = await baseApi.post("/login", payload);
      console.log(response.data);
      if (response.data.accessToken) {
        const { data } = await baseApi.get("/users/profile", {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`,
          },
        });
        if (data.role !== "admin") {
          throw "You are not authorized to access this page";
        }

        setUser(data);
        setToken(response.data.accessToken);
        window.location.replace("/");
        // navigate(0)

        dispatch(setCredentials({ ...response.data, user: data }));
      }
    } catch (error) {
      throw new Error("Bạn không có quyền truy cập trang này");
    }
  };

  const logOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    dispatch(clearAuth());
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
