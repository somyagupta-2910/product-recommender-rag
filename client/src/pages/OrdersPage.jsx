import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext";

function OrdersPage() {
  const { isLoggedIn, token } = useAuth();
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      toast.error("Please log in to view your orders");
      navigate("/login", { state: { redirectTo: "/orders" } });
      return;
    }

    // Fetch user's purchased products
    const fetchPurchasedProducts = async () => {
      try {
        let API_URL;
        if (import.meta.env.MODE === 'production') {
          API_URL = 'https://your-production-api.com';
        } else {
          API_URL = 'http://localhost:5001';
        }

        const response = await fetch(`${API_URL}/api/orders/purchased`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }

        const data = await response.json();
        setPurchasedProducts(data.products);
      } catch (error) {
        console.error("Error fetching purchased products:", error);
        toast.error("Failed to load your orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, [isLoggedIn, token, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500 mr-3" />
        <span className="text-xl">Loading your orders...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to="/" className="flex items-center text-blue-400 hover:text-blue-300">
            <FaArrowLeft className="mr-2" />
            Back to Recommendations
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {purchasedProducts.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">You haven't made any purchases yet</h2>
            <p className="text-gray-400 mb-6">Explore our products and find something you'll love!</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedProducts.map((product) => (
              <div 
                key={product._id} 
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold">{product.name}</h4>
                  <span className="bg-green-700 text-green-100 text-xs px-2 py-1 rounded-full">
                    Purchased
                  </span>
                </div>
                
                <p className="text-gray-400 text-sm mb-3">
                  {product.description.length > 150 
                    ? `${product.description.substring(0, 150)}...` 
                    : product.description}
                </p>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Type:</h5>
                  <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {product.type}
                  </span>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Effects:</h5>
                  <div className="flex flex-wrap gap-2">
                    {product.effects.map((effect, index) => (
                      <span key={index} className="bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded-full">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Ingredients:</h5>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <span className="text-blue-400 font-bold">${parseFloat(product.price).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;