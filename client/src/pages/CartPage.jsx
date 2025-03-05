import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";

function CartPage() {
  const { isLoggedIn, token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item._id !== productId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success("Item removed from cart");
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + parseFloat(item.price), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.error("Please log in to complete your purchase");
      navigate("/login", { state: { redirectTo: "/cart" } });
      return;
    }

    if (cartItems.length === 0) {
      toast.warning("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);

    try {
      let API_URL;
      if (import.meta.env.MODE === 'production') {
        API_URL = 'https://your-production-api.com';
      } else {
        API_URL = 'http://localhost:5001';
      }

      // Get product IDs from cart
      const productIds = cartItems.map(item => item._id);

      const response = await fetch(`${API_URL}/api/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productIds })
      });

      const data = await response.json();

      if (response.ok) {
        // Clear cart after successful purchase
        localStorage.removeItem("cart");
        setCartItems([]);
        toast.success("Purchase successful! Products added to your account.");
        navigate("/purchase-success");
      } else {
        toast.error(data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("An error occurred during checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300">
            <FaArrowLeft className="mr-2" />
            Back to Recommendations
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium">{item.name}</div>
                          <div className="text-sm text-gray-400 mt-1">{item.type}</div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.effects.map((effect, index) => (
                                <span key={index} className="bg-blue-900 text-blue-100 text-xs px-2 py-0.5 rounded-full">
                                  {effect}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ${parseFloat(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-gray-700 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-lg font-medium">Total:</span>
                  <span className="ml-2 text-xl font-bold text-blue-400">${calculateTotal()}</span>
                </div>
                <button
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md flex items-center ${isCheckingOut ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </button>
              </div>
              {!isLoggedIn && (
                <p className="mt-2 text-sm text-yellow-400">
                  You need to be logged in to complete your purchase.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;