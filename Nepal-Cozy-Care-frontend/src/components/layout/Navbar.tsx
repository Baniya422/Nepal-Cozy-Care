import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Main Links */}
        <div className="navlinks">
          <Link to="/" className="navlink">Home</Link>
          <Link to="/plants" className="navlink">Plants</Link>
          <Link to="/pots" className="navlink">Pots</Link>
          <Link to="/hygiene" className="navlink">Hygiene</Link>
          <Link to="/care-tips" className="navlink">Care Tips</Link>
          <Link to="/about" className="navlink">About</Link>
          <Link to="/plant-finder" className="navlink">Plant Finder</Link>
        </div>

        {/* Right Actions */}
        <div className="nav-right">
          <button className="iconbtn" onClick={() => navigate("/search")} title="Search">
            <Search size={20} />
          </button>

          <button className="iconbtn cart-btn" onClick={() => navigate("/cart")} title="Cart">
            <ShoppingCart size={20} />
            <span className="cart-badge">1</span>
          </button>

          {token ? (
            <button className="nav-btn logout" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="nav-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
