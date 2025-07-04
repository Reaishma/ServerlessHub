// Lambda Function: Data Processor
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();

exports.handler = async (event) => {
    console.log('Data processor triggered:', JSON.stringify(event, null, 2));

    try {
        // Handle different event sources
        if (event.Records) {
            for (const record of event.Records) {
                if (record.eventSource === 'aws:s3') {
                    await processS3Event(record);
                } else if (record.eventSource === 'aws:dynamodb') {
                    await processDynamoDBEvent(record);
                } else if (record.eventSource === 'aws:sns') {
                    await processSNSEvent(record);
                }
            }
        } else {
            // Direct invocation
            await processDirectInvocation(event);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Data processing completed successfully',
                timestamp: new Date().toISOString()
            })
        };
    } catch (error) {
        console.error('Data processing error:', error);
        
        // Send error notification
        await sendErrorNotification(error, event);
        
        throw error;
    }
};

async function processS3Event(record) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    console.log(`Processing S3 object: ${bucket}/${key}`);

    try {
        // Get object metadata
        const headResult = await s3.headObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Process based on file type
        const contentType = headResult.ContentType;
        
        if (contentType.startsWith('application/json')) {
            await processJSONFile(bucket, key);
        } else if (contentType.startsWith('text/csv')) {
            await processCSVFile(bucket, key);
        } else if (contentType.startsWith('image/')) {
            await processImageFile(bucket, key);
        } else {
            console.log(`Unsupported file type: ${contentType}`);
        }

        // Log processing event
        await logProcessingEvent({
            type: 'S3_PROCESSING',
            bucket,
            key,
            contentType,
            size: headResult.ContentLength,
            status: 'SUCCESS'
        });

    } catch (error) {
        console.error(`Error processing S3 object ${bucket}/${key}:`, error);
        
        await logProcessingEvent({
            type: 'S3_PROCESSING',
            bucket,
            key,
            status: 'FAILED',
            error: error.message
        });
        
        throw error;
    }
}

async function processJSONFile(bucket, key) {
    try {
        // Get file content
        const result = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        const data = JSON.parse(result.Body.toString());
        console.log('Processing JSON data:', data);

        // Validate data structure
        if (Array.isArray(data)) {
            // Process array of records
            for (const record of data) {
                await processRecord(record, 'JSON_BATCH');
            }
        } else if (typeof data === 'object') {
            // Process single record
            await processRecord(data, 'JSON_SINGLE');
        }

        // Archive processed file
        await archiveFile(bucket, key, 'json');

    } catch (error) {
        console.error('JSON processing error:', error);
        throw error;
    }
}

async function processCSVFile(bucket, key) {
    try {
        // Get file content
        const result = await s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();

        const csvData = result.Body.toString();
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        console.log(`Processing CSV with ${lines.length - 1} records`);

        // Process each row
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',');
                const record = {};
                
                headers.forEach((header, index) => {
                    record[header.trim()] = values[index]?.trim();
                });

                await processRecord(record, 'CSV_ROW');
            }
        }

        // Archive processed file
        await archiveFile(bucket, key, 'csv');

    } catch (error) {
        console.error('CSV processing error:', error);
        throw error;
    }
}

async function processImageFile(bucket, key) {
    try {
        console.log(`Processing image file: ${key}`);

        // Get image metadata
        const result = await s3.headObject({
            Bucket: bucket,
            Key: key
        }).promise();

        // Create thumbnail (simulate image processing)
        const thumbnailKey = key.replace(/\.[^.]+$/, '_thumbnail.jpg');
        
        // In a real implementation, you would use AWS Rekognition or similar
        // For now, we'll just log the processing
        console.log(`Creating thumbnail: ${thumbnailKey}`);

        // Store image metadata
        await processRecord({
            originalKey: key,
            thumbnailKey,
            contentType: result.ContentType,
            size: result.ContentLength,
            lastModified: result.LastModified,
            processedAt: new Date().toISOString()
        }, 'IMAGE_PROCESSING');

    } catch (error) {
        console.error('Image processing error:', error);
        throw error;
    }
}

async function processRecord(record, source) {
    try {
        // Add processing metadata
        const processedRecord = {
            ...record,
            id: generateId(),
            processedAt: new Date().toISOString(),
            source,
            status: 'PROCESSED'
        };

        // Store in DynamoDB
        await dynamodb.put({
            TableName: process.env.PROCESSED_DATA_TABLE,
            Item: processedRecord
        }).promise();

        console.log(`Record processed and stored: ${processedRecord.id}`);

        // Send notification for important records
        if (record.priority === 'high' || record.amount > 10000) {
            await sendProcessingNotification(processedRecord);
        }

    } catch (error) {
        console.error('Record processing error:', error);
        throw error;
    }
}

