import * as S3 from 'aws-sdk/clients/s3';

const {AWS_ACCESS_KEY, AWS_SECRET_KEY, BUCKET, FUNCTION_ID, PREFIX} = process.env;

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

s3.putBucketWebsite({
    Bucket: BUCKET,
    WebsiteConfiguration: {
        IndexDocument: {
            Suffix: "index.html"
        },
        RoutingRules: [
            {
                Condition: {
                    HttpErrorCodeReturnedEquals: "404",
                    KeyPrefixEquals: PREFIX + "/"
                },
                Redirect: {
                    HttpRedirectCode: "302",
                    HostName: "functions.yandexcloud.net",
                    Protocol: "https",
                    ReplaceKeyPrefixWith: `${FUNCTION_ID}?path=`,
                }
            }
        ]
    }
}).promise()
    .then(() => {
        const w = s3.getBucketWebsite({
            Bucket: BUCKET,
        });
        w.promise().then(res => console.log('website:', JSON.stringify(res)));
    })
    .catch(err => console.log(err))
