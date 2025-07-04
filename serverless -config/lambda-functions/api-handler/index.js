// Lambda Function: API Handler
const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json'
    };

    try {
        const { httpMethod, path, pathParameters, queryStringParameters, body } = event;
        const requestBody = body ? JSON.parse(body) : {};

        console.log(`API Request: ${httpMethod} ${path}`);

        // Handle CORS preflight
        if (httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers,
                body: ''
            };
        }

        // Route requests based on path
        if (path.startsWith('/api/functions')) {
            return await handleFunctionsAPI(httpMethod, path, pathParameters, queryStringParameters, requestBody, headers);
        } else if (path.startsWith('/api/endpoints')) {
            return await handleEndpointsAPI(httpMethod, path, pathParameters, queryStringParameters, requestBody, headers);
        } else if (path.startsWith('/api/collections')) {
            return await handleFirestoreAPI(httpMethod, path, pathParameters, queryStringParameters, requestBody, headers);
        } else if (path.startsWith('/api/logs')) {
            return await handleLogsAPI(httpMethod, path, pathParameters, queryStringParameters, requestBody, headers);
        } else if (path.startsWith('/api/iam')) {
            return await handleIAMAPI(httpMethod, path, pathParameters, queryStringParameters, requestBody, headers);
        } else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Endpoint not found' })
            };
        }

    } catch (error) {
        console.error('API Handler Error:', error);
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

// Cloud Functions API
async function handleFunctionsAPI(method, path, pathParams, queryParams, body, headers) {
    try {
        switch (method) {
            case 'GET':
                if (pathParams && pathParams.id) {
                    return await getFunction(pathParams.id, headers);
                } else {
                    return await getFunctions(queryParams, headers);
                }

            case 'POST':
                return await createFunction(body, headers);

            case 'PUT':
                if (pathParams && pathParams.id) {
                    return await updateFunction(pathParams.id, body, headers);
                } else {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Function ID required' }) };
                }

            case 'DELETE':
                if (pathParams && pathParams.id) {
                    return await deleteFunction(pathParams.id, headers);
                } else {
                    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Function ID required' }) };
                }

            default:
                return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
    } catch (error) {
        console.error('Functions API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Functions API error', message: error.message })
        };
    }
}

// API Endpoints API
async function handleEndpointsAPI(method, path, queryParams, body, headers) {
    try {
        switch (method) {
            case 'GET':
                return await getEndpoints(queryParams, headers);

            case 'POST':
                if (path.includes('/test')) {
                    return await testEndpoint(body, headers);
                } else {
                    return await createEndpoint(body, headers);
                }

            case 'PUT':
                return await updateEndpoint(body, headers);

            default:
                return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
    } catch (error) {
        console.error('Endpoints API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Endpoints API error', message: error.message })
        };
    }
}

// Firestore API
async function handleFirestoreAPI(method, path, pathParams, queryParams, body, headers) {
    try {
        if (path.includes('/documents')) {
            return await handleDocumentsAPI(method, pathParams, body, headers);
        } else if (path.includes('/query')) {
            return await handleQueryAPI(method, body, headers);
        } else {
            return await handleCollectionsAPI(method, pathParams, queryParams, body, headers);
        }
    } catch (error) {
        console.error('Firestore API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Firestore API error', message: error.message })
        };
    }
}

// Logs API
async function handleLogsAPI(method, queryParams, headers) {
    try {
        if (method === 'GET') {
            return await getLogs(queryParams, headers);
        } else {
            return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
        }
    } catch (error) {
        console.error('Logs API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Logs API error', message: error.message })
        };
    }
}

// IAM API
async function handleIAMAPI(method, path, pathParams, body, headers) {
    try {
        if (path.includes('/users')) {
            return await handleUsersAPI(method, pathParams, body, headers);
        } else if (path.includes('/service-accounts')) {
            return await handleServiceAccountsAPI(method, pathParams, body, headers);
        } else if (path.includes('/security-policies')) {
            return await handleSecurityPoliciesAPI(method, body, headers);
        } else {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'IAM endpoint not found' }) };
        }
    } catch (error) {
        console.error('IAM API Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'IAM API error', message: error.message })
        };
    }
}