async function processDynamoDBEvent(record) {
    const { eventName, dynamodb: dbRecord } = record;
    
    console.log(`Processing DynamoDB event: ${eventName}`);

    try {
        if (eventName === 'INSERT') {
            await handleInsert(dbRecord.NewImage);
        } else if (eventName === 'MODIFY') {
            await handleModify(dbRecord.OldImage, dbRecord.NewImage);
        } else if (eventName === 'REMOVE') {
            await handleRemove(dbRecord.OldImage);
        }
    } catch (error) {
        console.error('DynamoDB event processing error:', error);
        throw error;
    }
}

async function processSNSEvent(record) {
    const message = JSON.parse(record.Sns.Message);
    console.log('Processing SNS message:', message);

    try {
        switch (message.type) {
            case 'DATA_VALIDATION':
                await validateData(message.data);
                break;
            case 'BATCH_PROCESSING':
                await processBatch(message.batchId);
                break;
            case 'CLEANUP':
                await cleanupOldData(message.retentionDays);
                break;
            default:
                console.log(`Unknown message type: ${message.type}`);
        }
    } catch (error) {
        console.error('SNS event processing error:', error);
        throw error;
    }
}

async function processDirectInvocation(event) {
    const { action, data } = event;
    
    console.log(`Direct invocation with action: ${action}`);

    switch (action) {
        case 'process_batch':
            return await processBatch(data.batchId);
        case 'validate_data':
            return await validateData(data);
        case 'cleanup':
            return await cleanupOldData(data.retentionDays || 30);
        case 'health_check':
            return { status: 'healthy', timestamp: new Date().toISOString() };
        default:
            throw new Error(`Unknown action: ${action}`);
    }
}

async function archiveFile(bucket, key, type) {
    try {
        const archiveKey = `archive/${type}/${new Date().toISOString().split('T')[0]}/${key}`;
        
        await s3.copyObject({
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: archiveKey
        }).promise();

        console.log(`File archived: ${archiveKey}`);
    } catch (error) {
        console.error('Archive error:', error);
        // Don't throw - archiving is not critical
    }
}

async function logProcessingEvent(event) {
    try {
        await dynamodb.put({
            TableName: process.env.PROCESSING_LOGS_TABLE,
            Item: {
                id: generateId(),
                timestamp: new Date().toISOString(),
                ...event
            }
        }).promise();
    } catch (error) {
        console.error('Logging error:', error);
        // Don't throw - logging errors shouldn't stop processing
    }
}

async function sendProcessingNotification(record) {
    try {
        await sns.publish({
            TopicArn: process.env.PROCESSING_NOTIFICATIONS_TOPIC,
            Message: JSON.stringify({
                type: 'PROCESSING_COMPLETE',
                record,
                timestamp: new Date().toISOString()
            }),
            Subject: 'Data Processing Notification'
        }).promise();
    } catch (error) {
        console.error('Notification error:', error);
        // Don't throw - notification errors shouldn't stop processing
    }
}

async function sendErrorNotification(error, event) {
    try {
        await sns.publish({
            TopicArn: process.env.ERROR_NOTIFICATIONS_TOPIC,
            Message: JSON.stringify({
                type: 'PROCESSING_ERROR',
                error: error.message,
                stack: error.stack,
                event,
                timestamp: new Date().toISOString()
            }),
            Subject: 'Data Processing Error'
        }).promise();
    } catch (notificationError) {
        console.error('Error notification failed:', notificationError);
    }
}

// Helper functions
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function handleInsert(newImage) {
    console.log('Handling DynamoDB insert:', newImage);
    // Implement insert handling logic
}

async function handleModify(oldImage, newImage) {
    console.log('Handling DynamoDB modify:', { oldImage, newImage });
    // Implement modify handling logic
}

async function handleRemove(oldImage) {
    console.log('Handling DynamoDB remove:', oldImage);
    // Implement remove handling logic
}

async function validateData(data) {
    console.log('Validating data:', data);
    // Implement data validation logic
    return { valid: true, data };
}

async function processBatch(batchId) {
    console.log('Processing batch:', batchId);
    // Implement batch processing logic
    return { batchId, status: 'completed' };
}

async function cleanupOldData(retentionDays) {
    console.log(`Cleaning up data older than ${retentionDays} days`);
    // Implement cleanup logic
    return { cleaned: true, retentionDays };
    }



