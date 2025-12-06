import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const extractBucketNameAndKey = (uri: string) => {
  const uriWithoutPrefix = uri.replace("s3://", "");
  const firstSlashIndex = uriWithoutPrefix.indexOf("/");
  const bucket = uriWithoutPrefix.substring(0, firstSlashIndex);
  const key = uriWithoutPrefix.substring(firstSlashIndex + 1);

  return { bucket, key };
};


export const getPreSignedUrl = async (key: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
  });

  // TODO: move this function to shared library
  const presignedUrl = await getSignedUrl(
    new S3Client({
      region: env.AWS_REGION,
    }),
    command,
    {
      expiresIn: env.S3_SIGNED_URL_EXPIRY_TIME,
    }
  );

  return presignedUrl;
}

export const getFileUrl = async (uri: string) => {
  const httpsRegex = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;
  
  if (httpsRegex.test(uri)) {
    return uri; // No need to sign for HTTP(S) URLs.
  } else if (uri.includes("s3://")) {
    const { bucket, key } = extractBucketNameAndKey(uri);
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });

    const presignedUrl = await getSignedUrl(
      new S3Client({
        region: env.AWS_REGION,
      }),
      command,
      {
        expiresIn: env.S3_SIGNED_URL_EXPIRY_TIME,
      }
    );

    return presignedUrl;
  }
  return uri;
};
