import express, { Application, Request, Response } from "express";
const app:Application = express();
import cors from "cors";
import envConfig from "./config/envConfig";
import cookieParser from "cookie-parser";

app.use(cors({
    origin: envConfig.app_url,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World! From Rentnest Backend Server");
});

export default app;