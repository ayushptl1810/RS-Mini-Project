import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>{children || <Outlet />}</main>
      <footer className="bg-black border-t border-gray-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; 2024 Job Recommender System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
