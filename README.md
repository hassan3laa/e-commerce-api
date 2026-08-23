# E-Commerce API

A RESTful E-Commerce Backend built with Node.js, Express.js, MongoDB, and Mongoose.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Helmet
- Express Rate Limit

## Project Structure

```text
e-commerce-api/

│
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── seed.js
│
├── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Features

- Authentication and authorization
- JWT-based protected routes
- User management
- Products, categories, and brands
- Product reviews
- Cart and wishlist
- Search, filtering, sorting, and pagination
- Field limiting
- Product slug generation
- Product ratings
- Validation and centralized error handling
- API security
- Database seeding

## Roles

- `user`
- `admin`

## API Base URL

```text
/api/v1
```

### Authentication Routes

```text
POST    /api/v1/auth/signup
POST    /api/v1/auth/login
GET     /api/v1/auth/me
```

### User Routes

```text
GET     /api/v1/users
GET     /api/v1/users/:id
PATCH   /api/v1/users/:id
DELETE  /api/v1/users/:id
```

### Product Routes

```text
GET     /api/v1/products
GET     /api/v1/products/:id
POST    /api/v1/products
PATCH   /api/v1/products/:id
DELETE  /api/v1/products/:id
```

### Category Routes

```text
GET     /api/v1/categories
GET     /api/v1/categories/:id
POST    /api/v1/categories
PATCH   /api/v1/categories/:id
DELETE  /api/v1/categories/:id
```

### Brand Routes

```text
GET     /api/v1/brands
GET     /api/v1/brands/:id
POST    /api/v1/brands
PATCH   /api/v1/brands/:id
DELETE  /api/v1/brands/:id
```

### Review Routes

```text
GET     /api/v1/reviews
POST    /api/v1/reviews
PATCH   /api/v1/reviews/:id
DELETE  /api/v1/reviews/:id
```

### Cart Routes

```text
GET     /api/v1/cart
POST    /api/v1/cart
PATCH   /api/v1/cart/:productId
DELETE  /api/v1/cart/:productId
DELETE  /api/v1/cart
```

### Wishlist Routes

```text
GET     /api/v1/wishlist
POST    /api/v1/wishlist/:productId
DELETE  /api/v1/wishlist/:productId
```

### Health Check

```text
GET     /api/v1/health
```

## Product Query Features

The products endpoint supports search, filtering, sorting, field limiting, and pagination.

### Search

```text
GET /api/v1/products?search=iphone
```

### Filtering

```text
GET /api/v1/products?price[gte]=5000&price[lte]=50000
```

### Sorting

```text
GET /api/v1/products?sort=price
```

Multiple sorting fields can be provided:

```text
GET /api/v1/products?sort=price,-createdAt
```

### Field Limiting

```text
GET /api/v1/products?fields=name,price,quantity
```

### Pagination

```text
GET /api/v1/products?page=1&limit=10
```

## Installation

Clone the repository:

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd e-commerce-api
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example` and provide the required environment variables.

Start the development server:

```bash
npm run dev
```

Or start the application normally:

```bash
npm start
```

## Database Seeding

The project includes a seed script for creating initial users, categories, brands, and products.

Run:

```bash
node src/seed.js
```

The admin credentials are loaded from environment variables.

## Error Handling

The API uses centralized error handling through custom middleware and the `AppError` utility.
