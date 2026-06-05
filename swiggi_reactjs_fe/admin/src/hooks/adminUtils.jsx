import { useContext } from "react";
import { AuthContext } from "./useAdmin";

 
export const useAuth = () => {
  return useContext(AuthContext);
};
