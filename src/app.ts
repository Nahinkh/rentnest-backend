import express, { Application, Request, Response } from "express";
const app:Application = express();
import cors from "cors";
import envConfig from "./config/envConfig";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import notFound from "./middleware/notFound";
import globalErrorHandler from "./middleware/globalErrorHandler";
import 'dotenv/config'

app.use(cors({
    origin: envConfig.app_url,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.use("/api/auth",authRoutes);

app.use(globalErrorHandler);
app.use(notFound);

app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World! From Rentnest Backend Server");
});

export default app;