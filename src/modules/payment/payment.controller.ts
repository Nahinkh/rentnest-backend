import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createPaymentIntent(req.body, req.user);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Payment Successful",
    data: result,
  });
});
const createStripeCheckoutSession = catchAsync(
  async (req: Request, res: Response) => {
    const result = await paymentService.createCheckoutSession(
      req.body,
      req.user,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment Successful",
      data: result,
    });
  },
);

const stripeWebhook = async (req: Request, res: Response) => {
  try {
    const result = await paymentService.stripeWebhook(req);

    res.status(200).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).send("Webhook Error");
  }
};

export const paymentController = {
  createPaymentIntent,
  createStripeCheckoutSession,
  stripeWebhook,
};
