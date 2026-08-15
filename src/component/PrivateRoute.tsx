import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthenticated } from "../services/authSession";

const PrivateRoute = () => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;
