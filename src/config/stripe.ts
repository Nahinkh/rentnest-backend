import Stripe from "stripe";
import envConfig from "./envConfig";

const stripe = new Stripe(envConfig.stripe_secret_key,{
    apiVersion:"2026-06-24.dahlia"
})

export default stripe