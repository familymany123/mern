import baseApi from "../../api/baseApi";

const userApi = {
  async getProfile() {
    try {
      const response = await baseApi.get("/users/profile");

      return response.data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An error occurred during login.");
      }
    }
  },
};

export default userApi;
