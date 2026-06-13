'use strict';

const express = require('express');
const prisma = require('../lib/prisma');
const { success, error } = require('../lib/response');
const { slugify, slugifyWithSuffix } = require('../lib/slugify');
const { getSetting } = require('../lib/settings');
const { verifyToken, requireRole, optionalAuth } = require('../middleware/auth');

const router = express.Router();

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

// ─── GET / — list jobs ────────────────────────────────────────────────────────

router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      categoryId,
      countryId,
      cityId,
      jobType,
      experienceMin,
      experienceMax,
      salaryMin,
      salaryMax,
      isWalkIn,
      isSponsored,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { status: 'ACTIVE' };

    if (categoryId) where.categoryId = categoryId;
    if (countryId) where.countryId = countryId;
    if (cityId) where.cityId = cityId;
    if (jobType) where.jobType = jobType;
    if (isWalkIn === 'true') where.isWalkIn = true;
    if (isSponsored === 'true') where.isSponsored = true;

    if (experienceMin !== undefined) where.experienceMin = { gte: parseInt(experienceMin, 10) };
    if (experienceMax !== undefined) where.experienceMax = { lte: parseInt(experienceMax, 10) };
    if (salaryMin !== undefined) where.salaryMin = { gte: parseInt(salaryMin, 10) };
    if (salaryMax !== undefined) where.salaryMax = { lte: parseInt(salaryMax, 10) };

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
          employer: { select: { companyName: true, logoUrl: true, industry: true } },
          category: { select: { id: true, name: true, slug: true } },
          country: { select: { id: true, name: true, code: true } },
          city: { select: { id: true, name: true } },
        },
        orderBy: [
          { isSponsored: 'desc' },
          { isFeatured: 'desc' },
          { postedAt: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.job.count({ where }),
    ]);

    // Fire-and-forget view tracking for logged-in users
    if (req.user && jobs.length > 0) {
      // Bulk increment views for listed jobs is intentionally skipped on list view
    }

    return success(res, {
      jobs,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch jobs', 500);
  }
});

// ─── GET /featured ────────────────────────────────────────────────────────────

router.get('/featured', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        OR: [{ isFeatured: true }, { isSponsored: true }],
      },
      include: {
        employer: { select: { companyName: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        country: { select: { id: true, name: true, code: true } },
        city: { select: { id: true, name: true } },
      },
      orderBy: [{ isSponsored: 'desc' }, { isFeatured: 'desc' }, { postedAt: 'desc' }],
      take: 10,
    });

    return success(res, jobs);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch featured jobs', 500);
  }
});

// ─── GET /walk-in ─────────────────────────────────────────────────────────────

router.get('/walk-in', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { status: 'ACTIVE', isWalkIn: true },
      include: {
        employer: { select: { companyName: true, logoUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        country: { select: { id: true, name: true, code: true } },
        city: { select: { id: true, name: true } },
      },
      orderBy: [{ isSponsored: 'desc' }, { walkInDate: 'asc' }, { createdAt: 'desc' }],
    });

    return success(res, jobs);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch walk-in jobs', 500);
  }
});

// ─── GET /:slug ───────────────────────────────────────────────────────────────

