import Stripe from "stripe";
import stripe from "../../config/stripe"

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
  return stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });
};