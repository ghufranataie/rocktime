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
  "Access-Control-Allow-Headers": "Content-Type,Authorization,x-admin-key",
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

function getAdminKeyFromRequest(event) {
  const authHeader = event?.headers?.authorization || event?.headers?.Authorization || "";
  const adminHeaderKey = event?.headers?.["x-admin-key"] || event?.headers?.["X-Admin-Key"];

  if (adminHeaderKey) return String(adminHeaderKey);
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7).trim();
  return "";
}

function groupRowsByUser(rows) {
  const users = new Map();

  for (const row of rows) {
    const userKey = row.userEmail || `user-${row.userId}`;

    if (!users.has(userKey)) {
      users.set(userKey, {
        userId: row.userId,
        username: row.username,
        fullName: row.fullName,
        email: row.userEmail,
        tickets: [],
      });
    }

    if (row.bookingId) {
      users.get(userKey).tickets.push({
        bookingId: row.bookingId,
        seatNumber: row.seatNumber,
        status: row.status,
        bookedAt: row.bookedAt,
        stripeSessionId: row.stripeSessionId,
        event: {
          id: row.eventId,
          title: row.eventTitle,
          date: row.eventDate,
          time: row.eventTime,
          venue: row.eventVenue,
          city: row.eventCity,
          price: row.ticketPrice,
        },
      });
    }
  }

  return Array.from(users.values());
}

export const handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return response(200, {}, event);
  }

  if (event?.httpMethod !== "GET") {
    return response(405, { message: "Method not allowed" }, event);
  }

  let connection;

  try {
    const secrets = await getSecrets();

    if (!secrets.ADMIN_API_KEY) {
      return response(500, { message: "ADMIN_API_KEY is not configured in Secrets Manager" }, event);
    }

    const requestAdminKey = getAdminKeyFromRequest(event);
    if (!requestAdminKey || requestAdminKey !== secrets.ADMIN_API_KEY) {
      return response(401, { message: "Unauthorized" }, event);
    }

    connection = await getDbConnection(secrets);

    const [rows] = await connection.execute(
      `SELECT
         u.id AS userId,
         u.usrName AS username,
         u.usrFullName AS fullName,
         u.usrEmail AS userEmail,
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
       LEFT JOIN bookings b ON b.bokUserID = u.id
       LEFT JOIN show_tickets st ON st.shtID = b.bokShowTicketID
       LEFT JOIN shows s ON s.shwID = st.shtShowID
       ORDER BY u.id DESC, b.bokDate DESC`,
    );

    return response(
      200,
      {
        message: "Users and tickets fetched",
        users: groupRowsByUser(rows),
      },
      event,
    );
  } catch (error) {
    console.error("admin-get-users-tickets error:", error);
    return response(500, { message: "Internal server error" }, event);
  } finally {
    if (connection) await connection.end();
  }
};
