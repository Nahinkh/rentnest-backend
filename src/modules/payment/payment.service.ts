import { ICreatePaymentIntent } from "./payment.interface";

import { prisma } from "../../db";
import { JwtPayload } from "../auth/auth.interface";
import {
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PropertyStatus,
} from "../../../generated/prisma/enums";
import {
  createStripeCheckoutSession,
  createStripePaymentIntent,
} from "./payment.utils";
import { validatePaymentRequest } from "./payment.validation";
import stripe from "../../config/stripe";
import envConfig from "../../config/envConfig";
import { Request } from "express";
import Stripe from "stripe";
import AppError from "../../utils/AppError";
import httpStatus from "http-status";

const createPaymentIntent = async (
  payload: ICreatePaymentIntent,
  user: JwtPayload,
) => {
  // Input Validation
  const { rentalRequest, amount } = await validatePaymentRequest(payload, user);

  // Stripe Payment Intent
  const paymentIntent = await createStripePaymentIntent(
    Math.round(amount * 100),
    {
      rentalRequestId: rentalRequest.id,
      tenantId: rentalRequest.tenantId,
    },
  );

  const payment = await prisma.payment.create({
    data: {
      rentalRequestId: rentalRequest.id,

      tenantId: rentalRequest.tenantId,

      transactionId: paymentIntent.id,

      amount,

      provider: PaymentProvider.STRIPE,

      status: PaymentStatus.PENDING,
    },
  });
  return {
    paymentId: payment.id,

    paymentIntentId: paymentIntent.id,

    clientSecret: paymentIntent.client_secret,

    amount,

    currency: "BDT",
  };
};

const createCheckoutSession = async (
  payload: ICreatePaymentIntent,
  user: JwtPayload,
) => {
  // Input Validation
  const { rentalRequest, amount } = await validatePaymentRequest(payload, user);

  // Stripe Payment Intent
  const session = await createStripeCheckoutSession(
    amount,
    rentalRequest.id,
    rentalRequest.tenantId,
  );

  const payment = await prisma.payment.create({
    data: {
      rentalRequestId: rentalRequest.id,
      tenantId: rentalRequest.tenantId,
      transactionId: session.id,
      amount,
      provider: PaymentProvider.STRIPE,
      status: PaymentStatus.PENDING,
    },
  });
  return {
    paymentId: payment.id,
    checkoutUrl: session.url,
  };
};

const stripeWebhook = async (req: Request) => {
  const signature = req.headers["stripe-signature"] as string;

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    envConfig.stripe_webhook_secret,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const payment = await prisma.payment.findUnique({
        where: {
          transactionId: session.id,
        },
        include: {
          rentalRequest: true,
        },
      });

      if (!payment) {
        return {
          received: true,
        };
      }

      // Prevent duplicate processing if Stripe retries the webhook
      if (payment.status === PaymentStatus.SUCCESS) {
        return {
          received: true,
        };
      }

      // Retrieve PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string,
      );

      // Retrieve Payment Method
      const stripePaymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string,
      );
      let paymentMethod: PaymentMethod;
      switch (stripePaymentMethod.type) {
        case "card":
          paymentMethod = PaymentMethod.CARD;
          break;

        default:
          paymentMethod = PaymentMethod.CARD;
          break;
      }
      try {
        await prisma.$transaction([
          prisma.payment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: PaymentStatus.SUCCESS,
              paymentMethod,
              paidAt: new Date(),
            },
          }),

          prisma.property.update({
            where: {
              id: payment.rentalRequest.propertyId,
            },
            data: {
              availability: PropertyStatus.RENTED,
            },
          }),
        ]);
      } catch (error) {
        throw new AppError("Transaction failed", httpStatus.FORBIDDEN);
      }

      break;
    }

    default:
  }

  return {
    received: true,
  };
};

export const paymentService = {
  createPaymentIntent,
  createCheckoutSession,
  stripeWebhook,
};
