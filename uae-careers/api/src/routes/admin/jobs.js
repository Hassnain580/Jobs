'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { slugify, slugifyWithSuffix } = require('../../lib/slugify');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── Slug uniqueness helper ───────────────────────────────────────────────────

const uniqueSlug = async (title, existingId = null) => {
  const base = slugify(title);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.job.findUnique({ where: { slug } });
    if (!existing || existing.id === existingId) break;
    slug = slugifyWithSuffix(base, counter++);
  }
  return slug;
};

// ─── GET / — list all jobs ────────────────────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const {
      status, categoryId, countryId, cityId, employerId,
      search, page = '1', limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (countryId) where.countryId = countryId;
    if (cityId) where.cityId = cityId;
    if (employerId) where.employerId = employerId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: { select: { companyName: true, logoUrl: true, userId: true } },
          category: { select: { id: true, name: true } },
          country: { select: { id: true, name: true, code: true } },
          city: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    return success(res, {
      jobs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch jobs', 500);
  }
});

// ─── PUT /:id/approve — approve job ──────────────────────────────────────────

router.put('/:id/approve', ...adminGuard, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE', postedAt: job.postedAt || new Date() },
    });

    return success(res, updated, 'Job approved');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to approve job', 500);
  }
});

// ─── PUT /:id/reject — reject job with reason ─────────────────────────────────

router.put('/:id/reject', ...adminGuard, async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        importantNote: reason ? `Rejection reason: ${reason}` : job.importantNote,
      },
    });

    return success(res, updated, 'Job rejected');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to reject job', 500);
  }
});

// ─── PUT /:id — admin edit any job field ─────────────────────────────────────

router.put('/:id', ...adminGuard, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);

    const editableFields = [
      'title', 'categoryId', 'countryId', 'cityId', 'description',
      'responsibilities', 'requirements', 'importantNote',
      'salaryMin', 'salaryMax', 'salaryCurrency', 'salaryHidden',
      'experienceMin', 'experienceMax', 'educationLevel', 'jobType',
      'applyMethod', 'applyEmail', 'applyUrl', 'applyWhatsapp',
      'isWalkIn', 'walkInDate', 'walkInVenue', 'status',
      'isSponsored', 'isFeatured', 'expiresAt', 'postedAt',
      'metaTitle', 'metaDescription',
    ];

    const updateData = {};
    for (const field of editableFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (updateData.title && updateData.title !== job.title) {
      updateData.slug = await uniqueSlug(updateData.title, job.id);
      if (!updateData.metaTitle) updateData.metaTitle = updateData.title;
    }
    if (updateData.description && !updateData.metaDescription) {
      updateData.metaDescription = updateData.description.substring(0, 160);
    }

    const updated = await prisma.job.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return success(res, updated, 'Job updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update job', 500);
  }
});

// ─── DELETE /:id — delete job ─────────────────────────────────────────────────

router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);

    await prisma.job.delete({ where: { id: req.params.id } });
    return success(res, null, 'Job deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete job', 500);
  }
});

module.exports = router;