// Implementation functions
async function getFunctions(queryParams, headers) {
    try {
        const result = await dynamodb.scan({
            TableName: process.env.FUNCTIONS_TABLE
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        throw new Error(`Failed to get functions: ${error.message}`);
    }
}

async function getFunction(id, headers) {
    try {
        const result = await dynamodb.get({
            TableName: process.env.FUNCTIONS_TABLE,
            Key: { id }
        }).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Function not found' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        throw new Error(`Failed to get function: ${error.message}`);
    }
}

async function createFunction(body, headers) {
    try {
        const { name, runtime, trigger, code } = body;

        if (!name || !runtime || !trigger || !code) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        const functionData = {
            id: generateId(),
            name,
            runtime,
            trigger,
            code,
            status: 'Active',
            deployed: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await dynamodb.put({
            TableName: process.env.FUNCTIONS_TABLE,
            Item: functionData
        }).promise();

        // Log the deployment
        await logActivity('FUNCTION_DEPLOYED', `Function '${name}' deployed successfully`);

        return {
            statusCode: 201,
            headers,
            body: JSON.stringify(functionData)
        };
    } catch (error) {
        throw new Error(`Failed to create function: ${error.message}`);
    }
}

async function updateFunction(id, body, headers) {
    try {
        const updateExpression = [];
        const expressionAttributeValues = {};
        const expressionAttributeNames = {};

        Object.keys(body).forEach(key => {
            if (key !== 'id') {
                updateExpression.push(`#${key} = :${key}`);
                expressionAttributeValues[`:${key}`] = body[key];
                expressionAttributeNames[`#${key}`] = key;
            }
        });

        expressionAttributeValues[':updatedAt'] = new Date().toISOString();
        updateExpression.push('#updatedAt = :updatedAt');
        expressionAttributeNames['#updatedAt'] = 'updatedAt';

        const result = await dynamodb.update({
            TableName: process.env.FUNCTIONS_TABLE,
            Key: { id },
            UpdateExpression: `SET ${updateExpression.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW'
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Attributes)
        };
    } catch (error) {
        throw new Error(`Failed to update function: ${error.message}`);
    }
}

async function deleteFunction(id, headers) {
    try {
        // Get function details before deletion
        const getResult = await dynamodb.get({
            TableName: process.env.FUNCTIONS_TABLE,
            Key: { id }
        }).promise();

        if (!getResult.Item) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Function not found' })
            };
        }

        await dynamodb.delete({
            TableName: process.env.FUNCTIONS_TABLE,
            Key: { id }
        }).promise();

        // Log the deletion
        await logActivity('FUNCTION_DELETED', `Function '${getResult.Item.name}' deleted successfully`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Function deleted successfully' })
        };
    } catch (error) {
        throw new Error(`Failed to delete function: ${error.message}`);
    }
}

async function getEndpoints(queryParams, headers) {
    try {
        const result = await dynamodb.scan({
            TableName: process.env.ENDPOINTS_TABLE
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(result.Items || [])
        };
    } catch (error) {
        throw new Error(`Failed to get endpoints: ${error.message}`);
    }
}

async function testEndpoint(body, headers) {
    try {
        const { method, url, headers: requestHeaders, body: requestBody } = body;

        // Simulate API test
        const responseTime = Math.floor(Math.random() * 500) + 100;
        const status = Math.random() > 0.1 ? 200 : 500; // 90% success rate

        // Log the test
        await logActivity('ENDPOINT_TESTED', `API test: ${method} ${url} - ${status} (${responseTime}ms)`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                status,
                responseTime,
                response: { success: status === 200, message: 'API test completed' },
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        throw new Error(`Failed to test endpoint: ${error.message}`);
    }
}

async function getLogs(queryParams, headers) {
    try {
        const { service, level, limit = 50 } = queryParams || {};

        let scanParams = {
            TableName: process.env.LOGS_TABLE,
            Limit: parseInt(limit)
        };

        if (service && service !== 'All Services') {
            scanParams.FilterExpression = '#service = :service';
            scanParams.ExpressionAttributeNames = { '#service': 'service' };
            scanParams.ExpressionAttributeValues = { ':service': service };
        }

        if (level && level !== 'All Levels') {
            if (scanParams.FilterExpression) {
                scanParams.FilterExpression += ' AND #level = :level';
                scanParams.ExpressionAttributeNames['#level'] = 'level';
                scanParams.ExpressionAttributeValues[':level'] = level;
            } else {
                scanParams.FilterExpression = '#level = :level';
                scanParams.ExpressionAttributeNames = { '#level': 'level' };
                scanParams.ExpressionAttributeValues = { ':level': level };
            }
        }

        const result = await dynamodb.scan(scanParams).promise();

        // Sort by timestamp (newest first)
        const sortedLogs = (result.Items || []).sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(sortedLogs)
        };
    } catch (error) {
        throw new Error(`Failed to get logs: ${error.message}`);
    }
}

async function logActivity(type, message) {
    try {
        await dynamodb.put({
            TableName: process.env.LOGS_TABLE,
            Item: {
                id: generateId(),
                service: 'Cloud Functions',
                level: 'INFO',
                message,
                timestamp: new Date().toISOString(),
                type
            }
        }).promise();
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging failures shouldn't break the main operation
    }
}

// Helper functions
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Additional implementation stubs for other APIs
async function handleDocumentsAPI(method, pathParams, body, headers) {
    // Implementation for document operations
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Documents API not fully implemented' }) };
}

async function handleQueryAPI(method, body, headers) {
    // Implementation for query operations
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Query API not fully implemented' }) };
}

async function handleCollectionsAPI(method, pathParams, queryParams, body, headers) {
    // Implementation for collection operations
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Collections API not fully implemented' }) };
}

async function handleUsersAPI(method, pathParams, body, headers) {
    // Implementation for user management
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Users API not fully implemented' }) };
}

async function handleServiceAccountsAPI(method, pathParams, body, headers) {
    // Implementation for service account management
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Service Accounts API not fully implemented' }) };
}

async function handleSecurityPoliciesAPI(method, body, headers) {
    // Implementation for security policies
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'Security Policies API not fully implemented' }) };
                                            }
