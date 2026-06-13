'use strict';

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../lib/prisma');
const { success, error } = require('../lib/response');
const { compressImage } = require('../lib/compress');
const { uploadFile, deleteFile } = require('../lib/storage');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ─── GET /seeker — get own seeker profile ─────────────────────────────────────

router.get('/seeker', verifyToken, async (req, res) => {
  try {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return error(res, 'Seeker profile not found', 404);
    return success(res, profile);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch seeker profile', 500);
  }
});

// ─── PUT /seeker — update seeker profile with optional photo upload ───────────

router.put('/seeker', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const profile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return error(res, 'Seeker profile not found', 404);

    const allowedFields = [
      'firstName', 'lastName', 'nationality', 'currentCountry', 'currentCity',
      'dateOfBirth', 'gender', 'currentJobTitle', 'industryId', 'totalExperience',
      'educationLevel', 'fieldOfStudy', 'expectedSalaryMin', 'expectedSalaryMax',
      'salaryCurrency', 'jobTypePreference', 'countriesOpenTo', 'skills', 'languages',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        // Handle JSON fields
        if (['jobTypePreference', 'countriesOpenTo', 'skills'].includes(field)) {
          updateData[field] = Array.isArray(req.body[field])
            ? req.body[field]
            : JSON.parse(req.body[field]);
        } else if (field === 'languages') {
          updateData[field] = typeof req.body[field] === 'string'
            ? JSON.parse(req.body[field])
            : req.body[field];
        } else if (['totalExperience', 'expectedSalaryMin', 'expectedSalaryMax'].includes(field)) {
          updateData[field] = parseInt(req.body[field], 10);
        } else if (field === 'dateOfBirth') {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    }

    // Handle photo upload
    if (req.file) {
      // Delete old photo
      if (profile.photoKey) {
        await deleteFile(profile.photoKey).catch(() => {});
      }
      const compressed = await compressImage(req.file.buffer, { preset: 'profile' });
      const key = `profiles/${req.user.id}/photo-${uuidv4()}.webp`;
      await uploadFile(key, compressed, 'image/webp');
      const photoUrl = `${process.env.B2_PUBLIC_URL}/${key}`;
      updateData.photoUrl = photoUrl;
      updateData.photoKey = key;
    }

    const updated = await prisma.jobSeekerProfile.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    return success(res, updated, 'Profile updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update seeker profile', 500);
  }
});

// ─── GET /employer — get own employer profile ─────────────────────────────────

router.get('/employer', verifyToken, async (req, res) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return error(res, 'Employer profile not found', 404);

    // Exclude sensitive LLM key from response
    const { llmApiKey, llmGuidePdfKey, ...safeProfile } = profile;
    return success(res, safeProfile);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch employer profile', 500);
  }
});

// ─── PUT /employer — update employer profile with optional logo upload ─────────

router.put('/employer', verifyToken, requireRole('EMPLOYER'), upload.single('logo'), async (req, res) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return error(res, 'Employer profile not found', 404);

    const allowedFields = [
      'companyName', 'description', 'industry', 'companySize',
      'countryId', 'cityId', 'website', 'linkedin',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    // Handle logo upload
    if (req.file) {
      if (profile.logoKey) {
        await deleteFile(profile.logoKey).catch(() => {});
      }
      const compressed = await compressImage(req.file.buffer, { preset: 'logo' });
      const key = `employers/${req.user.id}/logo-${uuidv4()}.webp`;
      await uploadFile(key, compressed, 'image/webp');
      updateData.logoUrl = `${process.env.B2_PUBLIC_URL}/${key}`;
      updateData.logoKey = key;
    }

    const updated = await prisma.employerProfile.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    const { llmApiKey, llmGuidePdfKey, ...safeProfile } = updated;
    return success(res, safeProfile, 'Employer profile updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update employer profile', 500);
  }
});

// ─── PUT /employer/llm — update LLM settings ──────────────────────────────────

router.put('/employer/llm', verifyToken, requireRole('EMPLOYER'), upload.single('guidePdf'), async (req, res) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!profile) return error(res, 'Employer profile not found', 404);

    const validProviders = ['OPENAI', 'ANTHROPIC', 'GOOGLE', 'DEEPSEEK'];
    const updateData = {};

    if (req.body.llmProvider !== undefined) {
      if (!validProviders.includes(req.body.llmProvider)) {
        return error(res, `Provider must be one of: ${validProviders.join(', ')}`, 400);
      }
      updateData.llmProvider = req.body.llmProvider;
    }
    if (req.body.llmApiKey !== undefined) updateData.llmApiKey = req.body.llmApiKey;

    // Handle guide PDF upload
    if (req.file) {
      if (profile.llmGuidePdfKey) {
        await deleteFile(profile.llmGuidePdfKey).catch(() => {});
      }
      const key = `employers/${req.user.id}/guide-${uuidv4()}.pdf`;
      await uploadFile(key, req.file.buffer, 'application/pdf');
      updateData.llmGuidePdfUrl = `${process.env.B2_PUBLIC_URL}/${key}`;
      updateData.llmGuidePdfKey = key;
    }

    await prisma.employerProfile.update({
      where: { userId: req.user.id },
      data: updateData,
    });

    return success(res, null, 'LLM settings updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update LLM settings', 500);
  }
});

module.exports = router;
