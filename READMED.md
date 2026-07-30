# 🏡 RentNest Backend API

A scalable and secure backend API for **RentNest**, a modern rental property marketplace where landlords can list rental properties and tenants can browse, request, and rent properties seamlessly.

Built with **Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL**, and deployed on **Render**.

---

## 🚀 Live Demo

- 🌐 **Backend API:** https://rentnest-backend-jcys.onrender.com

---

# ✨ Features

## 🔐 Authentication & Authorization

- User Registration
- User Login
- JWT Authentication
- Refresh Token Authentication
- Password Hashing using bcrypt
- Cookie-based Authentication
- Role-based Authorization
- Protected Routes

---

## 👤 User Management

- Tenant
- Landlord
- Admin

Each role has its own permissions.

---

## 🏠 Property Management

- Create Property
- Update Property
- Delete Property
- Get All Properties
- Get Single Property
- Property Categories
- Property Availability
- Property Status

---

## 🔍 Search & Filtering

- Search by Location
- Filter by Category
- Filter by Price
- Pagination
- Sorting

---

## 📝 Rental Request System

- Request Rental
- Approve Request
- Reject Request
- Cancel Request
- Rental History

---

## ⭐ Reviews

- Create Review
- Update Review
- Delete Review
- Get Property Reviews

---

## 💳 Payment

- Stripe Payment Integration
- Secure Payment Intent
- Payment Verification

---

## 🛡 Security

- JWT Authentication
- Password Hashing
- HTTP Only Cookies
- Environment Variables
- Input Validation
- Centralized Error Handling

---

# 🏗 Tech Stack

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM
- Neon Database

### Authentication

- JWT
- bcryptjs
- Cookie Parser

### Payment

- Stripe

### Deployment

- Render

---

# 📁 Project Structure

```
rentnest-backend
│
├── prisma/
│
├── generated/
│
├── src/
│   ├── config/
│   ├── constants/
│   ├── db/
│   ├── interfaces/
│   ├── middleware/
│   ├── modules/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── dist/
│
├── tsup.config.ts
├── prisma.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/your-username/rentnest-backend.git
```

```bash
cd rentnest-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file.

```env
PORT=5000

NODE_ENV=development

DATABASE_URL=

DIRECT_URL=

APP_URL=http://localhost:5000

JWT_ACCESS_SECRET=

JWT_REFRESH_SECRET=

JWT_ACCESS_EXPIRES_IN=7d

JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=

STRIPE_PUBLISH_KEY=

STRIPE_WEBHOOK_SECRET=
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migration

```bash
npx prisma migrate dev
```

---

## Start Development Server

```bash
npm run dev
```

---

## Build Project

```bash
npm run build
```

---

## Run Production Build

```bash
npm start
```

---

# 📡 API Base URL

```
https://rentnest-backend-jcys.onrender.com
```

---

# 🔑 Authentication

Protected routes require a valid JWT.

Example Header

```http
Authorization: Bearer <access_token>
```

---

# 🌱 Environment Variables

| Variable | Description |
|------------|------------|
| DATABASE_URL | PostgreSQL Database URL |
| DIRECT_URL | Direct Database URL |
| JWT_ACCESS_SECRET | Access Token Secret |
| JWT_REFRESH_SECRET | Refresh Token Secret |
| JWT_ACCESS_EXPIRES_IN | Access Token Expiration |
| JWT_REFRESH_EXPIRES_IN | Refresh Token Expiration |
| BCRYPT_SALT_ROUNDS | Password Salt Rounds |
| STRIPE_SECRET_KEY | Stripe Secret Key |
| STRIPE_PUBLISH_KEY | Stripe Publishable Key |
| STRIPE_WEBHOOK_SECRET | Stripe Webhook Secret |

---

# 📦 Available Scripts

```bash
npm run dev
```

Runs the development server.

---

```bash
npm run build
```

Builds the project using **tsup**.

---

```bash
npm start
```

Runs the production server.

---

# 🚀 Deployment

Backend is deployed on **Render**.

Production URL

```
https://rentnest-backend-jcys.onrender.com
```

---

# 🛠 Future Improvements

- Email Verification
- Forgot Password
- Image Upload (Cloudinary)
- Redis Caching
- Docker Support
- Swagger API Documentation
- Unit Testing
- CI/CD Pipeline
- Logging
- AI Property Recommendation

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to GitHub

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request

---

# 👨‍💻 Author

### Md. Abdul Halim Khan

AI & Software Engineering Enthusiast

- GitHub: https://github.com/Nahinkh
- LinkedIn: https://www.linkedin.com/in/abdul-halim-khan-h5001