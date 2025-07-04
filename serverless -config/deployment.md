# Serverless Platform Deployment Guide

Complete step-by-step guide for deploying the Serverless Platform Dashboard infrastructure on AWS.

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS Account with administrative privileges
- AWS CLI installed and configured
- Sufficient service limits for the deployment

### 2. Required Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install SAM CLI
pip install aws-sam-cli

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installations
aws --version
sam --version
node --version
npm --version
```

### 3. AWS Configuration
```bash
# Configure AWS credentials
aws configure
# AWS Access Key ID: [Your Access Key]
# AWS Secret Access Key: [Your Secret Key]
# Default region name: us-east-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

## 🚀 Quick Start Deployment

### Option 1: Automated Deployment Script
```bash
#!/bin/bash
# deploy.sh - Complete deployment script

set -e

echo "🚀 Starting Serverless Platform Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
cd lambda-functions/user-authentication && npm install
cd ../data-processor && npm install
cd ../api-handler && npm install
cd ../..

# 2. Validate template
echo "✅ Validating CloudFormation template..."
sam validate --template cloudformation/infrastructure.yaml

# 3. Build application
echo "🔨 Building SAM application..."
sam build --template cloudformation/infrastructure.yaml

# 4. Deploy to AWS
echo "☁️ Deploying to AWS..."
sam deploy \
  --template-file cloudformation/infrastructure.yaml \
  --stack-name serverless-platform-dev \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=dev \
    ProjectName=serverless-platform \
    NotificationEmail=vra.9618@gmail.com \
    JWTSecret=$(openssl rand -base64 32) \
  --no-confirm-changeset

echo "✅ Deployment completed successfully!"
echo "📋 Check outputs for API Gateway URL and other resources"
```

### Option 2: Manual Step-by-Step

#### Step 1: Prepare Environment
```bash
# Clone and navigate to project
git clone https://github.com/Reaishma/serverless-platform
cd serverless-platform/serverless-config

# Set environment variables
export AWS_REGION=us-east-1
export STACK_NAME=serverless-platform-dev
export NOTIFICATION_EMAIL=vra.9618@gmail.com
export JWT_SECRET=$(openssl rand -base64 32)
```

#### Step 2: Install Dependencies
```bash
# Install all Lambda function dependencies
npm run install:all

# Or install individually
cd lambda-functions/user-authentication
npm install

cd ../data-processor  
npm install

cd ../api-handler
npm install
cd ../..
```

#### Step 3: Build and Validate
```bash
# Validate CloudFormation template
sam validate --template cloudformation/infrastructure.yaml

# Build SAM application
sam build --template cloudformation/infrastructure.yaml
```

#### Step 4: Deploy Infrastructure
```bash
# Deploy with guided prompts (first time)
sam deploy --guided

# Or deploy with parameters
sam deploy \
  --template-file cloudformation/infrastructure.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=dev \
    ProjectName=serverless-platform \
    NotificationEmail=$NOTIFICATION_EMAIL \
    JWTSecret=$JWT_SECRET
```

## 🔧 Configuration Options

### Environment Parameters
```yaml
# Available parameters for deployment
Parameters:
  Environment: [dev, staging, prod]
  ProjectName: serverless-platform
  ApiStageName: v1
  JWTSecret: [Generated or Custom]
  NotificationEmail: your-email@example.com
```

### Custom Deployment
```bash
# Development environment
sam deploy --parameter-overrides Environment=dev

# Staging environment
sam deploy --parameter-overrides Environment=staging ProjectName=serverless-platform-staging

# Production environment
sam deploy --parameter-overrides Environment=prod ProjectName=serverless-platform-prod NotificationEmail=alerts@company.com
```

## 📊 Post-Deployment Verification

### 1. Check Stack Status
```bash
# Verify stack creation
aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].StackStatus'

# Get stack outputs
aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs'
```

### 2. Test API Gateway
```bash
# Get API Gateway URL from outputs
API_URL=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' --output text)

# Test health check
curl $API_URL/health

# Test authentication endpoint
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'
```

### 3. Verify Lambda Functions
```bash
# List deployed functions
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `serverless-platform-dev`)].FunctionName'

# Test function invocation
aws lambda invoke \
  --function-name serverless-platform-dev-user-auth \
  --payload '{"httpMethod":"GET","path":"/auth/verify"}' \
  response.json

cat response.json
```

### 4. Check DynamoDB Tables
```bash
# List tables
aws dynamodb list-tables --query 'TableNames[?starts_with(@, `serverless-platform-dev`)]'

# Verify table status
aws dynamodb describe-table --table-name serverless-platform-dev-users --query 'Table.TableStatus'
```

### 5. Monitor CloudWatch
```bash
# Check recent logs
aws logs describe-log-groups --log-group-name-prefix '/aws/lambda/serverless-platform-dev'

# View latest log entries
aws logs tail /aws/lambda/serverless-platform-dev-user-auth --since 1h
```

## 🔍 Troubleshooting

### Common Deployment Issues

#### 1. IAM Permissions Error
```
Error: User: arn:aws:iam::123456789:user/deployer is not authorized to perform: iam:CreateRole
```
**Solution:**
```bash
# Ensure user has necessary permissions
aws iam attach-user-policy --user-name deployer --policy-arn arn:aws:iam::aws:policy/PowerUserAccess
aws iam attach-user-policy --user-name deployer --policy-arn arn:aws:iam::aws:policy/IAMFullAccess
```

