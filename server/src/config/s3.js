const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const hasAwsCredentials = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

let s3Client = null;
if (hasAwsCredentials) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Local storage directory fallback
const LOCAL_STORAGE_DIR = path.join(__dirname, '../../uploads');

// Create local upload directory only outside Vercel.
// Vercel's filesystem should not be used for persistent uploads.
if (!process.env.VERCEL && !fs.existsSync(LOCAL_STORAGE_DIR)) {
  fs.mkdirSync(LOCAL_STORAGE_DIR, { recursive: true });
}

/**
 * Uploads a file buffer to S3 (or local fallback storage)
 * @param {Buffer} buffer
 * @param {string} key
 * @param {string} mimetype
 * @returns {Promise<{ key: string, location: string }>}
 */
const uploadFile = async (buffer, key, mimetype) => {
  if (hasAwsCredentials && s3Client) {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    });
    await s3Client.send(command);
    return {
      key,
      location: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`,
    };
  }

// Local fallback storage is for local development only.
if (process.env.VERCEL) {
  throw new Error(
    'Resume storage is not configured. Configure AWS S3 for production.'
  );
}

const filePath = path.join(LOCAL_STORAGE_DIR, key);
const dirPath = path.dirname(filePath);

await fs.promises.mkdir(dirPath, { recursive: true });
await fs.promises.writeFile(filePath, buffer);

return {
  key,
  location: `/api/profile/resumes/download/${key}`,
};
};

/**
 * Generates a short-lived signed URL for a resume key
 * @param {string} key
 * @param {number} expiresInSeconds
 * @returns {Promise<string>}
 */
const getPresignedResumeUrl = async (key, expiresInSeconds = 900) => {
  if (hasAwsCredentials && s3Client) {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
  }

  // Local fallback: generate HMAC signed token expiring in expiresInSeconds
  const expires = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const secret = process.env.JWT_ACCESS_SECRET || 'hireflow_secret';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${key}:${expires}`)
    .digest('hex');

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/api/profile/resumes/view/${encodeURIComponent(key)}?expires=${expires}&sig=${signature}`;
};

/**
 * Validates local fallback signed URL
 */
const verifyLocalSignature = (key, expires, signature) => {
  if (!expires || !signature) return false;
  if (Number(expires) < Math.floor(Date.now() / 1000)) return false;

  const secret = process.env.JWT_ACCESS_SECRET || 'hireflow_secret';
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${key}:${expires}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
};

module.exports = {
  uploadFile,
  getPresignedResumeUrl,
  verifyLocalSignature,
  LOCAL_STORAGE_DIR,
};