router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const job = await prisma.job.findUnique({
      where: { slug },
      include: {
        employer: {
          select: {
            companyName: true,
            logoUrl: true,
            description: true,
            industry: true,
            companySize: true,
            website: true,
            linkedin: true,
          },
        },
        category: true,
        country: { select: { id: true, name: true, code: true } },
        city: { select: { id: true, name: true } },
      },
    });

    if (!job) return error(res, 'Job not found', 404);
    if (job.status !== 'ACTIVE') return error(res, 'Job not available', 404);

    // Increment view count (fire and forget)
    prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } }).catch(() => {});

    // Product banners: category-specific (max 3) + global
    const [categoryBanners, globalBanners] = await Promise.all([
      job.categoryId
        ? prisma.productBanner.findMany({
            where: { categoryId: job.categoryId, isActive: true },
            include: { product: true },
            orderBy: { sortOrder: 'asc' },
            take: 3,
          })
        : [],
      prisma.product.findMany({
        where: { isGlobal: true, isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    return success(res, { job, categoryBanners, globalBanners });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch job', 500);
  }
});

// ─── POST / — create job ──────────────────────────────────────────────────────

router.post('/', verifyToken, requireRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!employer) return error(res, 'Employer profile not found', 404);

    // Check free post limit
    if (employer.freePostsUsed >= employer.freePostsLimit) {
      // Could check for subscription here; for now return error
      return error(res, 'Free job post limit reached. Please upgrade your plan.', 403);
    }

    const {
      title,
      categoryId,
      countryId,
      cityId,
      description,
      responsibilities,
      requirements,
      importantNote,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryHidden,
      experienceMin,
      experienceMax,
      educationLevel,
      jobType,
      applyMethod,
      applyEmail,
      applyUrl,
      applyWhatsapp,
      isWalkIn,
      walkInDate,
      walkInVenue,
      expiresAt,
    } = req.body;

    if (!title) return error(res, 'Title is required', 400);
    if (!description) return error(res, 'Description is required', 400);

    const slug = await uniqueSlug(title);

    const metaTitle = title;
    const metaDescription = description ? description.substring(0, 160) : null;

    const job = await prisma.$transaction(async (tx) => {
      const newJob = await tx.job.create({
        data: {
          title,
          slug,
          employerId: employer.id,
          categoryId: categoryId || null,
          countryId: countryId || null,
          cityId: cityId || null,
          description,
          responsibilities: responsibilities || null,
          requirements: requirements || null,
          importantNote: importantNote || null,
          salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
          salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
          salaryCurrency: salaryCurrency || 'AED',
          salaryHidden: salaryHidden || false,
          experienceMin: experienceMin ? parseInt(experienceMin, 10) : null,
          experienceMax: experienceMax ? parseInt(experienceMax, 10) : null,
          educationLevel: educationLevel || null,
          jobType: jobType || null,
          applyMethod: applyMethod || 'EMAIL',
          applyEmail: applyEmail || null,
          applyUrl: applyUrl || null,
          applyWhatsapp: applyWhatsapp || null,
          isWalkIn: isWalkIn || false,
          walkInDate: walkInDate ? new Date(walkInDate) : null,
          walkInVenue: walkInVenue || null,
          status: 'PENDING',
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          metaTitle,
          metaDescription,
        },
      });

      await tx.employerProfile.update({
        where: { id: employer.id },
        data: { freePostsUsed: { increment: 1 } },
      });

      return newJob;
    });

    return success(res, job, 'Job created and pending review', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to create job', 500);
  }
});

// ─── PUT /:id — update own job ────────────────────────────────────────────────

router.put('/:id', verifyToken, requireRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return error(res, 'Employer profile not found', 404);

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);
    if (job.employerId !== employer.id) return error(res, 'Forbidden', 403);

    const allowedFields = [
      'title', 'categoryId', 'countryId', 'cityId', 'description',
      'responsibilities', 'requirements', 'importantNote', 'salaryMin', 'salaryMax',
      'salaryCurrency', 'salaryHidden', 'experienceMin', 'experienceMax',
      'educationLevel', 'jobType', 'applyMethod', 'applyEmail', 'applyUrl',
      'applyWhatsapp', 'isWalkIn', 'walkInDate', 'walkInVenue', 'expiresAt',
    ];

    const updateData = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (updateData.title) {
      updateData.slug = await uniqueSlug(updateData.title, job.id);
      updateData.metaTitle = updateData.title;
    }
    if (updateData.description) {
      updateData.metaDescription = updateData.description.substring(0, 160);
    }

    const updated = await prisma.job.update({ where: { id: job.id }, data: updateData });
    return success(res, updated, 'Job updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update job', 500);
  }
});

// ─── DELETE /:id — delete own job ─────────────────────────────────────────────

router.delete('/:id', verifyToken, requireRole('EMPLOYER'), async (req, res) => {
  try {
    const employer = await prisma.employerProfile.findUnique({
      where: { userId: req.user.id },
    });
    if (!employer) return error(res, 'Employer profile not found', 404);

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) return error(res, 'Job not found', 404);
    if (job.employerId !== employer.id) return error(res, 'Forbidden', 403);

    await prisma.job.delete({ where: { id: job.id } });
    return success(res, null, 'Job deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete job', 500);
  }
});

module.exports = router;
