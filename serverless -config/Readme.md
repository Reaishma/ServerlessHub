## Serverless platform 
infrastructure simulating Google Cloud Platform services, built with AWS Lambda, API Gateway, DynamoDB, and other AWS services.

## 🚀 Features

- **User Authentication** - JWT-based authentication with secure password hashing
- **Cloud Functions Management** - Deploy and manage serverless functions
- **API Gateway** - RESTful API with comprehensive endpoint management
- **Data Processing** - Automated data processing with S3 triggers
- **Database Operations** - Full CRUD operations with DynamoDB
- **Logging & Monitoring** - CloudWatch integration with custom alarms
- **IAM & Security** - Role-based access control and security policies

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │ Lambda Functions│
│   (React)       │◄──►│                 │◄──►│                 │
│                 │    │ - Authentication│    │ - User Auth     │
│                 │    │ - Rate Limiting │    │ - Data Processor│
│                 │    │ - CORS Handling │    │ - API Handler   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudWatch    │    │   DynamoDB      │    │      S3         │
│   - Monitoring  │    │   - Users       │    │   - Data Files  │
│   - Alarms      │    │   - Functions   │    │   - Uploads     │
│   - Logs        │    │   - Logs        │    │   - Archives    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
serverless-config/
├── lambda-functions/
│   ├── user-authentication/     # JWT authentication & user management
│   ├── data-processor/          # S3 event processing & data transformation
│   └── api-handler/             # REST API endpoints handler
├── api-gateway/
│   └── api-gateway.yaml         # OpenAPI/Swagger specification
├── cloudformation/
│   └── infrastructure.yaml     # Complete AWS infrastructure
└── README.md                    # This file
```

## 🛠️ Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- SAM CLI installed
- Docker (for local testing)

### Quick Deployment

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Reaishma/serverless-platform
   cd serverless-platform/serverless-config
   ```

2. **Install dependencies:**
   ```bash
   cd lambda-functions/user-authentication && npm install
   cd ../data-processor && npm install
   cd ../api-handler && npm install
   ```

3. **Deploy infrastructure:**
   ```bash
   sam build
   sam deploy --guided
   ```

4. **Configure environment variables:**
   ```bash
   # Set in AWS Lambda console or update cloudformation/infrastructure.yaml
   JWT_SECRET=your-super-secret-jwt-key
   NOTIFICATION_EMAIL=your-email@example.com
   ```

### Manual CloudFormation Deployment

```bash
aws cloudformation deploy \
  --template-file cloudformation/infrastructure.yaml \
  --stack-name serverless-platform-dev \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=dev \
    ProjectName=serverless-platform \
    NotificationEmail=vra.9618@gmail.com \
    JWTSecret=your-jwt-secret
```

## 🔧 Configuration 


- **User Authentication** - JWT-based authentication with secure password hashing
- **Cloud Functions Management** - Deploy and manage serverless functions
- **API Gateway** - RESTful API with comprehensive endpoint management
- **Data Processing** - Automated data processing with S3 triggers
- **Database Operations** - Full CRUD operations with DynamoDB
- **Logging & Monitoring** - CloudWatch integration with custom alarms
- **IAM & Security** - Role-based access control and security policies

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │ Lambda Functions│
│   (React)       │◄──►│                 │◄──►│                 │
│                 │    │ - Authentication│    │ - User Auth     │
│                 │    │ - Rate Limiting │    │ - Data Processor│
│                 │    │ - CORS Handling │    │ - API Handler   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudWatch    │    │   DynamoDB      │    │      S3         │
│   - Monitoring  │    │   - Users       │    │   - Data Files  │
│   - Alarms      │    │   - Functions   │    │   - Uploads     │
│   - Logs        │    │   - Logs        │    │   - Archives    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
serverless-config/
├── lambda-functions/
│   ├── user-authentication/     # JWT authentication & user management
│   ├── data-processor/          # S3 event processing & data transformation
│   └── api-handler/             # REST API endpoints handler
├── api-gateway/
│   └── api-gateway.yaml         # OpenAPI/Swagger specification
├── cloudformation/
│   └── infrastructure.yaml     # Complete AWS infrastructure
└── README.md                    # This file
```

## 🛠️ Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ installed
- SAM CLI installed
- Docker (for local testing)


##  Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `JWT_SECRET` | Secret key for JWT token generation | Yes |
| `ENVIRONMENT` | Deployment environment (dev/staging/prod) | Yes |
| `NOTIFICATION_EMAIL` | Email for CloudWatch alarms | Yes |
| `PROJECT_NAME` | Project name for resource naming | Yes |

### API Gateway Configuration

The API Gateway is configured with:
- **Rate Limiting**: 1000 requests/second, 2000 burst
- **CORS**: Enabled for all origins
- **Authentication**: JWT Bearer token
- **Validation**: Request/response 

#### PUT /api/functions/{functionId}
Update function configuration

#### DELETE /api/functions/{functionId}
Delete function

### Data Processing

The data processor handles:
- **S3 Events**: Automatic processing of uploaded files
- **JSON Files**: Parse and store structured data
- **CSV Files**: Convert to JSON and process rows
- **Images**: Generate thumbnails and extract metadata
- **Batch Processing**: Scheduled cleanup and maintenance

## 🔍 Monitoring

### CloudWatch Alarms

- **Lambda Errors**: Triggers on 5+ errors in 5 minutes
- **API Gateway 4XX**: Triggers on 10+ client errors
- **API Gateway 5XX**: Triggers on any server error
- **DynamoDB Throttling**: Monitors table throttling events

### Logging

All components log to CloudWatch with structured JSON:
```json
{
  "timestamp": "2024-12-03T14:30:00Z",
  "level": "INFO",
  "service": "user-auth",
  "message": "User login successful",
  "userId": "user_123",
  "metadata": { "ip": "192.168.1.1" }
}
```

## 🧪 Testing

### Unit Tests
```bash
cd lambda-functions/user-authentication
npm test

