'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── GET / — list all users ───────────────────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const { role, approvalStatus, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (role) where.role = role;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { jobSeekerProfile: { firstName: { contains: search, mode: 'insensitive' } } },
        { jobSeekerProfile: { lastName: { contains: search, mode: 'insensitive' } } },
        { employerProfile: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          phone: true,
          role: true,
          approvalStatus: true,
          isActive: true,
          isBanned: true,
          emailVerified: true,
          phoneVerified: true,
          registeredVia: true,
          lastLogin: true,
          createdAt: true,
          jobSeekerProfile: {
            select: { firstName: true, lastName: true, photoUrl: true, nationality: true },
          },
          employerProfile: {
            select: { companyName: true, logoUrl: true, industry: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, {
      users,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch users', 500);
  }
});

// ─── GET /export — export users as CSV ───────────────────────────────────────

router.get('/export', ...adminGuard, async (req, res) => {
  try {
    const { role, approvalStatus } = req.query;
    const where = {};
    if (role) where.role = role;
    if (approvalStatus) where.approvalStatus = approvalStatus;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        approvalStatus: true,
        isBanned: true,
        registeredVia: true,
        lastLogin: true,
        createdAt: true,
        jobSeekerProfile: {
          select: {
            firstName: true,
            lastName: true,
            nationality: true,
            currentCountry: true,
            currentCity: true,
            currentJobTitle: true,
            totalExperience: true,
            educationLevel: true,
            expectedSalaryMin: true,
            expectedSalaryMax: true,
            salaryCurrency: true,
            skills: true,
          },
        },
        employerProfile: {
          select: { companyName: true, industry: true, companySize: true, website: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const headers = [
      'id', 'email', 'phone', 'role', 'approvalStatus', 'isBanned',
      'registeredVia', 'lastLogin', 'createdAt',
      'firstName', 'lastName', 'nationality', 'currentCountry', 'currentCity',
      'currentJobTitle', 'totalExperience', 'educationLevel',
      'expectedSalaryMin', 'expectedSalaryMax', 'salaryCurrency', 'skills',
      'companyName', 'industry', 'companySize', 'website',
    ];

    const rows = users.map((u) => {
      const sp = u.jobSeekerProfile || {};
      const ep = u.employerProfile || {};
      return [
        u.id, u.email || '', u.phone || '', u.role, u.approvalStatus, u.isBanned,
        u.registeredVia || '', u.lastLogin || '', u.createdAt,
        sp.firstName || '', sp.lastName || '', sp.nationality || '',
        sp.currentCountry || '', sp.currentCity || '', sp.currentJobTitle || '',
        sp.totalExperience ?? '', sp.educationLevel || '',
        sp.expectedSalaryMin ?? '', sp.expectedSalaryMax ?? '', sp.salaryCurrency || '',
        (sp.skills || []).join(';'),
        ep.companyName || '', ep.industry || '', ep.companySize || '', ep.website || '',
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users-export.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to export users', 500);
  }
});

// ─── GET /:id — get user detail ───────────────────────────────────────────────

router.get('/:id', ...adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        jobSeekerProfile: true,
        employerProfile: { select: { id: true, companyName: true, logoUrl: true, industry: true, companySize: true, website: true, linkedin: true, freePostsUsed: true, freePostsLimit: true, countryId: true, cityId: true, createdAt: true } },
        adminProfile: true,
      },
    });

    if (!user) return error(res, 'User not found', 404);

    const { passwordHash, ...safeUser } = user;
    return success(res, safeUser);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch user', 500);
  }
});

// ─── PUT /:id/approve — approve user ─────────────────────────────────────────

router.put('/:id/approve', ...adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { approvalStatus: 'APPROVED', isActive: true },
    });

    const { passwordHash, ...safeUser } = updated;
    return success(res, safeUser, 'User approved');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to approve user', 500);
  }
});

// ─── PUT /:id/reject — reject user ───────────────────────────────────────────

router.put('/:id/reject', ...adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { approvalStatus: 'REJECTED', isActive: false },
    });

    const { passwordHash, ...safeUser } = updated;
    return success(res, safeUser, 'User rejected');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to reject user', 500);
  }
});

// ─── PUT /:id/ban — ban / unban user ─────────────────────────────────────────

router.put('/:id/ban', ...adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBanned: !user.isBanned },
    });

    const { passwordHash, ...safeUser } = updated;
    return success(res, safeUser, updated.isBanned ? 'User banned' : 'User unbanned');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to toggle ban', 500);
  }
});

// ─── DELETE /:id — delete user ────────────────────────────────────────────────

router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);

    await prisma.user.delete({ where: { id: req.params.id } });
    return success(res, null, 'User deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete user', 500);
  }
});

module.exports = router;
