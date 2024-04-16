/**
 * simple http server to run the lambda on local PC for dev/test
 * NOT INTENDED FOR PRODUCTION USE
 */
'use strict';

import { createServer } from 'node:http';
import { URL } from 'node:url';

const config = {
    port: process.env.PORT || 3000,
};

const server = createServer((request, response) => {
    const context = {};
    context.requestId = Math.random().toString(36).substring(7);
    console.info('request: ', request.method, request.url, context);
    let requestBody = '';

    request.on('data', (chunk) => {
        requestBody += chunk;
    });

    request.on('end', async () => {
        try {
            if (request.method === 'OPTIONS') {
                console.log('OPTIONS will respond with 200 and CORS headers');
                // CORS support
                response.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Credentials': 'true',
                    'Access-Control-Max-Age': '86400',
                });
                response.end();
                return;
            } else if (request.method === 'GET')
                if (request.url === '/') {
                    console.log(`${request.method} will respond with 200 and CORS headers`)
                    // CORS support
                    response.writeHead(200, {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                        'Access-Control-Allow-Credentials': 'true',
                        'Access-Control-Max-Age': '86200',
                    });
                    response.end();
                    return;
                } else {
                    let parsedUrl = new URL(request.url, `http://${request.headers.host}`);
                    console.log('parsedUrl.pathname: ', parsedUrl.pathname);
                    console.log('GET will use the lambda handler')
                    const bla = parsedUrl.searchParams.get('bla');
                    if (bla) {
                        console.log('bla: ', bla);
                    } else {
                        console.log('not not bla:');
                    }
                    response.end();
                    return;
                }

            else if (request.method === 'POST' && request.url === '/') {
                console.log('POST will use the lambda handler')
                const param1 = {
                    path: request.url,
                    httpMethod: request.method,
                    body: requestBody,
                    headers: request.headers,
                }
                const param2 = { awsRequestId: context.requestId }

                const headers = {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json',
                };
                const responseBody = JSON.stringify({
                    message: 'Hello from local server',
                    requestId: context.requestId
                });
                response.writeHead(200, headers);
                response.end(responseBody, 'utf-8');
                return;
            } else {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end(`No such route: ${request.method} ${request.url}`,
                    'utf-8');
            }
        } catch (err) {
            // we will get here only in case of real exception - all server issues are handled by lambda
            console.error('Failed to process request [%s %s]: %s',
                request.method, request.url, err.message);
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end(err.message, 'utf-8');
            return;
        }
    });
});

server.listen(config.port, () => {
    console.info('Server running at http://127.0.0.1:%s/', config.port);
});
