import Stripe from "stripe";
import stripe from "../../config/stripe"
import envConfig from "../../config/envConfig";

// export const createStripePaymentIntent = async(amount:number,metadata:Record< string, string>)=>{
//     return stripe.paymentIntents.create({
//         amount,
//         currency:"bdt",
//         automatic_payment_methods:{
//             enabled:true
//         },
//         metadata
//     })
// }
export const createStripePaymentIntent = async (
  amount: number,
  metadata: Record<string, string>
):Promise<Stripe.PaymentIntent> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "bdt",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
  return paymentIntent 
};

export const createStripeCheckoutSession = async (
  amount: number,
  rentalRequestId: string,
  tenantId: string
): Promise<Stripe.Checkout.Session> => {
  return await stripe.checkout.sessions.create({
    mode: "payment",

    payment_method_types: ["card"],

    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: "Property Rental Payment",
            description: "Advance payment for rental property",
          },
          unit_amount: amount * 100, // Stripe expects the smallest currency unit
        },
        quantity: 1,
      },
    ],

    success_url: `${envConfig.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${envConfig.app_url}/payment/cancel`,

    metadata: {
      rentalRequestId,
      tenantId,
    },
  });
};