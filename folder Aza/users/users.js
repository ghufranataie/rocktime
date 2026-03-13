const getDBConnection = require('../config/db');
const argon2 = require('argon2');

const corsHeaders = {
    "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
};

const response = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
});

const parseJsonBody = (rawBody) => {
    if (!rawBody) return {};
    try {
        return JSON.parse(rawBody);
    } catch {
        return null;
    }
};

const generateRandomUsername = (length = 8) => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let username = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        username += characters[randomIndex];
    }
    return username;
};

exports.createUser = async (event) => {
    if (event?.httpMethod === "OPTIONS") {
        return response(200, {});
    }

    try {
        const db = await getDBConnection();
        const body = parseJsonBody(event?.body);

        if (!body) {
            return response(400, { message: "Invalid JSON body" });
        }

        const email = (body.usrEmail || body.email || "").trim().toLowerCase();
        const password = body.usrPass || body.password || "";
        const fullName = (body.usrFullName || body.fullName || body.fullname || "").trim();

        if (!email || !password || !fullName) {
            return response(400, { message: "Full name, email and password are required" });
        }

        const [existing] = await db.execute(
            "SELECT usrEmail FROM users WHERE usrEmail = ?",
            [email]
        );

        if (existing.length > 0) {
            return response(409, { message: "Email already exists" });
        }

        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id });
        let username = (body.usrName || body.username || "").trim();

        if (!username) {
            username = generateRandomUsername();
        }

        await db.execute(
            "INSERT INTO users (usrName, usrPassword, usrFullName, usrEmail) VALUES (?, ?, ?, ?)",
            [username, hashedPassword, fullName, email]
        );

        return response(201, {
            message: "Registration successful",
            user: {
                username,
                email,
                fullName
            }
        });
    } catch (err) {
        console.error("createUser failed", err);
        return response(500, { message: "Internal server error" });
    }
};

exports.getUsers = async (event) => {
    if (event?.httpMethod === "OPTIONS") {
        return response(200, {});
    }

    try {
        const db = await getDBConnection();
        const [rows] = await db.execute(`SELECT usrName, usrFullName, usrEmail FROM users`);
        return response(200, rows);
    } catch (err) {
        console.error("getUsers failed", err);
        return response(500, { message: "Internal server error" });
    }
};

exports.updateUser = async (event) => {
    if (event?.httpMethod === "OPTIONS") {
        return response(200, {});
    }

    try {
        const db = await getDBConnection();
        const body = parseJsonBody(event?.body);
        const id = event?.pathParameters?.id;

        if (!id) {
            return response(400, { message: "User id is required" });
        }

        if (!body) {
            return response(400, { message: "Invalid JSON body" });
        }

        const fullName = (body.usrFullName || body.fullName || body.fullname || "").trim();
        const email = (body.usrEmail || body.email || "").trim().toLowerCase();

        if (!fullName || !email) {
            return response(400, { message: "Full name and email are required" });
        }

        await db.execute(
            "UPDATE users SET usrFullName=?, usrEmail=? WHERE id=?",
            [fullName, email, id]
        );

        return response(200, { message: "Updated" });
    } catch (err) {
        console.error("updateUser failed", err);
        return response(500, { message: "Internal server error" });
    }
};

exports.deleteUser = async (event) => {
    if (event?.httpMethod === "OPTIONS") {
        return response(200, {});
    }

    try {
        const db = await getDBConnection();
        const id = event?.pathParameters?.id;

        if (!id) {
            return response(400, { message: "User id is required" });
        }

        await db.execute(
            "DELETE FROM users WHERE id=?",
            [id]
        );

        return response(200, { message: "Deleted" });
    } catch (err) {
        console.error("deleteUser failed", err);
        return response(500, { message: "Internal server error" });
    }
};