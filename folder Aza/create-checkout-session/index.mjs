// ============================================================
// Lambda: create-checkout-session
// Purpose: Creates a Stripe Checkout Session so the user can
//          pay for their tickets on Stripe's hosted page.
//
// How it works:
//   1. Frontend sends cart items + user info via POST request
//   2. This Lambda gets the Stripe Secret Key from AWS Secrets Manager
//   3. It creates a Stripe Checkout Session with the ticket line items
//   4. Returns the Stripe checkout URL back to the frontend
//   5. Frontend redirects the user to that Stripe URL to pay
// ============================================================

import Stripe from "stripe";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// ---- AWS Secrets Manager setup ----
const secretsClient = new SecretsManagerClient({ region: "us-east-1" });
const SECRET_ID = process.env.SECRET_ID || "showtime228/stripe";

// Cache the secret so we don't call Secrets Manager on every request
let cachedStripeKey = null;

/**
 * Get the Stripe Secret Key from AWS Secrets Manager.
 * The secret is stored as a JSON object like:
 *   { "STRIPE_SECRET_KEY": "sk_live_...", "STRIPE_WEBHOOK_SECRET": "whsec_..." }
 */
async function getStripeSecretKey() {
  if (cachedStripeKey) return cachedStripeKey;

  const command = new GetSecretValueCommand({
    SecretId: SECRET_ID, // <-- This is the name of your secret in AWS
  });

  const response = await secretsClient.send(command);
  const secrets = JSON.parse(response.SecretString);
  cachedStripeKey = secrets.STRIPE_SECRET_KEY;
  return cachedStripeKey;
}

// ---- CORS Headers ----
// These headers allow your S3 website to call this API
const resolveOrigin = (event) => {
  const origin = event?.headers?.origin || event?.headers?.Origin || "*";
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return origin;
  }

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const getCorsHeaders = (event) => ({
  "Access-Control-Allow-Origin": resolveOrigin(event),
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
});

// ============================================================
// Main Lambda Handler
// ============================================================
export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  // Handle preflight CORS request (browser sends this before the real request)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  try {
    // ---- Step 1: Parse the request body from frontend ----
    const body = JSON.parse(event.body);

    // Expected body structure from our Checkout.tsx:
    // {
    //   items: [
    //     {
    //       eventId: "1",
    //       eventTitle: "Rock Concert",
    //       seatNumbers: [5, 6, 7],
    //       pricePerSeat: 45.00,
    //       date: "2026-04-15",
    //       time: "8:00 PM",
    //       venue: "Madison Square Garden"
    //     }
    //   ],
    //   customerEmail: "user@example.com",
    //   userId: 123   // <-- from authentication (added by your teammate)
    // }

    const { items, customerEmail, userId } = body;

    // Validate: make sure we got items
    if (!items || items.length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "No items in cart" }),
      };
    }

    // ---- Step 2: Get Stripe key from Secrets Manager ----
    const stripeKey = await getStripeSecretKey();
    const stripe = new Stripe(stripeKey);

    // ---- Step 3: Build line items for Stripe Checkout ----
    // Stripe needs a list of products the user is buying
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.eventTitle,
          description: `Seats: ${item.seatNumbers.join(", ")} | ${item.venue} | ${item.date} ${item.time}`,
        },
        unit_amount: Math.round(item.pricePerSeat * 100), // Stripe uses cents, so $45.00 = 4500
      },
      quantity: item.seatNumbers.length,
    }));

    const normalizedEmail = String(customerEmail || "").trim().toLowerCase();

    // ---- Step 4: Create Stripe Checkout Session ----
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      customer_email: customerEmail || undefined,

      // Metadata: we store our own data here so the webhook can read it later
      // This is how we know which user bought which seats for which event
      metadata: {
        userId: userId ? String(userId) : "",
        userEmail: normalizedEmail,
        // Store items as JSON string (Stripe metadata values must be strings)
        orderItems: JSON.stringify(
          items.map((item) => ({
            eventId: item.eventId,
            seatNumbers: item.seatNumbers,
            pricePerSeat: item.pricePerSeat,
          }))
        ),
      },

      // Where to redirect after payment
      success_url: `${body.successUrl || "https://your-s3-website.com"}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${body.cancelUrl || "https://your-s3-website.com/cart"}`,
    });

    // ---- Step 5: Return the checkout URL to the frontend ----
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        sessionId: session.id,
        url: session.url, // <-- Frontend will redirect to this URL
      }),
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Something went wrong while creating the checkout session",
      }),
    };
  }
};
