'use strict';

const express = require('express');
const prisma = require('../lib/prisma');
const { success, error } = require('../lib/response');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// ─── POST /jobs/:jobId/apply — apply for a job ────────────────────────────────

router.post('/jobs/:jobId/apply', verifyToken, requireRole('JOB_SEEKER'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { category: true },
    });

    if (!job) return error(res, 'Job not found', 404);
    if (job.status !== 'ACTIVE') return error(res, 'Job is not accepting applications', 400);

    // Return contact info only for non-IN_APP methods
    if (job.applyMethod !== 'IN_APP') {
      const contactInfo = {};
      if (job.applyMethod === 'EMAIL') contactInfo.applyEmail = job.applyEmail;
      if (job.applyMethod === 'EXTERNAL_URL') contactInfo.applyUrl = job.applyUrl;
      if (job.applyMethod === 'WHATSAPP') contactInfo.applyWhatsapp = job.applyWhatsapp;
      return success(res, { applyMethod: job.applyMethod, ...contactInfo }, 'Apply via the provided contact method');
    }

    // Check for duplicate application
    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId: req.user.id } },
    });
    if (existing) return error(res, 'You have already applied for this job', 409);

    // Get seeker CV url if available
    const seekerProfile = await prisma.jobSeekerProfile.findUnique({
      where: { userId: req.user.id },
      select: { cvUrl: true },
    });

    const application = await prisma.application.create({
      data: {
        jobId,
        userId: req.user.id,
        coverLetter: coverLetter || null,
        cvUrl: seekerProfile?.cvUrl || null,
        status: 'APPLIED',
      },
    });

    return success(res, application, 'Application submitted successfully', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to apply for job', 500);
  }
});

// ─── GET /my — my applications (JOB_SEEKER) ──────────────────────────────────

router.get('/my', verifyToken, requireRole('JOB_SEEKER'), async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where: { userId: req.user.id },
        include: {
          job: {
            include: {
              employer: { select: { companyName: true, logoUrl: true } },
              category: { select: { id: true, name: true } },
              country: { select: { id: true, name: true } },
              city: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where: { userId: req.user.id } }),
    ]);

    return success(res, {
      applications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch applications', 500);
  }
});

// ─── GET /job/:jobId — all applicants for a job (EMPLOYER) ───────────────────

router.get('/job/:jobId', verifyToken, requireRole('EMPLOYER'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = '1', limit = '20', status } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return error(res, 'Employer profile not found', 404);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return error(res, 'Job not found', 404);
    if (job.employerId !== employer.id) return error(res, 'Forbidden', 403);

    const where = { jobId };
    if (status) where.status = status;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              jobSeekerProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                  photoUrl: true,
                  currentJobTitle: true,
                  totalExperience: true,
                  nationality: true,
                  cvUrl: true,
                  skills: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.application.count({ where }),
    ]);

    return success(res, {
      applications,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch applicants', 500);
  }
});

// ─── PUT /:applicationId/status — update application status (EMPLOYER) ────────

router.put('/:applicationId/status', verifyToken, requireRole('EMPLOYER'), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const validStatuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'REJECTED'];
    if (!status || !validStatuses.includes(status)) {
      return error(res, `Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return error(res, 'Employer profile not found', 404);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) return error(res, 'Application not found', 404);
    if (application.job.employerId !== employer.id) return error(res, 'Forbidden', 403);

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });

    return success(res, updated, 'Application status updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update application status', 500);
  }
});

module.exports = router;
