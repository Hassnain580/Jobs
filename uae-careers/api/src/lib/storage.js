const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl: awsGetSignedUrl } = require('@aws-sdk/s3-request-presigner');

const client = new S3Client({
  endpoint: process.env.B2_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

const BUCKET = process.env.B2_BUCKET_NAME;

const uploadFile = async (key, buffer, mimetype) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mimetype,
  });
  await client.send(command);
  return key;
};

const deleteFile = async (key) => {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await client.send(command);
};

const getSignedUrl = async (key, expiresIn = 3600) => {
  const { GetObjectCommand } = require('@aws-sdk/client-s3');
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return awsGetSignedUrl(client, command, { expiresIn });
};

module.exports = { uploadFile, deleteFile, getSignedUrl };
