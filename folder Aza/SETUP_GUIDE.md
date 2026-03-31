# RockTime — Full AWS Setup Guide
**Last updated: 2026-03-27**

> Legend: ✅ Done | ❌ Still TODO (manual in AWS)

---

## CODE STATUS — Everything below is already deployed via GitHub

| What | Status |
|------|--------|
| Frontend `Checkout.tsx` calls `/booking`, handles Stripe redirect | ✅ |
| `events/checkout.js` — creates Stripe Checkout Session | ✅ |
| `events/webhook.js` — verifies signature, saves bookings to DB | ✅ |
| `index.js` — routes `/booking`, `/checkout`, `/webhook` all wired | ✅ |
| `config/stripeSecret.js` — reads `stripekey` secret as JSON | ✅ |
| `@aws-sdk/client-secrets-manager` in `package.json` | ✅ |
| Frontend GitHub Actions — auto-builds before S3 sync on every push | ✅ |
| Lambda GitHub Actions — auto-zips and deploys on every push | ✅ |

---

## MANUAL AWS STEPS REMAINING

### ❌ Step 1 — Fix `stripekey` secret in Secrets Manager

**AWS Console → Secrets Manager → `stripekey` → Retrieve secret value → Edit**

It MUST be a JSON object (not a plain string):
```json
{
  "STRIPE_SECRET_KEY": "sk_live_...",
  "STRIPE_WEBHOOK_SECRET": "whsec_..."
}
```
> Get `STRIPE_WEBHOOK_SECRET` after completing Step 3, then come back and add it.

---

### ❌ Step 2 — Increase Lambda timeout to 30 seconds

**AWS Console → Lambda → `rockTimeAPI` → Configuration → General configuration → Edit**
- Timeout: `0 min 30 sec`
- Save

---

### ❌ Step 3 — Add `/webhook` resource in API Gateway

**AWS Console → API Gateway → your API → Resources**

1. Click root `/` → **Actions → Create Resource**
   - Resource name: `webhook` / path: `/webhook`
   - ✅ Enable CORS
   - Create Resource
2. Click `/webhook` → **Actions → Create Method → POST → ✓**
   - Integration: Lambda Function + ✅ Lambda Proxy Integration
   - Function: `rockTimeAPI` → Save → OK
3. **Actions → Deploy API → Stage: `dev` → Deploy**

---

### ❌ Step 4 — Register webhook endpoint in Stripe

[Stripe Dashboard → Developers → Webhooks → Add endpoint](https://dashboard.stripe.com/webhooks)

- URL: `https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/webhook`
- Event: `checkout.session.completed`
- Click **Add endpoint**
- Click **Reveal** under Signing secret → copy `whsec_...`
- Go back to **Step 1** and add it as `STRIPE_WEBHOOK_SECRET`

---

### ❌ Step 5 — Fix S3 routing (404 on /cart, /checkout)

**AWS Console → S3 → `rocktime-webapp` → Properties → Static website hosting → Edit**
- Error document: `index.html`
- Save

---

## API REFERENCE — New Endpoints

---

### Create Stripe Checkout Session
Method: `POST`
`https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/booking`

Body:
```json
{
  "items": [
    {
      "eventId": "1",
      "eventTitle": "Neon Horizon World Tour",
      "seatNumbers": [5, 6],
      "pricePerSeat": 95.00,
      "date": "2026-03-15",
      "time": "20:00",
      "venue": "Madison Square Garden"
    }
  ],
  "customerEmail": "user@example.com",
  "userId": 1,
  "successUrl": "http://rocktime-webapp.s3-website-us-east-1.amazonaws.com/checkout?stripe=success",
  "cancelUrl": "http://rocktime-webapp.s3-website-us-east-1.amazonaws.com/checkout?stripe=cancel"
}
```

Result:
```json
{
  "sessionId": "cs_test_abc123...",
  "url": "https://checkout.stripe.com/c/pay/cs_test_abc123..."
}
```
> Frontend redirects user to `url`. After payment Stripe redirects back to `successUrl`.

Required fields:

| Field | Type | Required |
|-------|------|----------|
| `items` | array | ✅ must have at least 1 |
| `items[].eventId` | string | ✅ |
| `items[].eventTitle` | string | ✅ shown on Stripe page |
| `items[].seatNumbers` | number[] | ✅ |
| `items[].pricePerSeat` | number | ✅ |
| `items[].date` | string | ✅ shown on Stripe page |
| `items[].time` | string | ✅ shown on Stripe page |
| `items[].venue` | string | ✅ shown on Stripe page |
| `customerEmail` | string | recommended |
| `userId` | number | recommended (for saving booking) |
| `successUrl` | string | optional |
| `cancelUrl` | string | optional |

---

### Stripe Webhook (called automatically by Stripe, not by frontend)
Method: `POST`
`https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/webhook`

> ⚠️ This endpoint is called by **Stripe**, not by your app. After payment succeeds, Stripe sends `checkout.session.completed` here, and the Lambda saves the booking rows to the database.

Result (Stripe expects `200`):
```json
{ "received": true }
```

What gets saved to DB (one row per seat):

| Column | Value |
|--------|-------|
| `bokTicket` | `showTickets.shtID` for the event |
| `bokSeatNumber` | each seat number |
| `bokIndividual` | `users.usrID` |
| `bokStatus` | `'Booked'` |
| `bokPayMethod` | `'Stripe'` |
| `bokPayRef` | Stripe session ID |
| `bokEntryTime` | timestamp |

---

## DO IN THIS ORDER RIGHT NOW

```
1. ❌ Secrets Manager → fix stripekey to be proper JSON
2. ❌ Lambda → timeout 30s
3. ❌ API Gateway → add /webhook + redeploy stage
4. ❌ Stripe → register webhook URL → copy whsec_ → add to stripekey secret
5. ❌ S3 → error document = index.html
```

