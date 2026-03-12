# 🎫 Stripe Payment Setup Guide for Showtime228

## How Our App Works Right Now (Quick Overview)

Our app is a **ticket booking website** hosted on **Amazon S3**. Here is how data flows:

```
User's Browser (S3 website)
       ↓ (HTTPS request)
   API Gateway
       ↓ (triggers)
   Lambda Function
       ↓ (reads/writes)
   MySQL Database (RDS)
```

**Example from our project:** The About page (`About.tsx`) fetches founder names like this:
```
Frontend → GET https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/founders → Lambda → MySQL → response
```

We are going to do the **same thing** for payments, but we also add **Stripe** (a payment service) and **AWS Secrets Manager** (to safely store passwords and API keys).

---

## What We Are Building

When a user wants to buy tickets, here is the full flow:

```
1. User selects seats and clicks "Pay"
2. Frontend sends cart data to our API Gateway → POST /checkout
3. Lambda #1 (create-checkout-session):
   - Gets Stripe secret key from AWS Secrets Manager
   - Creates a Stripe Checkout Session
   - Returns a Stripe URL to the frontend
4. Frontend redirects user to Stripe's payment page
5. User enters card info and pays ON STRIPE'S WEBSITE (not ours!)
6. Stripe sends a webhook (POST request) to our API Gateway → POST /stripe-webhook
7. Lambda #2 (stripe-webhook):
   - Verifies the request is really from Stripe
   - Gets database credentials from Secrets Manager
   - Saves the booking (tickets) to MySQL
8. User gets redirected back to our success page
```

**Why Stripe?** → We never touch credit card numbers. Stripe handles all the payment stuff. This is safer and easier.

**Why Secrets Manager?** → We never put passwords or API keys in our code. Secrets Manager stores them safely and our Lambda functions ask for them when needed.

---

## Step-by-Step Setup

### STEP 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"** and create an account
3. After signing up, you will be on the **Stripe Dashboard**
4. By default you are in **Test Mode** (you can see a toggle at the top). Keep it in Test Mode for now — no real money will be charged

#### Get Your Stripe Keys

