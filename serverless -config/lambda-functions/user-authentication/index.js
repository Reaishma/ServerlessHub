// Lambda Function: User Authentication
const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        const { httpMethod, path, body } = event;
        const requestBody = body ? JSON.parse(body) : {};

        switch (httpMethod) {
            case 'OPTIONS':
                return {
                    statusCode: 200,
                    headers,
                    body: ''
                };

            case 'POST':
                if (path.includes('/login')) {
                    return await loginUser(requestBody, headers);
                } else if (path.includes('/register')) {
                    return await registerUser(requestBody, headers);
                }
                break;

            case 'GET':
                if (path.includes('/verify')) {
                    return await verifyToken(event.headers.Authorization, headers);
                }
                break;

            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};

async function loginUser(body, headers) {
    const { email, password } = body;

    if (!email || !password) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email and password are required' })
        };
    }

    try {
        // Get user from DynamoDB
        const result = await dynamodb.get({
            TableName: process.env.USERS_TABLE,
            Key: { email }
        }).promise();

        const user = result.Item;
        if (!user) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid credentials' })
            };
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.userId, 
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Login successful',
                token,
                user: {
                    userId: user.userId,
                    email: user.email,
                    role: user.role,
                    name: user.name
                }
            })
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Login failed' })
        };
    }
}

async function registerUser(body, headers) {
    const { email, password, name, role = 'user' } = body;

    if (!email || !password || !name) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email, password, and name are required' })
        };
    }

    try {
        // Check if user already exists
        const existingUser = await dynamodb.get({
            TableName: process.env.USERS_TABLE,
            Key: { email }
        }).promise();

        if (existingUser.Item) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ error: 'User already exists' })
            };
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create user
        const user = {
            userId,
            email,
            password: hashedPassword,
            name,
            role,
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        await dynamodb.put({
            TableName: process.env.USERS_TABLE,
            Item: user
        }).promise();

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.userId, 
                email: user.email,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
                message: 'User created successfully',
                token,
                user: {
                    userId: user.userId,
                    email: user.email,
                    role: user.role,
                    name: user.name
                }
            })
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Registration failed' })
        };
    }
}

async function verifyToken(authHeader, headers) {
    if (!authHeader) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'No authorization header' })
        };
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user details from DynamoDB
        const result = await dynamodb.get({
            TableName: process.env.USERS_TABLE,
            Key: { email: decoded.email }
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'User not found' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                valid: true,
                user: {
                    userId: result.Item.userId,
                    email: result.Item.email,
                    role: result.Item.role,
                    name: result.Item.name
                }
            })
        };
    } catch (error) {
        return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
                error: 'Invalid token',
                valid: false 
            })
        };
    }
          }