cd ../data-processor
npm test

cd ../api-handler
npm test
```

### Integration Tests
```bash
# Start local API
sam local start-api

# Run integration tests
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 100 --num 10 https://your-api-url.com/api/functions
```

## 🔒 Security

### Authentication & Authorization
- **JWT Tokens**: 24-hour expiration with secure signing
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: API Gateway throttling
- **CORS**: Configurable origin restrictions

### Data Protection
- **Encryption**: All DynamoDB tables encrypted at rest
- **S3 Security**: Private buckets with IAM access only
- **VPC**: Optional VPC deployment for network isolation
- **Secrets**: AWS Systems Manager Parameter Store

### IAM Policies
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/serverless-platform-*"
    }
  ]
}
```

## 📊 Performance

### Benchmarks
- **API Response Time**: < 200ms average
- **Function Cold Start**: < 1000ms
- **Database Queries**: < 100ms average
- **File Processing**: 1MB/second throughput

### Optimization
- **Connection Pooling**: Reuse DynamoDB connections
- **Memory Allocation**: Optimized per function
- **Concurrency**: Configured reserved concurrency
- **Caching**: API Gateway response caching

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy Serverless Platform
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/setup-sam@v2
      - name: Build and Deploy
        run: |
          sam build
          sam deploy --no-confirm-changeset
```

### Deployment Stages
1. **Development**: Automatic deployment on feature branches
2. **Staging**: Manual approval for release candidates
3. **Production**: Blue/green deployment with rollback

## 🚨 Troubleshooting

### Common Issues

#### Lambda Function Timeout
```bash
# Check CloudWatch logs
aws logs tail /aws/lambda/serverless-platform-dev-user-auth --follow

# Increase timeout in template
Timeout: 30  # seconds
```

#### DynamoDB Throttling
```bash
# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ThrottledRequests \
  --dimensions Name=TableName,Value=serverless-platform-dev-users

# Solution: Enable auto-scaling or increase provisioned capacity
```

#### API Gateway CORS Issues
```yaml
# Ensure CORS is properly configured
Cors:
  AllowOrigin: "'*'"
  AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
  AllowHeaders: "'Content-Type,Authorization'"
```

### Debug Mode
```bash
# Enable debug logging
export DEBUG=true
sam local start-api --debug
```

## 📈 Scaling

### Auto Scaling Configuration
- **Lambda Concurrency**: 1000 reserved + auto-scaling
- **DynamoDB**: On-demand billing with auto-scaling
- **API Gateway**: Automatic scaling to handle load
- **CloudWatch**: Custom metrics for scaling decisions

### Performance Tuning
- **Lambda Memory**: 256MB-1GB based on function needs
- **DynamoDB**: Composite keys for efficient queries
- **S3**: Multipart uploads for large files
- **CloudFront**: CDN for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards
- ESLint configuration provided
- Jest for unit testing
- 80%+ test coverage required
- Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Reaishma N**
- Email: vra.9618@gmail.com
- GitHub: [@Reaishma](https://github.com/Reaishma)
- Portfolio: [Your Portfolio URL]

## 🙏 Acknowledgments

- AWS Documentation and Best Practices
- Serverless Framework Community
- Google Cloud Platform UI Inspiration
- Open Source Lambda Layer Libraries

## 📞 Support

For support, email vra.9618@gmail.com or create an issue in the repository.

---

**Built with ❤️ by Reaishma N**

*This project demonstrates a complete serverless architecture simulating enterprise-grade cloud platform functionality.*




