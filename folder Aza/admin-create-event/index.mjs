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

const readJsonBody = (rawBody) => {
  if (!rawBody) return {};
  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
};

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
  "Access-Control-Allow-Methods": "OPTIONS,POST",
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

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
}

function sanitizePayload(body) {
  const rows = Math.max(1, Number(body.rows || 1));
  const seatsPerRow = Math.max(1, Number(body.seatsPerRow || 1));

  return {
    title: String(body.title || "").trim(),
    artist: String(body.artist || "").trim(),
    date: String(body.date || "").trim(),
    time: String(body.time || "").trim(),
    venue: String(body.venue || "").trim(),
    city: String(body.city || "").trim(),
    category: String(body.category || body.genre || "Concerts").trim(),
    image: String(body.image || "").trim(),
    description: String(body.description || "").trim(),
    price: Number(body.price || 0),
    rows,
    seatsPerRow,
    totalSeats: rows * seatsPerRow,
  };
}

export const handler = async (event) => {
  if (event?.httpMethod === "OPTIONS") {
    return response(200, {}, event);
  }

  if (event?.httpMethod !== "POST") {
    return response(405, { message: "Method not allowed" }, event);
  }

  const body = readJsonBody(event.body);
  if (!body) {
    return response(400, { message: "Invalid JSON body" }, event);
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

    const payload = sanitizePayload(body);

    if (!payload.title || !payload.artist || !payload.date || !payload.time || !payload.venue || !payload.city) {
      return response(400, { message: "Missing required fields" }, event);
    }

    if (payload.price < 0) {
      return response(400, { message: "Price must be 0 or greater" }, event);
    }

    connection = await getDbConnection(secrets);

    const [showResult] = await connection.execute(
      `INSERT INTO shows
      (shwTitle, shwArtist, shwDate, shwTime, shwLocation, shwCity, shwCategory, shwImage, shwDetails, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        payload.title,
        payload.artist,
        payload.date,
        payload.time,
        payload.venue,
        payload.city,
        payload.category,
        payload.image,
        payload.description,
      ],
    );

    const showId = showResult.insertId;

    await connection.execute(
      `INSERT INTO show_tickets (shtShowID, shtPrice, shtTotalTickets)
      VALUES (?, ?, ?)`,
      [showId, payload.price, payload.totalSeats],
    );

    return response(
      201,
      {
        message: "Event created successfully",
        event: {
          id: String(showId),
          title: payload.title,
          artist: payload.artist,
          date: payload.date,
          time: payload.time,
          venue: payload.venue,
          city: payload.city,
          genre: payload.category,
          price: payload.price,
          seats: {
            total: payload.totalSeats,
            rows: payload.rows,
            seatsPerRow: payload.seatsPerRow,
          },
        },
      },
      event,
    );
  } catch (error) {
    console.error("admin-create-event error:", error);
    return response(500, { message: "Internal server error" }, event);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
