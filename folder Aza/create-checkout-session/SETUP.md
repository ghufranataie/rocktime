# Stripe Checkout Session Lambda Setup (Simple Guide)

This Lambda creates Stripe Checkout URL for cart payment.

## 1) Create Lambda
- Name: `create-checkout-session`
- Runtime: `Node.js 20.x`
- Upload this folder
- Handler: `index.handler`

## 2) Install dependencies
- `npm install`
- Zip and upload

## 3) Secrets Manager
Add Stripe keys in secret (example name: `showtime228/stripe`):

```json
{
  "STRIPE_SECRET_KEY": "sk_live_or_test_key"
}
```

## 4) Lambda env vars
Set:
- `SECRET_ID=showtime228/stripe`
- `ALLOWED_ORIGINS=http://localhost:8080,http://rocktime-webapp.s3-website-us-east-1.amazonaws.com`

## 5) API Gateway route
Create route:
- `POST /checkout`
- `OPTIONS /checkout`

## 6) Request body example
```json
{
  "items": [
    {
      "eventId": "1",
      "eventTitle": "Rock Night",
      "seatNumbers": [10, 11],
      "pricePerSeat": 70,
      "date": "2026-04-15",
      "time": "20:00",
      "venue": "Main Hall"
    }
  ],
  "customerEmail": "user@example.com",
  "userId": 12,
  "successUrl": "http://localhost:8080/checkout/success",
  "cancelUrl": "http://localhost:8080/cart"
}
```

## 7) Response
Returns:
- `sessionId`
- `url` (redirect user to this Stripe URL)
