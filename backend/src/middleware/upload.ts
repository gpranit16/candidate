import multer from 'multer';
import path from 'path';
import { AppError } from '../utils/AppError';

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx']);
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_RESUME_SIZE_BYTES,
    files: 1,
  },
  fileFilter(_req: any, file: any, cb: any) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new AppError(
          'Only PDF, DOC, and DOCX files are accepted for resumes.',
          400,
          'INVALID_FILE_TYPE'
        )
      );
    }
    cb(null, true);
  },
});

export function validateResumeMagicBytes(buffer: Buffer, ext: string): boolean {
  if (!buffer || buffer.length < 4) return false;

  const normalizedExt = ext.toLowerCase();
  if (normalizedExt === '.pdf') {
    // %PDF
    return buffer.subarray(0, 4).toString('ascii') === '%PDF';
  }
  if (normalizedExt === '.doc') {
    // OLE2 compound document: D0 CF 11 E0
    return (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0
    );
  }
  if (normalizedExt === '.docx') {
    // ZIP container: PK\x03\x04
    return (
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      buffer[2] === 0x03 &&
      buffer[3] === 0x04
    );
  }
  return false;
}

