import { ErrorRequestHandler } from "express";

const globalErrorHandler:ErrorRequestHandler=(err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        statusCode: statusCode,
        message: message,
        error: err.stack || "No stack trace available"

    });
}

export default globalErrorHandler;