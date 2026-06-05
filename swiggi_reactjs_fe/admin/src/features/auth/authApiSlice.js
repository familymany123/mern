import baseApi from "../../api/baseApi";

const authApi = {
  async signIn(payload) {
    try {
      const response = await baseApi.post("/login", payload);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.log(error)
      if (error.response && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("An error occurred during login.");
      }
    }
  },
  
};

export default authApi;
