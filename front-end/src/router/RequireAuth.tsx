import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import { RootState } from "../redux/store";
import { FiLoader } from "react-icons/fi";
import { useEffect } from "react";

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const isLoading = useSelector((state: RootState) => state.auth.isLoading);
  let location = useLocation();
  const checkoutParams = new URLSearchParams(location.search);
  const data = checkoutParams.get('data');

  useEffect(() => {
    if (location.pathname.includes("/checkout") && !data) {
      window.location.replace("/cart");
    }
  }, [data]);
  
  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center items-center flex-col text-violet-700">
        <FiLoader size={80} className="animate-spin"/>
        Đang tải dữ liệu ...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
};