import type React from "react";
import { Navigate } from "react-router-dom";
import { getLoggedUser } from "../data/authStorage";

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const user = getLoggedUser();

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute;
