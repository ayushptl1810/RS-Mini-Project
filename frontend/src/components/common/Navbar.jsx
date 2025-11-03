import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
              JobRS
            </span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/jobs"
              className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
            >
              Jobs
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/recommend-role"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Recommend Role
                </Link>
                <Link
                  to="/recommend-stack"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Recommend Stack
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>{user?.name || "Profile"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/login"
                  className="text-gray-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
