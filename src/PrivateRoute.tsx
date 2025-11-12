import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.tsx";

// Simple loader component
const Loader: React.FC = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
  </div>
);

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isLoggedIn, isAuthLoading } = useAuth();

  // Wait until the AuthContext has finished checking localStorage
  if (isAuthLoading) {
    return <Loader />;
  }

  if (!isLoggedIn) {
    // Redirect them to the / page, but save the current location they were
    // trying to go to.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;