# Admin Auth Lambda Setup (Simple Guide)

This Lambda is for **admin login**.

## 1) Create Lambda
- Name: `admin-auth-login`
- Runtime: `Node.js 20.x`
- Upload code from this folder
- Handler: `index.handler`

## 2) Install dependencies
Inside this folder:
- `npm install`
- Zip files and upload to Lambda

## 3) Create secret in AWS Secrets Manager
Create a secret (JSON) like this:

```json
{
  "ADMIN_EMAIL": "admin@showtime.com",
  "ADMIN_PASSWORD": "Admin123!",
  "ADMIN_NAME": "ShowTime Admin"
}
```

This is the easiest setup and it works now.

Important:
- Secret name must match `SECRET_ID` in Lambda environment variables.

## 4) Lambda environment variables
Set:
- `SECRET_ID=showtime228/app`
- `ALLOWED_ORIGINS=http://localhost:8080,http://rocktime-webapp.s3-website-us-east-1.amazonaws.com`

## 5) API Gateway route
Create route:
- `POST /admin/auth`
- `OPTIONS /admin/auth`

Integrate `POST` with this Lambda.

## 6) CORS
Enable CORS for this route:
- Origins: your frontend URL
- Methods: `POST,OPTIONS`
- Headers: `Content-Type,Authorization`

## 7) Test request
```json
{
  "email": "admin@showtime.com",
  "password": "Admin123!"
}
```

Success response contains admin object.
