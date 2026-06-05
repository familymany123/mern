import axios from "axios";
import toast from "react-hot-toast";
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
    window.location.replace("/login");
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/refresh_token`, {
      refreshToken,
    });
    const { accessToken } = response.data;
    localStorage.setItem("accessToken", accessToken);

    return accessToken;
  } catch (error) {
    console.log(error);
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessToken");
    throw error;
  }
};
// Add a request interceptor
baseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log(token);
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
        const newAccessToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return baseApi(error.config);
      } catch (refreshError) {
        console.log(refreshError);
      }
      return Promise.reject(error);
    }
    if (status == 403) {
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("accessToken");
      window.location.replace("/login");
    } else if (status === 401) {
      try {
        const newAccessToken = await refreshAccessToken();
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return baseApi(error.config);
      } catch (refreshError) {
        console.log(refreshError);
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("accessToken");
      }
    } else if (status === 404) {
      // Handle not found errors
      toast.error(error.response.data.message);
      console.error(error.response.data);
    } else if (status === 400) {
    
      toast.error(error.response.data.message);
      console.error(error.response.data);
      return Promise.reject(error);
    }
    else {
      console.error(error.response.data);
      
    }

    return Promise.reject(error);
  }
);

export default baseApi;

export { refreshAccessToken };

