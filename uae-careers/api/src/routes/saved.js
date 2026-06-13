'use strict';

const express = require('express');
const prisma = require('../lib/prisma');
const { success, error } = require('../lib/response');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── POST /:jobId — save a job ────────────────────────────────────────────────

router.post('/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return error(res, 'Job not found', 404);

    const existing = await prisma.savedJob.findUnique({
      where: { jobId_userId: { jobId, userId: req.user.id } },
    });
    if (existing) return error(res, 'Job already saved', 409);

    const saved = await prisma.savedJob.create({
      data: { jobId, userId: req.user.id },
    });

    return success(res, saved, 'Job saved', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to save job', 500);
  }
});

// ─── DELETE /:jobId — unsave a job ────────────────────────────────────────────

router.delete('/:jobId', verifyToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const existing = await prisma.savedJob.findUnique({
      where: { jobId_userId: { jobId, userId: req.user.id } },
    });
    if (!existing) return error(res, 'Saved job not found', 404);

    await prisma.savedJob.delete({
      where: { jobId_userId: { jobId, userId: req.user.id } },
    });

    return success(res, null, 'Job removed from saved list');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to unsave job', 500);
  }
});

// ─── GET / — list saved jobs ──────────────────────────────────────────────────

router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [savedJobs, total] = await Promise.all([
      prisma.savedJob.findMany({
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
        orderBy: { savedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.savedJob.count({ where: { userId: req.user.id } }),
    ]);

    return success(res, {
      savedJobs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch saved jobs', 500);
  }
});

module.exports = router;
