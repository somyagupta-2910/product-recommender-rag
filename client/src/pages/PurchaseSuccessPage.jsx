import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaArrowRight } from "react-icons/fa";

function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-6" />
        
        <h1 className="text-2xl font-bold mb-4">Purchase Successful!</h1>
        
        <p className="text-gray-300 mb-6">
          Thank you for your purchase. The products have been added to your account.
        </p>
        
        <div className="flex flex-col space-y-4">
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md flex items-center justify-center"
          >
            Continue Shopping
            <FaArrowRight className="ml-2" />
          </Link>
          
          <Link
            to="/orders"
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-md"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PurchaseSuccessPage;