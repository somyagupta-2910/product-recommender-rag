import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { FaShoppingCart, FaClipboardList } from "react-icons/fa";

function DarkNavbar() {
  const { isLoggedIn, handleLogout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Get cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart");
      if (cart) {
        try {
          const cartItems = JSON.parse(cart);
          setCartCount(cartItems.length);
        } catch (error) {
          console.error("Error parsing cart:", error);
        }
      }
    };

    updateCartCount();
    
    // Listen for storage events to update cart count when it changes
    window.addEventListener("storage", updateCartCount);
    
    return () => {
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              Product Recommender
            </Link>
          </div>
          <div className="flex items-center">
            {isLoggedIn ? (
              <>
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 mr-4"
                >
                  Recommendations
                </Link>
                <Link
                  to="/orders"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 mr-4 flex items-center"
                >
                  <FaClipboardList className="h-5 w-5 mr-1" />
                  My Orders
                </Link>
                <Link
                  to="/cart"
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 mr-4 relative"
                >
                  <FaShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default DarkNavbar;