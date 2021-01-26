// v1.1.2
var https = require('https');
var zlib = require('zlib');
var crypto = require('crypto');

var endpoint = process.env.ES_ENDPOINT;
var indexPrefix = process.env.ES_INDEX_PREFIX;
var indexDateSeparator = process.env.ES_INDEX_DATE_SEPARATOR;
var tags = undefined;
try {
    tags = JSON.parse(process.env.ES_TAGS);
} catch (_) {}

exports.handler = function(input, context) {
    // decode input from base64
    var zippedInput = new Buffer.from(input.awslogs.data, 'base64');

    // decompress the input
    zlib.gunzip(zippedInput, function(error, buffer) {
        if (error) { context.fail(error); return; }

        // parse the input from JSON
        var awslogsData = JSON.parse(buffer.toString('utf8'));

        // transform the input to Elasticsearch documents array
        var elasticsearchBulkArray = transform(awslogsData);

        // skip control messages
        if (!elasticsearchBulkArray) {
            console.log('Received a control message');
            context.succeed('Control message handled successfully');
            return;
        }

        var elasticsearchBulkPayload = esDocumentArrayToPayload(elasticsearchBulkArray);

        // post documents to the Amazon Elasticsearch Service
        post(elasticsearchBulkPayload, function(error, success, statusCode, failedItems) {
            console.log('Response: ' + JSON.stringify({ 
                "statusCode": statusCode 
            }));

            if (error) { 
                console.log('Error: ' + JSON.stringify(error, null, 2));

                if (failedItems && failedItems.length > 0) {
                    console.log("Failed Items: " +
                        JSON.stringify(failedItems, null, 2));

                    var failedLogs = findFailedLogs(failedItems, elasticsearchBulkArray);
                    failedLogs.forEach( failedLog => {
                        console.log("Failed log content: " + JSON.stringify(failedLog, null, 2));
                    });
                }

                context.fail(JSON.stringify(error));
            } else {
                console.log('Success: ' + JSON.stringify(success));
                context.succeed('Success');
            }
        });
    });
};

function findFailedLogs(failedItems, esBulkArray) {
    var failedLogs = [];

    failedItems.forEach(item => {
        var _id = item && item.index && item.index._id;
        if (_id) {
            var failedLog = esBulkArray.find(esLog => esLog && esLog.id === _id);
            if (failedLog) {
                failedLogs.push(failedLog);
            }
        }
    });

    return failedLogs;
}

function esDocumentArrayToPayload(esDocumentArray) {
    return esDocumentArray.map(
        item => {
            return [
                JSON.stringify(item.action),
                JSON.stringify(item.source)
            ].join('\n');
        }
    ).join('\n') + '\n';
}

function transform(payload) {
    if (payload.messageType === 'CONTROL_MESSAGE') {
        return null;
    }

    var bulkRequest = [];

    payload.logEvents.forEach(function(logEvent) {
        var timestamp = new Date(1 * logEvent.timestamp);

        // index name format: indexPrefix-YYYY.MM.DD where '.' can be customized using indexDateSeparator
        var indexName = [
            indexPrefix + '-' + timestamp.getUTCFullYear(),   // year
            ('0' + (timestamp.getUTCMonth() + 1)).slice(-2),  // month
            ('0' + timestamp.getUTCDate()).slice(-2)          // day
        ].join(indexDateSeparator);

        var id = logEvent.id;

        var source = buildSource(logEvent.message, logEvent.extractedFields);
        source['@id'] = id;
        source['@timestamp'] = new Date(1 * logEvent.timestamp).toISOString();
        source['@message'] = logEvent.message;
        source['@owner'] = payload.owner;
        source['@log_group'] = payload.logGroup;
        source['@log_stream'] = payload.logStream;
        if (tags) {
            source['@tags'] = tags;
        }

        var action = { "index": {} };
        action.index._index = indexName;
        action.index._type = 'serverless-es-logs';
        action.index._id = id;
        
        bulkRequest.push({ id, action, source });
    });
    return bulkRequest;
}

/**
 * Remove array fields from event data to reduce index fields size.
 */
const MaxFieldLevel = 5;
const clean = (data, level = 0) => {
    for (const key in data) {
        // Remove keys from data to prevent field explode
        if (Array.isArray(data[key]) || level > MaxFieldLevel || /^[^a-z@]/i.test(String(key))) {
            delete data[key];
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            data[key] = clean(data[key], level + 1);
        } else if (String(key).toLocaleLowerCase().includes('date') && data[key] === ''){
            // https://stackoverflow.com/questions/15924632/empty-string-in-elasticsearch-date-field
            data[key] = null
        }
    }
    return data;
};

