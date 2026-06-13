'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── GET /overview — totals dashboard ────────────────────────────────────────

router.get('/overview', ...adminGuard, async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications,
      totalRevenue,
      pendingUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'JOB_SEEKER' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.application.count(),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
      prisma.user.count({ where: { approvalStatus: 'PENDING' } }),
    ]);

    return success(res, {
      users: { total: totalUsers, jobSeekers: totalJobSeekers, employers: totalEmployers, pendingApproval: pendingUsers },
      jobs: { total: totalJobs, active: activeJobs, pending: pendingJobs },
      applications: { total: totalApplications },
      revenue: { total: totalRevenue._sum.amount || 0, currency: 'USD' },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch overview analytics', 500);
  }
});

// ─── GET /jobs — jobs breakdown by category, country, status ─────────────────

router.get('/jobs', ...adminGuard, async (req, res) => {
  try {
    const [byStatus, byCategory, byCountry] = await Promise.all([
      // Jobs by status
      prisma.job.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Jobs by category (top 10)
      prisma.job.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),

      // Jobs by country (top 10)
      prisma.job.groupBy({
        by: ['countryId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    // Resolve category and country names
    const categoryIds = byCategory.map((r) => r.categoryId).filter(Boolean);
    const countryIds = byCountry.map((r) => r.countryId).filter(Boolean);

    const [categories, countries] = await Promise.all([
      categoryIds.length
        ? prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true } })
        : [],
      countryIds.length
        ? prisma.country.findMany({ where: { id: { in: countryIds } }, select: { id: true, name: true } })
        : [],
    ]);

    const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
    const countryMap = Object.fromEntries(countries.map((c) => [c.id, c.name]));

    return success(res, {
      byStatus: byStatus.map((r) => ({ status: r.status, count: r._count.id })),
      byCategory: byCategory.map((r) => ({
        categoryId: r.categoryId,
        categoryName: categoryMap[r.categoryId] || 'Uncategorized',
        count: r._count.id,
      })),
      byCountry: byCountry.map((r) => ({
        countryId: r.countryId,
        countryName: countryMap[r.countryId] || 'Unknown',
        count: r._count.id,
      })),
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch jobs analytics', 500);
  }
});

// ─── GET /users — user registrations over time ────────────────────────────────

router.get('/users', ...adminGuard, async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = Math.min(365, Math.max(7, parseInt(days, 10)));
    const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    // Get registration counts grouped by role
    const [seekers, employers, admins] = await Promise.all([
      prisma.user.count({ where: { role: 'JOB_SEEKER', createdAt: { gte: since } } }),
      prisma.user.count({ where: { role: 'EMPLOYER', createdAt: { gte: since } } }),
      prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_USER'] }, createdAt: { gte: since } } }),
    ]);

    // Daily registrations for the period
    const users = await prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, role: true },
      orderBy: { createdAt: 'asc' },
    });

    // Aggregate by date
    const daily = {};
    for (const u of users) {
      const date = u.createdAt.toISOString().split('T')[0];
      if (!daily[date]) daily[date] = { date, total: 0, seekers: 0, employers: 0 };
      daily[date].total += 1;
      if (u.role === 'JOB_SEEKER') daily[date].seekers += 1;
      if (u.role === 'EMPLOYER') daily[date].employers += 1;
    }

    return success(res, {
      period: { days: daysNum, since },
      totals: { seekers, employers, admins, total: seekers + employers + admins },
      daily: Object.values(daily),
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch user analytics', 500);
  }
});

// ─── GET /revenue — transactions summary ─────────────────────────────────────

router.get('/revenue', ...adminGuard, async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysNum = Math.min(365, Math.max(7, parseInt(days, 10)));
    const since = new Date(Date.now() - daysNum * 24 * 60 * 60 * 1000);

    const [total, byStatus, byType, recent] = await Promise.all([
      prisma.transaction.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { createdAt: { gte: since } },
      }),

      prisma.transaction.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
        where: { createdAt: { gte: since } },
      }),

      prisma.transaction.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { id: true },
        where: { createdAt: { gte: since } },
      }),

      prisma.transaction.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return success(res, {
      period: { days: daysNum, since },
      summary: {
        total: total._sum.amount || 0,
        count: total._count.id,
        currency: 'USD',
      },
      byStatus: byStatus.map((r) => ({ status: r.status, amount: r._sum.amount || 0, count: r._count.id })),
      byType: byType.map((r) => ({ type: r.type, amount: r._sum.amount || 0, count: r._count.id })),
      recent,
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch revenue analytics', 500);
  }
});

module.exports = router;
