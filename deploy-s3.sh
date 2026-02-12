#!/bin/bash

# 🚀 Быстрый деплой Showtime228 на AWS S3
# Убедитесь, что AWS CLI настроен: aws configure

set -e

echo "🎯 Showtime228 - S3 Deployment Script"
echo "======================================"
echo ""

# Проверка AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI не установлен!"
    echo "Установите: brew install awscli"
    echo "Настройте: aws configure"
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен!"
    exit 1
fi

# Параметры (измените на свои)
BUCKET_NAME="${1:-showtime228-app}"
REGION="${2:-us-east-1}"

echo "📦 Bucket: $BUCKET_NAME"
echo "🌍 Region: $REGION"
echo ""

# Шаг 1: Сборка
echo "🔨 Шаг 1: Сборка production build..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Папка dist/ не найдена!"
    exit 1
fi

echo "✅ Сборка завершена"
echo ""

# Шаг 2: Создание bucket (если не существует)
echo "🪣 Шаг 2: Создание S3 bucket..."
if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
    aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    echo "✅ Bucket создан"
else
    echo "ℹ️  Bucket уже существует"
fi
echo ""

# Шаг 3: Настройка Static Website Hosting
echo "🌐 Шаг 3: Настройка Static Website Hosting..."
aws s3 website "s3://$BUCKET_NAME" \
    --index-document index.html \
    --error-document index.html
echo "✅ Static Website Hosting настроен"
echo ""

# Шаг 4: Отключение Block Public Access
echo "🔓 Шаг 4: Отключение Block Public Access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
echo "✅ Block Public Access отключен"
echo ""

# Шаг 5: Применение Bucket Policy
echo "🔐 Шаг 5: Применение Bucket Policy..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json
echo "✅ Bucket Policy применена"
echo ""

# Шаг 6: Загрузка файлов
echo "⬆️  Шаг 6: Загрузка файлов в S3..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete --acl public-read

echo "✅ Файлы загружены"
echo ""

# Получение URL
WEBSITE_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "======================================"
echo "🎉 Деплой завершен успешно!"
echo "======================================"
echo ""
echo "🌐 URL вашего сайта:"
echo "   $WEBSITE_URL"
echo ""
echo "📝 Следующие шаги (опционально):"
echo "   1. Настройте CloudFront для HTTPS"
echo "   2. Добавьте кастомный домен"
echo "   3. См. S3_DEPLOYMENT.md для деталей"
echo ""
echo "🧪 Проверьте, что все маршруты работают:"
echo "   - $WEBSITE_URL/"
echo "   - $WEBSITE_URL/events"
echo "   - $WEBSITE_URL/cart"
echo ""
