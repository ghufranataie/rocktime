# Get My Tickets Lambda Setup (Simple Guide)

This Lambda returns purchased tickets for one user.

## 1) Create Lambda
- Name: `get-my-tickets`
- Runtime: `Node.js 20.x`
- Upload this folder
- Handler: `index.handler`

## 2) Install dependencies
- `npm install`
- Zip and upload

## 3) Secrets Manager
Use DB values in secret:

```json
{
  "DB_HOST": "...",
  "DB_USER": "...",
  "DB_PASSWORD": "...",
  "DB_NAME": "...",
  "DB_PORT": 3306
}
```

## 4) Lambda env vars
Set:
- `SECRET_ID=showtime228/app`
- `ALLOWED_ORIGINS=http://localhost:8080,http://rocktime-webapp.s3-website-us-east-1.amazonaws.com`

## 5) API Gateway route
Create route:
- `GET /my-tickets`
- `OPTIONS /my-tickets`

## 6) Request example
`GET /my-tickets?email=user@example.com`

## 7) Security note
For production, replace `email` query with JWT authorizer user claims.
