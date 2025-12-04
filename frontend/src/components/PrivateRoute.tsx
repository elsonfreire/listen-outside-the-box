import type React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({
  loggedUsername: isLoggedUsername,
  children,
}: {
  loggedUsername: string | null;
  children: React.ReactElement;
}) => {
  if (!isLoggedUsername) return <Navigate to="/login" replace />;
  return children;
};

export default PrivateRoute;