#### 2. Stack Already Exists
```
Error: Stack [serverless-platform-dev] already exists
```
**Solution:**
```bash
# Update existing stack
sam deploy --no-confirm-changeset

# Or delete and recreate
aws cloudformation delete-stack --stack-name serverless-platform-dev
aws cloudformation wait stack-delete-complete --stack-name serverless-platform-dev
# Then redeploy
```

#### 3. Lambda Function Build Errors
```
Error: Requirements file not found
```
**Solution:**
```bash
# Ensure all dependencies are installed
cd lambda-functions/user-authentication && npm install
cd ../data-processor && npm install  
cd ../api-handler && npm install

# Clean and rebuild
sam build --use-container
```

#### 4. DynamoDB Table Creation Timeout
```
Error: Resource creation cancelled
```
**Solution:**
```bash
# Check for existing tables with same name
aws dynamodb list-tables | grep serverless-platform

# Delete conflicting tables if needed
aws dynamodb delete-table --table-name serverless-platform-dev-users
```

### Environment-Specific Issues

#### Development Environment
```bash
# Enable debug logging
export SAM_DEBUG=true
sam build --debug
sam deploy --debug
```

#### Production Environment
```bash
# Use KMS encryption
sam deploy --parameter-overrides Environment=prod EnableEncryption=true

# Enable deletion protection
aws cloudformation update-termination-protection --enable-termination-protection --stack-name serverless-platform-prod
```

## 🔒 Security Configuration

### 1. Enable HTTPS Only
```bash
# API Gateway automatically uses HTTPS
# Verify SSL certificate
curl -I https://your-api-id.execute-api.us-east-1.amazonaws.com/v1/health
```

### 2. Configure WAF (Optional)
```bash
# Create WAF rules for API Gateway
aws wafv2 create-web-acl \
  --name serverless-platform-waf \
  --scope REGIONAL \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

### 3. Set Up VPC (Production)
```bash
# Deploy with VPC configuration
sam deploy --parameter-overrides EnableVPC=true VpcCidr=10.0.0.0/16
```

## 📈 Performance Optimization

### 1. Lambda Optimization
```bash
# Increase memory for better performance
aws lambda update-function-configuration \
  --function-name serverless-platform-dev-data-processor \
  --memory-size 1024

# Set reserved concurrency
aws lambda put-reserved-concurrency \
  --function-name serverless-platform-dev-api-handler \
  --reserved-concurrency-configuration ReservedConcurrency=100
```

### 2. DynamoDB Optimization
```bash
# Enable auto-scaling
aws dynamodb register-scalable-target \
  --service-namespace dynamodb \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --resource-id table/serverless-platform-dev-users \
  --min-capacity 5 \
  --max-capacity 100
```

### 3. API Gateway Caching
```bash
# Enable caching for API stage
aws apigateway put-stage \
  --rest-api-id YOUR_API_ID \
  --stage-name v1 \
  --patch-ops op=replace,path=/cacheClusterEnabled,value=true
```

## 🔄 Updates and Maintenance

### 1. Update Lambda Functions
```bash
# Update function code
cd lambda-functions/user-authentication
npm install  # Update dependencies
cd ../../
sam build
sam deploy --no-confirm-changeset
```

### 2. Database Migrations
```bash
# Add new DynamoDB table
aws dynamodb create-table \
  --table-name serverless-platform-dev-analytics \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### 3. Backup and Recovery
```bash
# Enable point-in-time recovery for DynamoDB
aws dynamodb update-continuous-backups \
  --table-name serverless-platform-dev-users \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Create S3 bucket backup
aws s3 sync s3://serverless-platform-dev-data-123456789 s3://serverless-platform-backup-123456789
```

## 📊 Monitoring Setup

### 1. CloudWatch Dashboard
```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name ServerlessPlatformDashboard \
  --dashboard-body file://cloudwatch-dashboard.json
```

### 2. Custom Alarms
```bash
# Create custom alarm for API latency
aws cloudwatch put-metric-alarm \
  --alarm-name "API-High-Latency" \
  --alarm-description "Alert when API latency is high" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 5000 \
  --comparison-operator GreaterThanThreshold \
  --alarm-actions arn:aws:sns:us-east-1:123456789:alerts
```

### 3. Log Analysis
```bash
# Set up log insights queries
aws logs put-query-definition \
  --name "ServerlessPlatformErrors" \
  --log-group-names "/aws/lambda/serverless-platform-dev-api-handler" \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 100'
```

## 🗑️ Cleanup

### Complete Stack Deletion
```bash
# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name serverless-platform-dev

# Wait for deletion to complete
aws cloudformation wait stack-delete-complete --stack-name serverless-platform-dev

# Verify deletion
aws cloudformation describe-stacks --stack-name serverless-platform-dev 2>&1 | grep "does not exist"
```

### Selective Resource Cleanup
```bash
# Delete S3 bucket contents first
aws s3 rm s3://serverless-platform-dev-data-123456789 --recursive

# Then delete the bucket
aws s3 rb s3://serverless-platform-dev-data-123456789

# Remove log groups
aws logs delete-log-group --log-group-name /aws/lambda/serverless-platform-dev-user-auth
```

---

## 📞 Support

If you encounter issues during deployment:

1. **Check AWS Service Health**: https://status.aws.amazon.com/
2. **Review CloudFormation Events**: AWS Console → CloudFormation → Stack → Events
3. **Check Lambda Logs**: AWS Console → CloudWatch → Log Groups
4. **Contact Support**: vra.9618@gmail.com

**Developer**: Reaishma N  
**GitHub**: https://github.com/Reaishma  
**Email**: vra.9618@gmail.com

---

*This deployment guide provides comprehensive instructions for setting up the Serverless Platform Dashboard on AWS with proper monitoring, security, and maintenance procedures.*
