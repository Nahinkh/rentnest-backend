import express, { Application, Request, Response } from "express";
const app:Application = express();
import cors from "cors";
import envConfig from "./config/envConfig";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import notFound from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";
import 'dotenv/config'
import { propertyRoute } from "./modules/property/property.route";
import { tenantRoute } from "./modules/tenant/tenant.route";
import { paymentRoute } from "./modules/payment/payment.route";
import { reviewRoute } from "./modules/review/review.route";
import { adminRoute } from "./modules/admin/admin.route";
import { categoryRoute } from "./modules/category/category.route";

app.use(cors({
    origin: envConfig.app_url,
    credentials: true,
}));
// Stripe Webhook 
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.use("/api/auth",authRoutes);
app.use("/api/landlord/properties", propertyRoute);
app.use("/api/admin", adminRoute);
app.use("/api/rentals",tenantRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/payments",paymentRoute);
app.use("/api/reviews",reviewRoute);



// Check Stripe is connected
// const paymentMethods = await stripe.paymentMethods.list({
//   customer: "cus_test",
// }); 
// console.log("Stripe configured successfully");

app.use(globalErrorHandler);
app.use(notFound);

app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World! From RentNest Backend Server");
});

export default app;