1. In the Stripe Dashboard, click **"Developers"** in the left sidebar
2. Click **"API Keys"**
3. You will see two keys:
   - **Publishable key** → starts with `pk_test_...` (used on frontend — we don't need this now)
   - **Secret key** → starts with `sk_test_...` (used on backend — **this is what we need**)
4. Click **"Reveal test key"** to see the Secret key
5. **Copy both keys** and save them somewhere safe (like a text file on your computer for now)

> ⚠️ **NEVER** put your Secret key in your code or commit it to GitHub!

---

### STEP 2: Store Stripe Keys in AWS Secrets Manager

AWS Secrets Manager is like a safe. We put our passwords and keys there, and our Lambda functions can open the safe when they need them.

#### Create the Secret

1. Go to **AWS Console** → Search for **"Secrets Manager"** → Click on it
2. Click **"Store a new secret"**
3. Choose **"Other type of secret"**
4. Click **"Plaintext"** tab and paste this JSON (replace the placeholder values with your real values):

```json
{
  "STRIPE_SECRET_KEY": "sk_test_YOUR_STRIPE_SECRET_KEY_HERE",
  "STRIPE_WEBHOOK_SECRET": "whsec_YOUR_WEBHOOK_SECRET_HERE",
  "DB_HOST": "your-database-endpoint.rds.amazonaws.com",
  "DB_USER": "your_database_username",
  "DB_PASSWORD": "your_database_password",
  "DB_NAME": "your_database_name",
  "DB_PORT": "3306"
}
```

> 📝 **Note:** You will get the `STRIPE_WEBHOOK_SECRET` later in Step 6. For now, put a placeholder like `"whsec_placeholder"` and come back to update it.

> 📝 **Note:** The DB_HOST, DB_USER, DB_PASSWORD, and DB_NAME should be the same values your other Lambda functions use to connect to your MySQL database. Ask your teammate if you don't know these.

5. Click **"Next"**
6. For **Secret name**, type: `showtime228/stripe`
7. Add a description like: "Stripe and DB credentials for Showtime228 payment system"
8. Click **"Next"** → **"Next"** → **"Store"**

✅ Done! Your secret is now saved in AWS.

---

### STEP 3: Create the Database Table for Bookings

We need a table in our MySQL database to store bookings. Connect to your database (using MySQL Workbench, DBeaver, or the terminal) and run this SQL:

```sql
-- Add a Stripe session column to the existing bookings table
-- (If your bookings table already exists, just add the new column)

-- Option A: If the bookings table does NOT exist yet, create it:
CREATE TABLE IF NOT EXISTS bookings (
    bokID INT AUTO_INCREMENT PRIMARY KEY,
    bokUserID INT NOT NULL,
    bokShowTicketID INT NOT NULL,
    bokSeatNumber INT NOT NULL,
    bokDate DATETIME NOT NULL,
    bokStripeSessionID VARCHAR(255),
    bokStatus ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed',
    FOREIGN KEY (bokUserID) REFERENCES users(usrID),
    FOREIGN KEY (bokShowTicketID) REFERENCES show_tickets(shtID)
);

-- Option B: If the bookings table ALREADY exists, just add the Stripe column:
ALTER TABLE bookings
ADD COLUMN bokStripeSessionID VARCHAR(255) AFTER bokDate;

ALTER TABLE bookings
ADD COLUMN bokStatus ENUM('confirmed', 'cancelled', 'pending') DEFAULT 'confirmed' AFTER bokStripeSessionID;
```

> 📝 **Note:** Choose Option A or Option B, not both. Check if the table exists first. The table and column names must match what the Lambda function uses. If your existing table has different column names, update the Lambda code to match.

---

### STEP 4: Create Lambda Function #1 — Create Checkout Session

This Lambda creates a Stripe Checkout Session when the user wants to pay.

#### 4.1 — Prepare the Code for Upload

1. Open your terminal
2. Go to the Lambda folder:
   ```bash
   cd folder/create-checkout-session
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Create a ZIP file with everything inside:
   ```bash
   zip -r create-checkout-session.zip .
   ```

#### 4.2 — Create the Lambda on AWS

1. Go to **AWS Console** → Search for **"Lambda"** → Click on it
2. Click **"Create function"**
3. Choose **"Author from scratch"**
4. Settings:
   - **Function name:** `showtime228-create-checkout-session`
   - **Runtime:** `Node.js 20.x`
   - **Architecture:** `x86_64`
5. Click **"Create function"**

#### 4.3 — Upload the Code

1. On the Lambda page, scroll down to **"Code source"**
2. Click **"Upload from"** → **".zip file"**
3. Upload the `create-checkout-session.zip` file you created
4. Click **"Save"**

#### 4.4 — Set the Handler

1. Go to **"Runtime settings"** → Click **"Edit"**
2. Set **Handler** to: `index.handler`
3. Click **"Save"**

#### 4.5 — Increase Timeout

By default Lambda times out after 3 seconds. We need more because we call Stripe and Secrets Manager.

1. Go to **"Configuration"** tab → **"General configuration"** → Click **"Edit"**
2. Set **Timeout** to: **30 seconds**
3. Set **Memory** to: **256 MB**
4. Click **"Save"**

#### 4.6 — Give Lambda Permission to Read Secrets

The Lambda needs permission to read from Secrets Manager.

1. Go to **"Configuration"** tab → **"Permissions"**
2. Click on the **Role name** (it's a link like `showtime228-create-checkout-session-role-xxxxx`)
3. This opens IAM in a new tab
4. Click **"Add permissions"** → **"Attach policies"**
5. Search for `SecretsManagerReadWrite`
6. Check the box next to **"SecretsManagerReadWrite"**
7. Click **"Add permissions"**

> 💡 **Better practice for production:** Instead of SecretsManagerReadWrite (which gives full access), you can create a custom policy that only allows reading the specific secret `showtime228/stripe`. But for a school project, SecretsManagerReadWrite is fine.

---

### STEP 5: Create Lambda Function #2 — Stripe Webhook

This Lambda handles the callback from Stripe after a successful payment.

#### 5.1 — Prepare the Code for Upload

1. Open your terminal
2. Go to the Lambda folder:
   ```bash
   cd folder/stripe-webhook
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Create a ZIP file:
   ```bash
   zip -r stripe-webhook.zip .
   ```

#### 5.2 — Create the Lambda on AWS

1. Same steps as Step 4.2, but use these settings:
   - **Function name:** `showtime228-stripe-webhook`
   - **Runtime:** `Node.js 20.x`
   - **Architecture:** `x86_64`
2. Upload the ZIP file (same as Step 4.3)
3. Set Handler to `index.handler` (same as Step 4.4)
4. Set Timeout to **30 seconds**, Memory to **256 MB** (same as Step 4.5)
5. Add **SecretsManagerReadWrite** permission (same as Step 4.6)

#### 5.3 — Important: Webhook Lambda Needs VPC Access (If Your Database is in a VPC)

If your MySQL database is inside a VPC (Virtual Private Cloud), the Lambda needs to be in the same VPC to connect to it.

1. Go to Lambda → **"Configuration"** tab → **"VPC"** → Click **"Edit"**
2. Select the **same VPC** as your database
3. Select the **same subnets** as your database
4. Select a **security group** that allows connections to your database
5. Click **"Save"**

> 📝 Ask your teammate which VPC, subnets, and security group the other Lambda functions use, and use the same ones.

---

### STEP 6: Set Up API Gateway

Now we need to create API endpoints so our frontend can call these Lambda functions.

#### 6.1 — Open Your Existing API Gateway

Since you already have API Gateway set up (the `/dev/founders` and `/dev/events` endpoints), we will add new routes to the **same API**.

1. Go to **AWS Console** → Search for **"API Gateway"** → Click on it
2. Find and click on your existing API (the one that has the `/founders` and `/events` routes)

#### 6.2 — Create the Checkout Endpoint

1. Click **"Resources"** in the left sidebar
2. Click **"Create Resource"**
3. **Resource name:** `checkout`
4. **Resource path:** `/checkout`
5. Check ✅ **"Enable API Gateway CORS"**
6. Click **"Create Resource"**

Now add a POST method:

1. Click on the `/checkout` resource you just created
2. Click **"Create Method"**
3. Choose **POST**
4. **Integration type:** Lambda Function
5. Check ✅ **"Lambda Proxy integration"** (this is important!)
6. **Lambda Function:** select `showtime228-create-checkout-session`
7. Click **"Create Method"**

#### 6.3 — Create the Webhook Endpoint

1. Click **"Resources"** again
2. Click **"Create Resource"**
3. **Resource name:** `stripe-webhook`
4. **Resource path:** `/stripe-webhook`
5. Check ✅ **"Enable API Gateway CORS"**
6. Click **"Create Resource"**

Add a POST method:

1. Click on the `/stripe-webhook` resource
2. Click **"Create Method"** → **POST**
3. **Integration type:** Lambda Function
4. Check ✅ **"Lambda Proxy integration"**
5. **Lambda Function:** select `showtime228-stripe-webhook`
6. Click **"Create Method"**

> ⚠️ **IMPORTANT for Webhook:** Stripe sends the raw request body for signature verification. By using "Lambda Proxy integration", the raw body is available in `event.body`. Do NOT add any request body mapping templates.

#### 6.4 — Deploy the API

1. Click **"Deploy API"** (button at the top)
2. Choose your existing stage (probably `dev`)
3. Click **"Deploy"**

After deploying, your new endpoints will be:
```
POST https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/checkout
POST https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/stripe-webhook
```

---

### STEP 7: Set Up Stripe Webhook

Now we need to tell Stripe to send payment events to our webhook endpoint.

1. Go to **Stripe Dashboard** → **"Developers"** → **"Webhooks"**
2. Click **"Add endpoint"**
3. **Endpoint URL:** paste your webhook URL:
   ```
   https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/stripe-webhook
   ```
4. Under **"Select events to listen to"**, click **"Select events"**
5. Find and check: **`checkout.session.completed`**
6. Click **"Add endpoint"**

#### Get the Webhook Secret

1. After creating the endpoint, click on it
2. You will see **"Signing secret"** — click **"Reveal"**
3. Copy the secret (starts with `whsec_...`)
4. Go back to **AWS Secrets Manager**
5. Find your secret `showtime228/stripe`
6. Click **"Retrieve secret value"** → **"Edit"**
7. Update the `STRIPE_WEBHOOK_SECRET` value with the real `whsec_...` value
8. Click **"Save"**

---

### STEP 8: Test Everything

#### Test with Stripe Test Cards

Stripe gives you fake credit card numbers for testing. No real money is charged.

| Card Number | What Happens |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment succeeds |
| `4000 0000 0000 0002` | ❌ Payment is declined |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure authentication |

For all test cards, use:
- **Expiry:** Any future date (like `12/34`)
- **CVC:** Any 3 digits (like `123`)
- **ZIP:** Any 5 digits (like `10001`)

#### Test Step by Step

1. **Test the Checkout Session API** (using a tool like Postman or curl):
   ```bash
   curl -X POST https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/checkout \
     -H "Content-Type: application/json" \
     -d '{
       "items": [{
         "eventId": "1",
         "eventTitle": "Test Concert",
         "seatNumbers": [5, 6],
         "pricePerSeat": 45,
         "date": "2026-04-15",
         "time": "8:00 PM",
         "venue": "Test Venue"
       }],
       "customerEmail": "test@example.com",
       "userId": 1,
       "successUrl": "http://localhost:5173/checkout?success=true",
       "cancelUrl": "http://localhost:5173/cart"
     }'
   ```

2. You should get a response like:
   ```json
   {
     "sessionId": "cs_test_...",
     "url": "https://checkout.stripe.com/c/pay/cs_test_..."
   }
   ```

3. Open that URL in your browser → You should see Stripe's payment page
4. Use the test card `4242 4242 4242 4242` to pay
5. Check your Lambda logs in **CloudWatch** to see if the webhook was received
6. Check your database to see if the booking was saved

#### How to Check Lambda Logs

1. Go to **AWS Console** → **CloudWatch** → **Log groups**
2. Find `/aws/lambda/showtime228-stripe-webhook`
3. Click on the latest log stream
4. You should see messages like:
   ```
   Payment successful! Session ID: cs_test_...
   Booking saved to database successfully!
   ```

---

## How to Connect This to the Frontend (Later)

> 📝 **Note:** Don't do this step yet. Wait until the authentication system is ready. This section is just for reference.

When you are ready to integrate with the frontend, you will update `Checkout.tsx` to call the API instead of the fake `handlePay` function. Here is an example of what the code will look like:

```tsx
// In Checkout.tsx, replace the handlePay function:

const handlePay = async () => {
  try {
    const response = await fetch(
      "https://f3nnaj8z43.execute-api.us-east-1.amazonaws.com/dev/checkout",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            eventId: item.eventId,
            eventTitle: item.eventTitle,
            seatNumbers: item.seatNumbers,
            pricePerSeat: item.pricePerSeat,
            date: item.date,
            time: item.time,
            venue: item.venue,
          })),
          customerEmail: form.email,
          userId: currentUser.id, // from authentication context
          successUrl: window.location.origin + "/checkout?success=true",
          cancelUrl: window.location.origin + "/cart",
        }),
      }
    );

    const data = await response.json();

    if (data.url) {
      // Redirect user to Stripe's payment page
      window.location.href = data.url;
    }
  } catch (error) {
    console.error("Checkout error:", error);
  }
};
```

After the user pays and gets redirected back, you can check the `success` query parameter and show the success screen:

```tsx
// Check if user just came back from Stripe
const searchParams = new URLSearchParams(window.location.search);
if (searchParams.get("success") === "true") {
  clearCart();
  setStep("success");
}
```

---

## Summary of What We Created

| Component | What It Does |
|---|---|
| **Secrets Manager** (`showtime228/stripe`) | Stores Stripe keys + DB credentials safely |
| **Lambda #1** (`create-checkout-session`) | Creates Stripe Checkout Session, returns URL |
| **Lambda #2** (`stripe-webhook`) | Handles Stripe webhook, saves booking to MySQL |
| **API Gateway** (`POST /checkout`) | Frontend calls this to start payment |
| **API Gateway** (`POST /stripe-webhook`) | Stripe calls this after payment |
| **Stripe Webhook** | Sends `checkout.session.completed` event to our API |

---

## File Structure

```
folder/
├── create-checkout-session/     ← Lambda #1
│   ├── index.mjs                ← The function code
│   └── package.json             ← Dependencies (stripe, aws-sdk, mysql2)
│
├── stripe-webhook/              ← Lambda #2
│   ├── index.mjs                ← The function code
│   └── package.json             ← Dependencies (stripe, aws-sdk, mysql2)
│
└── STRIPE_SETUP_INSTRUCTIONS.md ← This file (setup guide)
```

---

## Troubleshooting

### "Access Denied" error from Secrets Manager
→ Make sure you added the `SecretsManagerReadWrite` policy to your Lambda's IAM role (Step 4.6)

### "Task timed out" error
→ Increase the Lambda timeout to 30 seconds (Step 4.5)
→ If using VPC, make sure the Lambda can reach both the internet (for Stripe) and the database

### "Invalid webhook signature" error
→ Make sure the `STRIPE_WEBHOOK_SECRET` in Secrets Manager matches the one from Stripe Dashboard
→ Make sure API Gateway is using "Lambda Proxy integration" (so the raw body is passed through)

### "Cannot connect to database" error
→ Check DB credentials in Secrets Manager
→ If DB is in VPC, make sure Lambda is in the same VPC with proper security groups
→ Make sure the security group allows inbound traffic on port 3306

### Webhook not being received
→ Check that the webhook URL in Stripe Dashboard is correct
→ In Stripe Dashboard → Developers → Webhooks → Click your endpoint → Check "Attempts" to see if Stripe tried to send events

### Lambda needs internet access in VPC
→ If your Lambda is in a VPC, it cannot access the internet (Stripe API) by default
→ You need a **NAT Gateway** in your VPC. Ask your teammate or instructor about this if needed

---

## Going to Production (When Ready)

When you are ready to accept real payments:

1. In Stripe Dashboard, toggle from **"Test mode"** to **"Live mode"**
2. Get your **live** API keys (they start with `sk_live_...` instead of `sk_test_...`)
3. Update the secret in AWS Secrets Manager with the live keys
4. Create a new webhook endpoint in Stripe for the live mode
5. Update the webhook secret in Secrets Manager
6. Test with a real card (you can refund yourself immediately from the Stripe Dashboard)

---

**Good luck! 🚀**
