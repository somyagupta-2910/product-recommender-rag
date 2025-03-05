import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaUpload, FaSave } from "react-icons/fa";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function AdminProductPage() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [products, setProducts] = useState([{
    name: "",
    type: "",
    description: "",
    effects: [],
    ingredients: [],
    price: "",
    image: ""
  }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEffect, setNewEffect] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [activeProductIndex, setActiveProductIndex] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn || !token) {
      toast.error("You must be logged in to access this page");
      navigate("/login", { state: { redirectTo: "/admin/products" } });
      return;
    }
  }, [isLoggedIn, token, navigate]);

  const handleChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value
    };
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        name: "",
        type: "",
        description: "",
        effects: [],
        ingredients: [],
        price: "",
        image: ""
      }
    ]);
    setActiveProductIndex(products.length);
  };

  const removeProduct = (index) => {
    if (products.length === 1) {
      toast.error("You must have at least one product");
      return;
    }
    
    const updatedProducts = products.filter((_, i) => i !== index);
    setProducts(updatedProducts);
    
    if (activeProductIndex >= updatedProducts.length) {
      setActiveProductIndex(updatedProducts.length - 1);
    }
  };

  const addEffect = (index) => {
    if (!newEffect.trim()) return;
    
    const updatedProducts = [...products];
    if (!updatedProducts[index].effects.includes(newEffect.toLowerCase().trim())) {
      updatedProducts[index].effects = [...updatedProducts[index].effects, newEffect.toLowerCase().trim()];
      setProducts(updatedProducts);
    }
    setNewEffect("");
  };

  const removeEffect = (productIndex, effectIndex) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].effects = updatedProducts[productIndex].effects.filter((_, i) => i !== effectIndex);
    setProducts(updatedProducts);
  };

  const addIngredient = (index) => {
    if (!newIngredient.trim()) return;
    
    const updatedProducts = [...products];
    if (!updatedProducts[index].ingredients.includes(newIngredient.trim())) {
      updatedProducts[index].ingredients = [...updatedProducts[index].ingredients, newIngredient.trim()];
      setProducts(updatedProducts);
    }
    setNewIngredient("");
  };

  const removeIngredient = (productIndex, ingredientIndex) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].ingredients = updatedProducts[productIndex].ingredients.filter((_, i) => i !== ingredientIndex);
    setProducts(updatedProducts);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);
        if (Array.isArray(jsonData)) {
          // Validate the structure of each product
          const validProducts = jsonData.filter(product => 
            product.name && 
            product.type && 
            product.description && 
            Array.isArray(product.effects) && 
            Array.isArray(product.ingredients) && 
            !isNaN(parseFloat(product.price))
          );
          
          if (validProducts.length === 0) {
            toast.error("No valid products found in the JSON file");
            return;
          }
          
          if (validProducts.length !== jsonData.length) {
            toast.warning(`Only ${validProducts.length} out of ${jsonData.length} products were valid`);
          }
          
          setProducts(validProducts);
          setActiveProductIndex(0);
          toast.success(`Loaded ${validProducts.length} products from file`);
        } else {
          toast.error("JSON file must contain an array of products");
        }
      } catch (error) {
        toast.error("Invalid JSON file");
        console.error("JSON parse error:", error);
      }
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateProducts = () => {
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (!p.name || !p.type || !p.description || !p.price || p.effects.length === 0 || p.ingredients.length === 0) {
        toast.error(`Product #${i + 1} is missing required fields`);
        setActiveProductIndex(i);
        return false;
      }
      
      if (isNaN(parseFloat(p.price)) || parseFloat(p.price) <= 0) {
        toast.error(`Product #${i + 1} has an invalid price`);
        setActiveProductIndex(i);
        return false;
      }
    }
    return true;
  };

  const submitProducts = async () => {
    // Validate products before submission
    const validProducts = products.filter(product => 
      product.name && 
      product.type && 
      product.description && 
      product.effects.length > 0 && 
      product.ingredients.length > 0 && 
      !isNaN(parseFloat(product.price))
    );
    
    if (validProducts.length === 0) {
      toast.error("No valid products to submit");
      return;
    }
    
    if (validProducts.length !== products.length) {
      toast.warning(`Only ${validProducts.length} out of ${products.length} products are valid and will be submitted`);
    }
    
    setIsSubmitting(true);
    
    try {
      let API_URL;
      if (import.meta.env.MODE === 'production') {
        API_URL = 'https://your-production-api.com';
      } else {
        API_URL = 'http://localhost:5001';
      }
      
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: validProducts })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Successfully added ${data.results.length} products`);
        
        // Reset form after successful submission
        setProducts([{
          name: "",
          type: "",
          description: "",
          effects: [],
          ingredients: [],
          price: "",
          image: ""
        }]);
        setActiveProductIndex(0);
      } else {
        toast.error(data.message || 'Failed to add products');
      }
    } catch (error) {
      console.error('Error submitting products:', error);
      toast.error('An error occurred while submitting products');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Product Management</h1>
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <button
              onClick={addProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaPlus className="mr-2" /> Add Product
            </button>
          </div>
          
          <div className="flex space-x-4">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <FaUpload className="mr-2" /> Upload JSON
            </button>
            
            <button
              onClick={submitProducts}
              disabled={isSubmitting}
              className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save All Products
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Product tabs */}
        <div className="mb-6 flex overflow-x-auto pb-2">
          {products.map((product, index) => (
            <button
              key={index}
              onClick={() => setActiveProductIndex(index)}
              className={`px-4 py-2 rounded-t-md mr-2 whitespace-nowrap ${
                activeProductIndex === index 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {product.name || `Product ${index + 1}`}
            </button>
          ))}
        </div>
        
        {/* Active product form */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {products[activeProductIndex].name || `Product ${activeProductIndex + 1}`}
            </h2>
            <button
              onClick={() => removeProduct(activeProductIndex)}
              className="text-red-400 hover:text-red-300"
            >
              <FaTrash />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Product Name*
              </label>
              <input
                type="text"
                value={products[activeProductIndex].name}
                onChange={(e) => handleChange(activeProductIndex, 'name', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Product Type*
              </label>
              <input
                type="text"
                value={products[activeProductIndex].type}
                onChange={(e) => handleChange(activeProductIndex, 'type', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., beverage, snack, supplement"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description*
            </label>
            <textarea
              value={products[activeProductIndex].description}
              onChange={(e) => handleChange(activeProductIndex, 'description', e.target.value)}
              className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Detailed product description"
              rows="4"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Price*
              </label>
              <input
                type="number"
                value={products[activeProductIndex].price}
                onChange={(e) => handleChange(activeProductIndex, 'price', e.target.value)}
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Effects*
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {products[activeProductIndex].effects.map((effect, effectIndex) => (
                <span 
                  key={effectIndex} 
                  className="bg-blue-900 text-blue-100 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {effect}
                  <button 
                    onClick={() => removeEffect(activeProductIndex, effectIndex)}
                    className="ml-2 text-blue-300 hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newEffect}
                onChange={(e) => setNewEffect(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addEffect(activeProductIndex)}
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-l-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add an effect (e.g., relaxation, energy)"
              />
              <button
                onClick={() => addEffect(activeProductIndex)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
              >
                Add
              </button>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Ingredients*
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {products[activeProductIndex].ingredients.map((ingredient, ingredientIndex) => (
                <span 
                  key={ingredientIndex} 
                  className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full flex items-center"
                >
                  {ingredient}
                  <button 
                    onClick={() => removeIngredient(activeProductIndex, ingredientIndex)}
                    className="ml-2 text-gray-400 hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient(activeProductIndex)}
                className="bg-gray-700 border border-gray-600 text-gray-100 rounded-l-md block w-full p-2.5 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add an ingredient (e.g., Chamomile, Ginseng)"
              />
              <button
                onClick={() => addIngredient(activeProductIndex)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProductPage;