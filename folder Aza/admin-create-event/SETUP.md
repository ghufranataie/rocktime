# Admin Create Event Lambda Setup (Simple Guide)

This Lambda lets admin create a new event.

## 1) Create Lambda
- Name: `admin-create-event`
- Runtime: `Node.js 20.x`
- Upload code from this folder
- Handler: `index.handler`

## 2) Install dependencies
Inside this folder:
- `npm install`
- Zip and upload to Lambda

## 3) Add required values in Secrets Manager
In your secret JSON add:

```json
{
  "DB_HOST": "...",
  "DB_USER": "...",
  "DB_PASSWORD": "...",
  "DB_NAME": "...",
  "DB_PORT": 3306,
  "ADMIN_API_KEY": "your-very-strong-admin-key"
}
```

## 4) Lambda environment variables
Set:
- `SECRET_ID=showtime228/app`
- `ALLOWED_ORIGINS=http://localhost:8080,http://rocktime-webapp.s3-website-us-east-1.amazonaws.com`

## 5) API Gateway route
Create route:
- `POST /admin/events`
- `OPTIONS /admin/events`

Connect POST to this Lambda.

## 6) How frontend calls this API
Send header:
- `Authorization: Bearer <ADMIN_API_KEY>`
  OR
- `x-admin-key: <ADMIN_API_KEY>`

Body example:

```json
{
  "title": "Rock Night",
  "artist": "The Waves",
  "date": "2026-04-15",
  "time": "20:00",
  "venue": "Main Hall",
  "city": "Toronto",
  "category": "Concerts",
  "price": 70,
  "rows": 10,
  "seatsPerRow": 10,
  "description": "Live show"
}
```

## 7) CORS
Allow:
- Methods: `POST,OPTIONS`
- Headers: `Content-Type,Authorization,x-admin-key`