function buildSource(message, extractedFields) {
    var jsonSubString = null;
    if (extractedFields) {
        var source = {};

        for (var key in extractedFields) {
            if (extractedFields.hasOwnProperty(key) && extractedFields[key]) {
                var value = extractedFields[key];

                if (isNumeric(value)) {
                    source[key] = 1 * value;
                    continue;
                }

                jsonSubString = extractJson(value);
                if (jsonSubString !== null) {
                    source['@' + key] = clean(JSON.parse(jsonSubString));
                }

                source[key] = (key === 'apigw_request_id') ? value.slice(1, value.length - 1) : value;
            }
        }
        return source;
    }

    jsonSubString = extractJson(message);
    if (jsonSubString !== null) { 
        return JSON.parse(jsonSubString); 
    }

    return {};
}

function extractJson(message) {
    var jsonStart = message.indexOf('{');
    if (jsonStart < 0) return null;
    var jsonSubString = message.substring(jsonStart);
    return isValidJson(jsonSubString) ? jsonSubString : null;
}

function isValidJson(message) {
    try {
        JSON.parse(message);
    } catch (e) { return false; }
    return true;
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function post(body, callback) {
    var requestParams = buildRequest(endpoint, body);

    var request = https.request(requestParams, function(response) {
        var responseBody = '';
        response.on('data', function(chunk) {
            responseBody += chunk;
        });
        response.on('end', function() {
            var info = JSON.parse(responseBody);
            var failedItems;
            var success;
            
            if (response.statusCode >= 200 && response.statusCode < 299) {
                failedItems = info.items.filter(function(x) {
                    return x.index.status >= 300;
                });

                success = { 
                    "attemptedItems": info.items.length,
                    "successfulItems": info.items.length - failedItems.length,
                    "failedItems": failedItems.length
                };
            }

            var error = response.statusCode !== 200 || info.errors === true ? {
                "statusCode": response.statusCode,
                "responseBody": responseBody
            } : null;

            callback(error, success, response.statusCode, failedItems);
        });
    }).on('error', function(e) {
        callback(e);
    });
    request.end(requestParams.body);
}

function buildRequest(endpoint, body) {
    var endpointParts = endpoint.match(/^([^\.]+)\.?([^\.]*)\.?([^\.]*)\.amazonaws\.com$/);
    var region = endpointParts[2];
    var service = endpointParts[3];
    var datetime = (new Date()).toISOString().replace(/[:\-]|\.\d{3}/g, '');
    var date = datetime.substr(0, 8);
    var kDate = hmac('AWS4' + process.env.AWS_SECRET_ACCESS_KEY, date);
    var kRegion = hmac(kDate, region);
    var kService = hmac(kRegion, service);
    var kSigning = hmac(kService, 'aws4_request');
    
    var request = {
        host: endpoint,
        method: 'POST',
        path: '/_bulk',
        body: body,
        headers: { 
            'Content-Type': 'application/json',
            'Host': endpoint,
            'Content-Length': Buffer.byteLength(body),
            'X-Amz-Security-Token': process.env.AWS_SESSION_TOKEN,
            'X-Amz-Date': datetime
        }
    };

    var canonicalHeaders = Object.keys(request.headers)
        .sort(function(a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; })
        .map(function(k) { return k.toLowerCase() + ':' + request.headers[k]; })
        .join('\n');

    var signedHeaders = Object.keys(request.headers)
        .map(function(k) { return k.toLowerCase(); })
        .sort()
        .join(';');

    var canonicalString = [
        request.method,
        request.path, '',
        canonicalHeaders, '',
        signedHeaders,
        hash(request.body, 'hex'),
    ].join('\n');

    var credentialString = [ date, region, service, 'aws4_request' ].join('/');

    var stringToSign = [
        'AWS4-HMAC-SHA256',
        datetime,
        credentialString,
        hash(canonicalString, 'hex')
    ] .join('\n');

    request.headers.Authorization = [
        'AWS4-HMAC-SHA256 Credential=' + process.env.AWS_ACCESS_KEY_ID + '/' + credentialString,
        'SignedHeaders=' + signedHeaders,
        'Signature=' + hmac(kSigning, stringToSign, 'hex')
    ].join(', ');

    return request;
}

function hmac(key, str, encoding) {
    return crypto.createHmac('sha256', key).update(str, 'utf8').digest(encoding);
}

function hash(str, encoding) {
    return crypto.createHash('sha256').update(str, 'utf8').digest(encoding);
}
