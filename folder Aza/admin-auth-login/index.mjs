import argon2 from "argon2";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

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
  const origin =
    event?.headers?.origin ||
    event?.headers?.Origin ||
    fallback;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return origin || fallback;
  }

  return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
};

const buildCorsHeaders = (event) => ({
  "Access-Control-Allow-Origin": resolveOrigin(event),
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
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
  const secretResult = await secretsClient.send(command);
  cachedSecrets = JSON.parse(secretResult.SecretString || "{}");
  return cachedSecrets;
}

async function verifyPassword(plainPassword, secrets) {
  if (secrets.ADMIN_PASSWORD_HASH) {
    return argon2.verify(secrets.ADMIN_PASSWORD_HASH, plainPassword);
  }

  if (secrets.ADMIN_PASSWORD) {
    return secrets.ADMIN_PASSWORD === plainPassword;
  }

  return false;
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

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return response(400, { message: "Email and password are required" }, event);
  }

  try {
    const secrets = await getSecrets();
    const adminEmail = String(secrets.ADMIN_EMAIL || "").trim().toLowerCase();
    const adminName = String(secrets.ADMIN_NAME || "ShowTime Admin");

    if (!adminEmail) {
      return response(500, { message: "Admin credentials are not configured" }, event);
    }

    const emailMatch = adminEmail === email;
    const passwordMatch = await verifyPassword(password, secrets);

    if (!emailMatch || !passwordMatch) {
      return response(401, { message: "Invalid admin credentials" }, event);
    }

    return response(
      200,
      {
        message: "Admin login successful",
        admin: {
          email: adminEmail,
          name: adminName,
          role: "admin",
        },
      },
      event,
    );
  } catch (error) {
    console.error("admin-auth-login error:", error);
    return response(500, { message: "Internal server error" }, event);
  }
};
