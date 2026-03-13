// ============================================================
// Lambda: stripe-webhook
// Purpose: Handles Stripe webhook events after a user pays.
//          When payment is successful, saves the booking
//          (tickets) to the MySQL database.
//
// How it works:
//   1. User pays on Stripe's page
//   2. Stripe sends a POST request to this Lambda (via API Gateway)
//   3. This Lambda verifies the event is really from Stripe
//   4. If payment succeeded → save tickets to MySQL database
//   5. Stripe gets a 200 OK response (so it knows we got the event)
// ============================================================

import Stripe from "stripe";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import mysql from "mysql2/promise";

// ---- AWS Secrets Manager setup ----
const secretsClient = new SecretsManagerClient({ region: "us-east-1" });
const SECRET_ID = process.env.SECRET_ID || "showtime228/stripe";

// Cache secrets so we don't call Secrets Manager on every request
let cachedSecrets = null;

/**
 * Get all secrets from AWS Secrets Manager.
 * Returns: { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME }
 */
async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;

  const command = new GetSecretValueCommand({
    SecretId: SECRET_ID, // <-- Same secret name as in create-checkout-session
  });

  const response = await secretsClient.send(command);
  cachedSecrets = JSON.parse(response.SecretString);
  return cachedSecrets;
}

/**
 * Create a connection to the MySQL database.
 */
async function getDbConnection(secrets) {
  return mysql.createConnection({
    host: secrets.DB_HOST,
    user: secrets.DB_USER,
    password: secrets.DB_PASSWORD,
    database: secrets.DB_NAME,
    port: secrets.DB_PORT || 3306,
  });
}

/**
 * Save the booking to the database.
 * For each seat the user bought, we insert a row into the bookings table.
 */
async function saveBookingToDatabase(connection, userId, orderItems, stripeSessionId) {
  // orderItems looks like:
  // [
  //   { eventId: "1", seatNumbers: [5, 6, 7], pricePerSeat: 45 },
  //   { eventId: "3", seatNumbers: [12], pricePerSeat: 60 }
  // ]

  const bookingDate = new Date().toISOString().slice(0, 19).replace("T", " ");

  for (const item of orderItems) {
    // First, find the ticket type ID (shtID) for this event
    const [ticketRows] = await connection.execute(
      "SELECT shtID, shtPrice FROM show_tickets WHERE shtShowID = ? LIMIT 1",
      [item.eventId]
    );

    if (ticketRows.length === 0) {
      console.warn(`No ticket type found for event ${item.eventId}, skipping`);
      continue;
    }

    const ticketTypeId = ticketRows[0].shtID;

    // Insert one booking row for each seat
    for (const seatNumber of item.seatNumbers) {
      await connection.execute(
        `INSERT INTO bookings (bokUserID, bokShowTicketID, bokSeatNumber, bokDate, bokStripeSessionID, bokStatus)
         VALUES (?, ?, ?, ?, ?, 'confirmed')`,
        [userId, ticketTypeId, seatNumber, bookingDate, stripeSessionId]
      );
    }
  }
}

async function findUserIdByEmail(connection, email) {
  if (!email) return null;

  const [rows] = await connection.execute(
    "SELECT id FROM users WHERE usrEmail = ? LIMIT 1",
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0].id;
}

// ---- CORS Headers ----
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
  "Access-Control-Allow-Headers": "Content-Type,Stripe-Signature",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
});

// ============================================================
// Main Lambda Handler
// ============================================================
export const handler = async (event) => {
  const corsHeaders = getCorsHeaders(event);

  // Handle preflight CORS request
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  let connection = null;

  try {
    // ---- Step 1: Get secrets ----
    const secrets = await getSecrets();
    const stripe = new Stripe(secrets.STRIPE_SECRET_KEY);

    // ---- Step 2: Verify the webhook signature ----
    // This makes sure the request is really from Stripe (not a hacker)
    const signature = event.headers["Stripe-Signature"] || event.headers["stripe-signature"];

    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        event.body, // Raw body (important: must NOT be parsed)
        signature,
        secrets.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Invalid webhook signature" }),
      };
    }

    // ---- Step 3: Handle the event ----
    // We only care about "checkout.session.completed" (= payment was successful)
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object;

      console.log("Payment successful! Session ID:", session.id);
      console.log("Customer email:", session.customer_email);
      console.log("Amount paid:", session.amount_total, "cents");

      // Get our custom data from metadata (we stored it when creating the session)
      let userId = session.metadata.userId;
      const userEmail = session.metadata.userEmail || session.customer_email;
      const orderItems = JSON.parse(session.metadata.orderItems);

      if (!userId) {
        connection = await getDbConnection(secrets);
        userId = await findUserIdByEmail(connection, userEmail);
      }

      if (!userId) {
        console.warn("Could not resolve user ID. Skipping booking save.");
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ received: true, warning: "User not found" }),
        };
      }

      console.log("User ID:", userId);
      console.log("Order items:", JSON.stringify(orderItems));

      // ---- Step 4: Save to database ----
      if (!connection) {
        connection = await getDbConnection(secrets);
      }
      await saveBookingToDatabase(connection, userId, orderItems, session.id);

      console.log("Booking saved to database successfully!");
    } else {
      // We got a different event type (like "payment_intent.created")
      // We don't need to do anything with those
      console.log("Received event type:", stripeEvent.type, "- ignoring");
    }

    // ---- Step 5: Return 200 to Stripe ----
    // Stripe needs a 200 response to know we handled the event
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Webhook handler error:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Webhook processing failed" }),
    };
  } finally {
    // Always close the database connection
    if (connection) {
      await connection.end();
    }
  }
};
