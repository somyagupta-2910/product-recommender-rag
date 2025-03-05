import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSearch, FaSpinner, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "../AuthContext";

const sampleProducts = [
  {
    id: 1,
    name: "Relaxation Tea",
    type: "beverage",
    description: "A soothing herbal tea blend designed for relaxation and stress relief.",
    effects: ["relaxation", "stress relief"],
    ingredients: ["Chamomile", "Lavender"],
    price: 12.99,
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    name: "Energy Boost Coffee",
    type: "beverage",
    description: "A rich coffee blend with added herbs for natural energy enhancement.",
    effects: ["energy", "focus"],
    ingredients: ["Coffee beans", "Ginseng", "Guarana"],
    price: 14.99,
    image: "https://images.unsplash.com/photo-1541167760496-1628856ab772?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    name: "Sleep Well Tea",
    type: "beverage",
    description: "An herbal blend designed to promote deep, restful sleep.",
    effects: ["improved sleep", "relaxation"],
    ingredients: ["Valerian Root", "Chamomile", "Passionflower"],
    price: 13.49,
    image: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
  }
];

function RecommendationPage() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please log in to access recommendations");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
      }
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.warning("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let API_URL;
      if (import.meta.env.MODE === 'production') {
        API_URL = 'https://your-production-api.com';
      } else {
        API_URL = 'http://localhost:5001';
      }
      
      const response = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}` // Add token to the request
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setRecommendations(data.products);
      } else {
        setRecommendations([]);
        toast.info("No products found matching your search");
      }
    } catch (error) {
      console.error("Error searching products:", error);
      toast.error("Failed to search products. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product) => {
    // Check if product is already in cart
    const isInCart = cart.some(item => item._id === product._id);
    
    if (isInCart) {
      toast.info(`${product.name} is already in your cart`);
      return;
    }
    
    const updatedCart = [...cart, product];
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    toast.success(`${product.name} added to cart!`);
  };

  // If not logged in, don't render the page content
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cart icon with count */}
        <div className="flex justify-end mb-4">
          <Link to="/cart" className="relative flex items-center text-white hover:text-blue-400">
            <FaShoppingCart className="text-2xl" />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
            <span className="ml-2">Cart</span>
          </Link>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Product</h2>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Describe what you're looking for (e.g., 'relaxing tea for better sleep')"
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-l-md block w-full p-4 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-r-md flex items-center justify-center transition duration-300 disabled:opacity-50"
              >
                {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Try searching by effect, ingredient, or product type
            </p>
          </form>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="ml-4 text-xl">Searching for products...</span>
          </div>
        )}

        {!isLoading && recommendations.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Recommended Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((product) => (
                <div 
                  key={product._id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 p-4"
                >
                  <h4 className="text-lg font-bold mb-2">{product.name}</h4>
                  <p className="text-gray-400 text-sm mb-3">
                    {product.description}
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
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-blue-400 font-bold">${parseFloat(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationPage;