import * as S3 from 'aws-sdk/clients/s3';
import * as sharp from 'sharp';
import * as stream from 'stream';
import {YC} from "./yc";

const re = RegExp('(\.jpg|\.png)$', 'i');
const MIN_WIDTH = 100;
const MIN_HEIGHT = 100;
const MAX_WIDTH = 1000;
const MAX_HEIGHT = 1000;

const {AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET, PREFIX} = process.env;

const s3Config: S3.Types.ClientConfiguration = {
    apiVersion: '2006-03-01',
    region: 'ru-central1',
    signatureVersion: 'v4',
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
    endpoint: 'storage.yandexcloud.net',
    s3ForcePathStyle: true,
};
const s3 = new S3(s3Config);

function ensureValueInRange(val: number, min: number, max: number): number {
    return Math.min(Math.max(val, min), max);
}

export async function handler(event: YC.CloudFunctionsHttpEvent) {

    const [dimensions, ...path] = event.queryStringParameters['path'].split('/')
    const [sWidth, sHeight] = dimensions.split("x")
    const object_id = path[path.length - 1];
    if (object_id.match(re) === null) {
        return;
    }
    const width = ensureValueInRange(parseInt(sWidth, 10), MIN_WIDTH, MAX_WIDTH);
    const height = ensureValueInRange(parseInt(sHeight, 10), MIN_HEIGHT, MAX_HEIGHT);


    const [ext,] = object_id.split(".").reverse()
    // As I pass through only 2 file extensions I can simply define content type as follows
    const contentType = ext.toLowerCase() == "png" ? "image/png" : "image/jpg"

    const transformer = sharp().resize({
        width,
        height,
        fit: sharp.fit.cover,
    });

    const s3GetObjectStream = s3.getObject({
        Bucket: BUCKET,
        Key: [PREFIX, ...path].join('/')
    }).createReadStream();

    const pass = new stream.PassThrough();

    let body: string = '';
    const bufs = [];

    pass.on('data', function (d) {
        bufs.push(d);
    });
    pass.on('end', function () {
        body = Buffer.concat(bufs).toString('base64');
    })

    const result = s3.upload({
            Bucket: BUCKET,
            Key: [PREFIX, dimensions, ...path].join('/'),
            Body: pass,
            ContentType: contentType
        }
    ).promise();

    s3GetObjectStream
        .pipe(transformer)
        .pipe(pass);


    await result;
    return {
        statusCode: 200,
        headers: {
            "Content-Type": contentType
        },
        isBase64Encoded: true,
        body,
    }
}
