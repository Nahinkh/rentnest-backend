import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

type Validator = (value: any) => string | null;

const validateRequest = (validators: Validator) =>(req: Request, res: Response, next: NextFunction) => {
    const errors = validators(req.body);
    if (errors) {
        return next(new AppError(errors, 400));
    }
    next();
}

export default validateRequest;