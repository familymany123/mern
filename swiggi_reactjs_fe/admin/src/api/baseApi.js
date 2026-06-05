import axios from "axios";
import toast from "react-hot-toast";
import { logOut, setToken } from "../features/auth/authSlice";
import { store } from "../store/store";
const API_BASE_URL = "http://localhost:3001";

const baseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/refresh_token`, {
      refreshToken,
    });
    const { accessToken } = response.data;

    // Update the store with the new access token
    store.dispatch(setToken({ accessToken }));

    return accessToken;
  } catch (error) {
    console.log(error);
    store.dispatch(logOut());
    throw error;
  }
};
// Add a request interceptor
baseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
baseApi.interceptors.response.use(
  (response) => {
    if (response.data.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  async (error) => {
    const status = error.response ? error.response.status : null;
    console.log(status);
    if (status === 401) {
      try {
        console.log("refreshing token");
        const newAccessToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return baseApi(error.config);
      } catch (refreshError) {
        store.dispatch(logOut());
      }
      return Promise.reject(error);
    }
    if (status == 403) {
      store.dispatch(logOut());
      window.location.replace("/login");
    } else if (status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return baseApi(error.config);
      } catch (refreshError) {
        store.dispatch(logOut());
      }
    } else if (status === 404) {
      // Handle not found errors
      toast.error(error.response.data.message);
      console.error(error.response.data);
    } else {
      console.log(error.response);
       toast.error(error.response.data?.message);
    }

    return Promise.reject(error);
  }
);

export default baseApi;

export { refreshAccessToken };

