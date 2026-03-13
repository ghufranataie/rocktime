# Admin Users + Tickets Lambda Setup (Simple Guide)

This Lambda returns all users and all tickets they bought.

## 1) Create Lambda
- Name: `admin-get-users-tickets`
- Runtime: `Node.js 20.x`
- Upload this folder
- Handler: `index.handler`

## 2) Install dependencies
Inside this folder:
- `npm install`
- Zip and upload

## 3) Secrets Manager
Use same secret as other admin lambdas:

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
- `GET /admin/users-tickets`
- `OPTIONS /admin/users-tickets`

Connect GET to this Lambda.

## 6) Request auth
Send one of these:
- `Authorization: Bearer <ADMIN_API_KEY>`
- `x-admin-key: <ADMIN_API_KEY>`

## 7) Response
You get:
- list of users
- each user has `tickets[]`
