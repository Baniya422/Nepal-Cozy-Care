import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-green-600">
              Nepal Cozy Care
            </Link>
          </div>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-green-600">
              Products
            </Link>
            <Link to="/plant-finder" className="text-gray-700 hover:text-green-600">
              Plant Finder
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600">
              About
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link
              to="/login"
              className="text-gray-700 hover:text-green-600 px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
