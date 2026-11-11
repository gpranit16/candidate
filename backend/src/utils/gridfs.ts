import mongoose from 'mongoose';
import { Readable } from 'stream';

const BUCKET_NAME = 'resumes';

export function getResumeBucket() {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection is not initialized for GridFS');
  }
  return new mongoose.mongo.GridFSBucket(db, { bucketName: BUCKET_NAME });
}

export async function uploadResumeToGridFS(params: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  userId: string;
}): Promise<mongoose.Types.ObjectId> {
  const bucket = getResumeBucket();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      contentType: params.contentType,
      metadata: {
        userId: params.userId,
        contentType: params.contentType,
        originalName: params.filename,
        size: params.buffer.length,
        uploadedAt: new Date(),
      },
    });

    const readable = Readable.from(params.buffer);
    readable
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve(uploadStream.id as unknown as mongoose.Types.ObjectId);
      });
  });
}

export async function getResumeFileMetadata(fileId: mongoose.Types.ObjectId | string) {
  const db = mongoose.connection.db;
  if (!db) return null;

  const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
  const fileDoc = await db.collection(`${BUCKET_NAME}.files`).findOne({ _id: objectId });
  if (!fileDoc) return null;

  return {
    fileId: fileDoc._id.toString(),
    filename: fileDoc.filename as string,
    contentType:
      (fileDoc.contentType as string | undefined) ||
      (fileDoc.metadata?.contentType as string | undefined) ||
      'application/octet-stream',
    size: fileDoc.length as number,
    uploadedAt: fileDoc.uploadDate as Date,
    userId: fileDoc.metadata?.userId as string | undefined,
  };
}

export async function deleteResumeFromGridFS(fileId: mongoose.Types.ObjectId | string): Promise<void> {
  try {
    const bucket = getResumeBucket();
    const objectId = typeof fileId === 'string' ? new mongoose.Types.ObjectId(fileId) : fileId;
    await bucket.delete(objectId as unknown as Parameters<typeof bucket.delete>[0]);
  } catch {
    // File may already be deleted; ignore missing GridFS chunk errors cleanly.
  }
}
