# Product Recommender Application

## Overview

The Product Recommender Application is a full-stack web app designed to provide users with personalized product recommendations based on their search queries. Users can search for products, add them to their cart, and complete purchases. The application also allows users to view their order history. The app is built with a React frontend and a Node.js/Express backend, utilizing a MongoDB database for data storage.

## Table of Contents

- [Frontend](#frontend)
- [Backend](#backend)
- [API Endpoints](#api-endpoints)
- [Installation and Setup](#installation-and-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Frontend

The frontend of the application is built using React and styled with Tailwind CSS. It provides a responsive and interactive user interface for searching products, managing the cart, and viewing orders.

### Key Components

- **DarkNavbar**: A navigation bar that includes links to the home page, orders, cart, and authentication options (login/signup or sign out).
- **AdminProductPage**: Allows user to add products in the DB
- **RecommendationPage**: The main page where users can search for products and view recommendations. It includes a search bar and displays product cards with details.
- **CartPage**: Displays the products added to the user's cart and provides a checkout option.
- **OrdersPage**: Shows the user's order history with details of purchased products.
- **AuthContext**: Provides authentication state and functions to manage user login and logout.

### State Management

The application uses React's built-in state management with hooks like useState and useEffect to manage component states and side effects. The AuthContext is used to manage authentication state across the application.

### Routing

React Router is used for client-side routing, allowing users to navigate between different pages without reloading the page. The main routes include:

- `/`: Recommendation page
- `/admin/products`: AdminProductPage
- `/login`: Login page
- `/signup`: Signup page
- `/cart`: Cart page
- `/orders`: Orders page

## Backend

The backend is built with Node.js and Express, providing RESTful API endpoints for the frontend to interact with. It uses MongoDB as the database to store user and product information.

## API Endpoints

### Authentication

- `POST /api/auth/login`: Authenticates a user and returns a JWT token.
- `POST /api/auth/signup`: Registers a new user and returns a JWT token.

### Products

- `GET /api/products/search`: Searches for products based on a query and returns matching results.
- `POST /api/products`: Adds a new product to the database (admin only).

### Cart

- `POST /api/cart/add`: Adds a product to the user's cart.
- `POST /api/cart/remove`: Removes a product from the user's cart.

### Orders

- `GET /api/orders/purchased`: Retrieves the user's order history.
- `POST /api/orders/checkout`: Processes the user's cart and creates an order.

## Installation and Setup

### Prerequisites

- Node.js and npm installed
- MongoDB installed and running

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/product-recommender
cd product-recommender
```


2. Install dependencies:

```bash
npm install
```


3. Environment Variables:
Create a `.env` file in the root directory and add the following:
```bash
MONGODB_URI=mongodb://localhost:27017/product_recommender
JWT_SECRET=your_jwt_secret
```


4. Run the application:
- Start the backend server:
  ```
  npm run server
  ```
- Start the frontend development server:
  ```
  npm run start
  ```

## Usage

1. **Search for Products**: Use the search bar on the recommendation page to find products based on keywords.
2. **Add to Cart**: Click "Add to Cart" on product cards to add items to your cart.
3. **Checkout**: Go to the cart page and click "Checkout" to complete your purchase.
4. **View Orders**: Access the orders page to view your purchase history.
5. **Upload Products**: Access the AdminProductPage to upload and save products in the Database.

