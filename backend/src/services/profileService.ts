import path from 'path';
import { User } from '../models/User';
import {
  CandidateProfile,
  computeProfileCompletion,
  IEducationItem,
  IExperienceItem,
} from '../models/CandidateProfile';
import { AppError } from '../utils/AppError';
import {
  deleteResumeFromGridFS,
  getResumeBucket,
  getResumeFileMetadata,
  uploadResumeToGridFS,
} from '../utils/gridfs';
import { validateResumeMagicBytes } from '../middleware/upload';

async function ensureProfile(userId: string) {
  let profile = await CandidateProfile.findOne({ userId });
  if (!profile) {
    const user = await User.findById(userId).lean();
    profile = await CandidateProfile.create({
      userId,
      profileCompletion: computeProfileCompletion({ name: user?.name }),
    });
  }
  return profile;
}

export async function getCandidateProfile(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
  }

  const profile = await ensureProfile(userId);
  const resumeMeta = profile.resumeFileId
    ? await getResumeFileMetadata(profile.resumeFileId)
    : null;

  return {
    user: user.toJSON(),
    profile: {
      ...profile.toJSON(),
      resume: resumeMeta,
    },
  };
}

export async function updateCandidateProfile(
  userId: string,
  payload: {
    name?: string;
    phone?: string;
    location?: string;
    headline?: string;
    bio?: string;
    skills?: string[];
    education?: IEducationItem[];
    experience?: IExperienceItem[];
  }
) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
  }

  if (payload.name && payload.name.trim().length >= 2) {
    user.name = payload.name.trim();
    await user.save();
  }

  const profile = await ensureProfile(userId);

  const normalizedSkills = Array.from(
    new Set((payload.skills ?? profile.skills).map((s) => s.trim()).filter(Boolean))
  );

  profile.phone = payload.phone ?? profile.phone;
  profile.location = payload.location ?? profile.location;
  profile.headline = payload.headline ?? profile.headline;
  profile.bio = payload.bio ?? profile.bio;
  profile.skills = normalizedSkills;
  if (payload.education !== undefined) {
    profile.education = payload.education.map((edu) => ({
      ...edu,
      endYear: edu.endYear ?? undefined,
    }));
  }
  if (payload.experience !== undefined) {
    profile.experience = payload.experience.map((exp) => ({
      ...exp,
      endDate: exp.currentlyWorking ? undefined : exp.endDate || undefined,
    }));
  }

  profile.profileCompletion = computeProfileCompletion({
    name: user.name,
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    bio: profile.bio,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    resumeFileId: profile.resumeFileId,
  });

  await profile.save();

  const resumeMeta = profile.resumeFileId
    ? await getResumeFileMetadata(profile.resumeFileId)
    : null;

  return {
    user: user.toJSON(),
    profile: {
      ...profile.toJSON(),
      resume: resumeMeta,
    },
  };
}

export async function uploadCandidateResume(userId: string, file: Express.Multer.File) {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!validateResumeMagicBytes(file.buffer, ext)) {
    throw new AppError(
      'File contents do not match a valid PDF, DOC, or DOCX document.',
      400,
      'INVALID_FILE_SIGNATURE'
    );
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
  }

  const profile = await ensureProfile(userId);
  const previousFileId = profile.resumeFileId;

  const safeFilename = path.basename(file.originalname).replace(/[^\w.\-() ]+/g, '_');

  const newFileId = await uploadResumeToGridFS({
    buffer: file.buffer,
    filename: safeFilename,
    contentType: file.mimetype,
    userId,
  });

  profile.resumeFileId = newFileId as unknown as typeof profile.resumeFileId;
  profile.profileCompletion = computeProfileCompletion({
    name: user.name,
    phone: profile.phone,
    location: profile.location,
    headline: profile.headline,
    bio: profile.bio,
    skills: profile.skills,
    education: profile.education,
    experience: profile.experience,
    resumeFileId: profile.resumeFileId,
  });

  await profile.save();

  if (previousFileId) {
    await deleteResumeFromGridFS(previousFileId);
  }

  const resumeMeta = await getResumeFileMetadata(newFileId);
  return {
    resume: resumeMeta,
    profileCompletion: profile.profileCompletion,
  };
}

export async function getCandidateResumeDownload(userId: string) {
  const profile = await CandidateProfile.findOne({ userId }).lean();
  if (!profile?.resumeFileId) {
    throw new AppError('No resume uploaded yet.', 404, 'RESUME_NOT_FOUND');
  }

  const meta = await getResumeFileMetadata(profile.resumeFileId);
  if (!meta) {
    throw new AppError('Resume file could not be found in storage.', 404, 'RESUME_MISSING');
  }

  const bucket = getResumeBucket();
  const stream = bucket.openDownloadStream(profile.resumeFileId);

  return { meta, stream };
}

