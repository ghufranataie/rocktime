import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import mysql from "mysql2/promise";

const secretsClient = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const SECRET_ID = process.env.SECRET_ID || "showtime228/app";

let cachedSecrets = null;

const resolveOrigin = (event, fallback = "*") => {
  const origin = event?.headers?.origin || event?.headers?.Origin || fallback;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) return origin || fallback;
  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const buildCorsHeaders = (event) => ({
  "Access-Control-Allow-Origin": resolveOrigin(event),
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "OPTIONS,GET",
});

const response = (statusCode, body, event) => ({
  statusCode,
  headers: buildCorsHeaders(event),
  body: JSON.stringify(body),
});

async function getSecrets() {
  if (cachedSecrets) return cachedSecrets;
  const command = new GetSecretValueCommand({ SecretId: SECRET_ID });
  const result = await secretsClient.send(command);
  cachedSecrets = JSON.parse(result.SecretString || "{}");
  return cachedSecrets;
}

async function getDbConnection(secrets) {
  return mysql.createConnection({
    host: secrets.DB_HOST,
    user: secrets.DB_USER,
    password: secrets.DB_PASSWORD,
    database: secrets.DB_NAME,
    port: Number(secrets.DB_PORT || 3306),
  });
}

export const handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return response(200, {}, event);
  }

  if (event?.httpMethod !== "GET") {
    return response(405, { message: "Method not allowed" }, event);
  }

  const email = String(event?.queryStringParameters?.email || "").trim().toLowerCase();

  if (!email) {
    return response(400, { message: "email query parameter is required" }, event);
  }

  let connection;

  try {
    const secrets = await getSecrets();
    connection = await getDbConnection(secrets);

    const [rows] = await connection.execute(
      `SELECT
         b.bokID AS bookingId,
         b.bokSeatNumber AS seatNumber,
         b.bokStatus AS status,
         b.bokDate AS bookedAt,
         b.bokStripeSessionID AS stripeSessionId,
         s.shwID AS eventId,
         s.shwTitle AS eventTitle,
         s.shwDate AS eventDate,
         s.shwTime AS eventTime,
         s.shwLocation AS eventVenue,
         s.shwCity AS eventCity,
         st.shtPrice AS ticketPrice
       FROM users u
       INNER JOIN bookings b ON b.bokUserID = u.id
       INNER JOIN show_tickets st ON st.shtID = b.bokShowTicketID
       INNER JOIN shows s ON s.shwID = st.shtShowID
       WHERE u.usrEmail = ?
       ORDER BY b.bokDate DESC`,
      [email],
    );

    return response(
      200,
      {
        message: "Tickets fetched",
        email,
        tickets: rows,
      },
      event,
    );
  } catch (error) {
    console.error("get-my-tickets error:", error);
    return response(500, { message: "Internal server error" }, event);
  } finally {
    if (connection) await connection.end();
  }
};
