# Stripe Webhook Lambda Setup (Simple Guide)

This Lambda listens to Stripe webhook and saves bought seats to DB.

## 1) Create Lambda
- Name: `stripe-webhook`
- Runtime: `Node.js 20.x`
- Upload this folder
- Handler: `index.handler`

## 2) Install dependencies
- `npm install`
- Zip and upload

## 3) Secrets Manager
Use secret like `showtime228/stripe` and include:

```json
{
  "STRIPE_SECRET_KEY": "sk_live_or_test_key",
  "STRIPE_WEBHOOK_SECRET": "whsec_...",
  "DB_HOST": "...",
  "DB_USER": "...",
  "DB_PASSWORD": "...",
  "DB_NAME": "...",
  "DB_PORT": 3306
}
```

## 4) Lambda env vars
Set:
- `SECRET_ID=showtime228/stripe`
- `ALLOWED_ORIGINS=http://localhost:8080,http://rocktime-webapp.s3-website-us-east-1.amazonaws.com`

## 5) API Gateway route
Create route:
- `POST /stripe-webhook`
- `OPTIONS /stripe-webhook`

Important:
- In API Gateway for this route, use raw body pass-through.
- Do not JSON-parse body before Stripe signature check.

## 6) Stripe dashboard webhook
In Stripe:
- Developers → Webhooks → Add endpoint
- URL: your API Gateway webhook URL
- Events: `checkout.session.completed`

## 7) Result
When payment succeeds:
- Lambda verifies Stripe signature
- Gets user and order items from metadata
- Saves booked seats to `bookings` table
