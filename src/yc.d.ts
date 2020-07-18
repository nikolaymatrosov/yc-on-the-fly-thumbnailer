export namespace YC {
    export interface CloudFunctionsHttpEvent {
        httpMethod: string,
        headers?: { [id: string]: string },
        path?: string,
        multiValueHeaders?: { [id: string]: string[] },
        queryStringParameters?: { [id: string]: string },
        multiValueQueryStringParameters?: { [id: string]: string[] },
        requestContext?: {
            identity: {
                sourceIp: string,
                userAgent: string
            },
            httpMethod: string,
            requestId: string,
            requestTime: string,
            requestTimeEpoch: number
        },
        body?: string,
        isBase64Encoded?: boolean
    }
}



