/** @format */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
	const { user, isAuthenticated } = useAuth();

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	if (
		allowedRoles &&
		!allowedRoles.some((role) => user?.roles?.includes(role))
	) {
		return <Navigate to="/login" replace />;
	}

	return children;
}

export default ProtectedRoute;
