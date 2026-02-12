# 🚀 How to Deploy Showtime228 to AWS S3

**Complete step-by-step guide to host your website on Amazon S3**

---

## 📖 What You Need to Know

This is a **React website** (Single Page Application). You can host it on Amazon S3 for free or very cheap (about $0.50-1.00 per month for small traffic).

**What is S3?** Amazon's cloud storage that can also host websites.

---

## ✅ Before You Start

### 1. You Need These Tools

**AWS Account**
- Go to [aws.amazon.com](https://aws.amazon.com)
- Create a free account (requires credit card but won't charge for small usage)

**AWS CLI** (command line tool)
```bash
# On Mac
brew install awscli

# Check if installed
aws --version
```

**Node.js and npm** (already installed if you ran `npm install`)
```bash
node --version   # Should show v18 or higher
npm --version    # Should show v10 or higher
```

### 2. Setup AWS CLI

Run this command and enter your information:
```bash
aws configure
```

You will need to enter:
1. **AWS Access Key ID** - Get this from AWS Console → IAM → Users → Security Credentials
2. **AWS Secret Access Key** - Get this from same place as above
3. **Default region name** - Type `us-east-1` (or choose your region)
4. **Default output format** - Type `json`

---

## 🎯 Deployment Method 1: Automatic Script (Easiest!)

### Step 1: Build Your Website

```bash
# Go to your project folder
cd /Users/azbest/Documents/showtime228

# Install dependencies (if not done already)
npm install

# Build production version
npm run build
```

This creates a `dist/` folder with your website files.

### Step 2: Run the Deployment Script

```bash
# Replace "my-showtime-app" with your bucket name
# Bucket name must be unique worldwide and lowercase
./deploy-s3.sh my-showtime-app us-east-1
```

**That's it!** The script will:
- Create S3 bucket
- Setup website hosting
- Upload all files
- Give you the URL

Your website will be at:
```
http://my-showtime-app.s3-website-us-east-1.amazonaws.com
```

---

## 🛠️ Deployment Method 2: Manual Steps (Understanding Each Step)

If you want to understand what happens, follow these manual steps:

### Step 1: Build Your Website

```bash
npm run build
```

Check that `dist/` folder was created.

### Step 2: Create S3 Bucket

```bash
# Create bucket (choose unique name)
aws s3 mb s3://my-showtime-app --region us-east-1
```

**Bucket name rules:**
- Must be unique worldwide
- Only lowercase letters, numbers, and hyphens
- Example: `showtime-tickets-2026`

### Step 3: Turn On Website Hosting

```bash
aws s3 website s3://my-showtime-app \
  --index-document index.html \
  --error-document index.html
```

⚠️ **IMPORTANT:** Error document MUST be `index.html` for React Router to work!

### Step 4: Allow Public Access

**Remove the block:**
```bash
aws s3api put-public-access-block \
  --bucket my-showtime-app \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

**Add bucket policy:**
```bash
# Create policy file
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-showtime-app/*"
    }
  ]
}
EOF

# Apply policy
aws s3api put-bucket-policy \
  --bucket my-showtime-app \
  --policy file://bucket-policy.json
```

**Remember:** Replace `my-showtime-app` with your bucket name!

### Step 5: Upload Your Files

```bash
aws s3 sync dist/ s3://my-showtime-app --delete --acl public-read
```

**What this does:**
- `sync` - Uploads files and removes old ones
- `dist/` - Your build folder
- `--delete` - Removes old files from S3
- `--acl public-read` - Makes files readable by everyone

### Step 6: Get Your Website URL

```bash
echo "Your website: http://my-showtime-app.s3-website-us-east-1.amazonaws.com"
```

Open this URL in your browser!

---

## 🧪 Testing After Deployment

Open these URLs in your browser and check they work:

1. **Home page:**
   ```
   http://my-showtime-app.s3-website-us-east-1.amazonaws.com/
   ```

2. **Events page:**
   ```
   http://my-showtime-app.s3-website-us-east-1.amazonaws.com/events
   ```

3. **Cart page:**
   ```
   http://my-showtime-app.s3-website-us-east-1.amazonaws.com/cart
   ```

**All pages should work!** No 404 errors.

If you see 404 errors on `/events` or `/cart`, go to [Troubleshooting](#troubleshooting) below.

---

## 🔄 Update Your Website (After Changes)

When you make changes to your code:

```bash
# 1. Build new version
npm run build

# 2. Upload to S3
aws s3 sync dist/ s3://my-showtime-app --delete --acl public-read
```

Or use npm script:
```bash
npm run deploy:s3
```

**Note:** Update bucket name in `package.json` first!

---

## ⚙️ Using AWS Console (Web Interface)

If you prefer clicking buttons instead of typing commands:

### 1. Create Bucket

1. Go to [S3 Console](https://s3.console.aws.amazon.com/)
2. Click **"Create bucket"**
3. Enter **Bucket name** (example: `showtime-app-2026`)
4. Select **Region** (example: `us-east-1`)
5. **UNCHECK** all "Block Public Access" options ⚠️
6. Confirm you understand the bucket will be public
7. Click **"Create bucket"**

### 2. Enable Website Hosting

1. Click on your bucket name
2. Go to **"Properties"** tab
3. Scroll down to **"Static website hosting"**
4. Click **"Edit"**
5. Select **"Enable"**
6. **Index document:** `index.html`
7. **Error document:** `index.html` ⚠️ **MUST BE index.html!**
8. Click **"Save changes"**
9. Copy the **"Bucket website endpoint"** URL

### 3. Add Bucket Policy

1. Go to **"Permissions"** tab
2. Scroll to **"Bucket policy"**
3. Click **"Edit"**
4. Paste this (replace `YOUR-BUCKET-NAME`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click **"Save changes"**

### 4. Upload Files

1. Go to **"Objects"** tab
2. Click **"Upload"**
3. Click **"Add files"** or **"Add folder"**
4. Select ALL files from your `dist/` folder
5. Click **"Upload"**
6. Wait for upload to complete

### 5. Open Your Website

Use the **Bucket website endpoint** from step 2:
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

---

## ⚠️ CRITICAL Settings (Why Your Site Might Not Work)

### Problem 1: Pages Show 404 Error

**Symptom:** Home page works, but `/events` or `/cart` shows 404

**Why:** S3 doesn't know about React Router. When you visit `/events`, S3 looks for a file called `events` and doesn't find it.

**Solution:** Set **Error document** to `index.html`

This tells S3: "If you can't find a file, show index.html instead". Then React Router will show the correct page.

**How to fix:**
```bash
aws s3 website s3://your-bucket \
  --index-document index.html \
  --error-document index.html
```

### Problem 2: Access Denied Error

**Symptom:** Browser shows "Access Denied" or "403 Forbidden"

**Why:** Files are not public

**Solution:** 
1. Check "Block Public Access" is OFF
2. Check Bucket Policy is added (see above)
3. Check files have `public-read` permission

**How to fix:**
```bash
# Turn off block
aws s3api put-public-access-block \
  --bucket your-bucket \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Upload with public access
aws s3 sync dist/ s3://your-bucket --acl public-read --delete
```

### Problem 3: Changes Don't Show

**Symptom:** You updated your code but website looks the same

**Why:** Browser cache or CloudFront cache

**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. If using CloudFront, invalidate cache (see below)

---

## 🌐 Adding HTTPS and Custom Domain (Optional but Recommended)

S3 website URLs only support HTTP (not secure). For HTTPS and custom domain like `www.showtime.com`, use **CloudFront**.

### Step 1: Create CloudFront Distribution

1. Go to [CloudFront Console](https://console.aws.amazon.com/cloudfront/)
2. Click **"Create distribution"**
3. **Origin domain:** Your S3 website endpoint (example: `my-bucket.s3-website-us-east-1.amazonaws.com`)
   - ⚠️ Use website endpoint, NOT regular S3 endpoint!
4. **Viewer protocol policy:** Redirect HTTP to HTTPS
5. Click **"Create distribution"**
6. Wait 15-20 minutes for deployment

### Step 2: Fix 404 Errors (CRITICAL!)

CloudFront needs custom error pages for React Router:

1. Open your distribution
2. Go to **"Error pages"** tab
3. Click **"Create custom error response"**

**Create TWO rules:**

**Rule 1:**
- HTTP error code: `403: Forbidden`
- Customize error response: Yes
- Response page path: `/index.html`
- HTTP response code: `200: OK`

**Rule 2:**
- HTTP error code: `404: Not Found`
- Customize error response: Yes
- Response page path: `/index.html`
- HTTP response code: `200: OK`

### Step 3: Get Your HTTPS URL

1. Copy **Distribution domain name** (example: `d111111abcdef8.cloudfront.net`)
2. Your website is now at: `https://d111111abcdef8.cloudfront.net`

### Step 4: Add Custom Domain (Optional)

**You need:**
- A domain name (buy from GoDaddy, Namecheap, etc.)
- SSL certificate from AWS Certificate Manager

**Steps:**

1. **Get SSL Certificate:**
   - Go to [Certificate Manager](https://console.aws.amazon.com/acm/) in **us-east-1** region
   - Click **"Request certificate"**
   - Enter your domain: `showtime.com` and `*.showtime.com`
   - Choose **DNS validation**
   - Add the CNAME records to your domain DNS

2. **Add Domain to CloudFront:**
   - Open your CloudFront distribution
   - Click **"Edit"**
   - **Alternate domain names:** Add `showtime.com` and `www.showtime.com`
   - **Custom SSL certificate:** Select your certificate
   - Click **"Save changes"**

3. **Update DNS:**
   - Go to your domain provider (GoDaddy, Namecheap, etc.)
   - Add CNAME record:
     ```
     Type: CNAME
     Name: www
     Value: d111111abcdef8.cloudfront.net
     ```

Now your website is at `https://www.showtime.com` 🎉

### Updating with CloudFront

When you update your site, you need to clear CloudFront cache:

```bash
# Upload new files
aws s3 sync dist/ s3://my-bucket --delete --acl public-read

# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

Or use npm script:
```bash
npm run deploy:s3:cf
```

---

## 💰 How Much Does This Cost?

### S3 Only (No CloudFront)

For a small website with ~10,000 visitors per month:

- **Storage:** 50 MB = $0.001/month
- **Requests:** 50,000 requests = $0.02/month
- **Data transfer:** First 100 GB free

**Total: About $0.50 - $1.00 per month**

### With CloudFront

- **First year:** FREE (1 TB transfer, 10M requests per month)
- **After free tier:** ~$1-2 per month for small traffic

### Free Tier

AWS gives you for 12 months:
- 5 GB S3 storage
- 20,000 GET requests
- 2,000 PUT requests
- 1 TB CloudFront data transfer
- 10M CloudFront requests

**Your small website will likely be FREE for the first year!**

---

## 🔧 Troubleshooting

### Error: "Bucket already exists"

**Problem:** Bucket name is taken (bucket names are global)

**Solution:** Choose a different name
```bash
aws s3 mb s3://showtime-app-2026-feb --region us-east-1
```

### Error: "AWS CLI not found"

**Problem:** AWS CLI not installed

**Solution:** Install it
```bash
# Mac
brew install awscli

# Check
aws --version
```

### Error: "Access Key not configured"

**Problem:** AWS credentials not set up

**Solution:** Run `aws configure` and enter your credentials

### 404 on /events or /cart pages

**Problem:** Error document not set correctly

**Solution:**
```bash
aws s3 website s3://your-bucket \
  --error-document index.html
```

### Access Denied when opening website

**Problem:** Bucket not public or policy missing

**Solution:**
1. Check Block Public Access is OFF
2. Add bucket policy (see above)
3. Re-upload with `--acl public-read`

### Changes not showing after update

**Problem:** Browser or CloudFront cache

**Solution:**
```bash
# Clear CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id ID \
  --paths "/*"

# Or hard refresh browser: Ctrl+Shift+R
```

### Website is slow

**Problem:** S3 without CDN

**Solution:** Use CloudFront (see above) for global fast delivery

---

## 📝 Quick Command Reference

```bash
# Build website
npm run build

# Create bucket
aws s3 mb s3://bucket-name --region us-east-1

# Setup website hosting
aws s3 website s3://bucket-name \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://bucket-name --delete --acl public-read

# List your buckets
aws s3 ls

# Delete bucket (careful!)
aws s3 rb s3://bucket-name --force

# Check AWS CLI config
aws configure list

# Get region
aws configure get region
```

---

## ✅ Deployment Checklist

Before going live, check all these:

### Build
- [ ] `npm run build` works without errors
- [ ] `dist/` folder created
- [ ] Files in `dist/` look correct

### S3 Setup
- [ ] Bucket created
- [ ] Website hosting enabled
- [ ] Index document = `index.html`
- [ ] Error document = `index.html` ⚠️
- [ ] Block Public Access = OFF
- [ ] Bucket policy added
- [ ] Files uploaded

### Testing
- [ ] Home page loads (/)
- [ ] Events page works (/events)
- [ ] Cart page works (/cart)
- [ ] Event detail works (/event/1)
- [ ] 404 page shows for invalid URLs
- [ ] All images load
- [ ] Mobile view works

### Optional (For Production)
- [ ] CloudFront distribution created
- [ ] Custom error pages configured
- [ ] HTTPS working
- [ ] Custom domain added
- [ ] SSL certificate valid

---

## 🎯 Next Steps After Deployment

### Monitor Your Website

1. **Check AWS Costs:**
   - Go to [Billing Dashboard](https://console.aws.amazon.com/billing/)
   - Set up billing alert (recommended: alert at $5)

2. **Website Uptime:**
   - Use [UptimeRobot](https://uptimerobot.com/) (free)
   - Checks your website every 5 minutes

3. **Analytics:**
   - Add Google Analytics to track visitors
   - See what pages people visit

### Make It Faster

1. **Enable CloudFront** (if not done)
2. **Enable compression** in CloudFront
3. **Optimize images** before uploading

### Make It Better

1. **Add real backend** (AWS Lambda, API Gateway)
2. **Add payments** (Stripe integration)
3. **Add email** (AWS SES for notifications)
4. **Add database** (DynamoDB for tickets)

---

## 📚 Helpful Resources

### AWS Documentation
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS Free Tier](https://aws.amazon.com/free/)

### Learning
- [AWS Getting Started](https://aws.amazon.com/getting-started/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Vite Static Deploy](https://vitejs.dev/guide/static-deploy.html)

### Tools
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [AWS Calculator](https://calculator.aws/) - Estimate costs
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)

---

## 🎉 You're Done!

Your website is now live on the internet! 🚀

**Your website URL:**
```
http://your-bucket-name.s3-website-us-east-1.amazonaws.com
```

**With CloudFront:**
```
https://your-distribution.cloudfront.net
```

**With custom domain:**
```
https://www.your-domain.com
```

Share this URL with your friends and enjoy your live website!

---

## 💡 Pro Tips

1. **Save your bucket name** - Write it down, you'll need it for updates

2. **Create update script** - Make a file `update.sh`:
   ```bash
   #!/bin/bash
   npm run build
   aws s3 sync dist/ s3://your-bucket --delete --acl public-read
   echo "Website updated!"
   ```

3. **Use npm scripts** - Already added to `package.json`:
   ```bash
   npm run deploy:s3
   ```

4. **Test locally first** - Always run `npm run preview` before deploying

5. **Backup your dist/** - Keep a copy in case something goes wrong

---

**Need help?** Check the [Troubleshooting](#troubleshooting) section or search Google for your error message.

**Good luck with your deployment! 🎊**
