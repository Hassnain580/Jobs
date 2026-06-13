'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── GET / — list countries with cities ──────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const countries = await prisma.country.findMany({
      where,
      include: {
        cities: { orderBy: { name: 'asc' } },
        _count: { select: { jobs: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return success(res, countries);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch countries', 500);
  }
});

// ─── POST / — add country ─────────────────────────────────────────────────────

router.post('/', ...adminGuard, async (req, res) => {
  try {
    const { name, code, sortOrder } = req.body;

    if (!name) return error(res, 'Country name is required', 400);
    if (!code) return error(res, 'Country code is required', 400);

    const existing = await prisma.country.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return error(res, 'Country code already exists', 409);

    const country = await prisma.country.create({
      data: {
        name,
        code: code.toUpperCase(),
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
    });

    return success(res, country, 'Country added', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to add country', 500);
  }
});

// ─── PUT /:id — update country ────────────────────────────────────────────────

router.put('/:id', ...adminGuard, async (req, res) => {
  try {
    const country = await prisma.country.findUnique({ where: { id: req.params.id } });
    if (!country) return error(res, 'Country not found', 404);

    const { name, code, isActive, sortOrder } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);

    const updated = await prisma.country.update({
      where: { id: req.params.id },
      data: updateData,
      include: { cities: { orderBy: { name: 'asc' } } },
    });

    return success(res, updated, 'Country updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update country', 500);
  }
});

// ─── DELETE /:id — delete country ────────────────────────────────────────────

router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const country = await prisma.country.findUnique({ where: { id: req.params.id } });
    if (!country) return error(res, 'Country not found', 404);

    const jobCount = await prisma.job.count({ where: { countryId: req.params.id } });
    if (jobCount > 0) {
      return error(res, `Cannot delete country with ${jobCount} associated job(s)`, 400);
    }

    await prisma.country.delete({ where: { id: req.params.id } });
    return success(res, null, 'Country deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete country', 500);
  }
});

// ─── POST /:id/cities — add city to country ───────────────────────────────────

router.post('/:id/cities', ...adminGuard, async (req, res) => {
  try {
    const country = await prisma.country.findUnique({ where: { id: req.params.id } });
    if (!country) return error(res, 'Country not found', 404);

    const { name } = req.body;
    if (!name) return error(res, 'City name is required', 400);

    const city = await prisma.city.create({
      data: { name, countryId: req.params.id },
    });

    return success(res, city, 'City added', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to add city', 500);
  }
});

// ─── PUT /cities/:cityId — update city ───────────────────────────────────────

router.put('/cities/:cityId', ...adminGuard, async (req, res) => {
  try {
    const city = await prisma.city.findUnique({ where: { id: req.params.cityId } });
    if (!city) return error(res, 'City not found', 404);

    const { name, isActive } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.city.update({
      where: { id: req.params.cityId },
      data: updateData,
    });

    return success(res, updated, 'City updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update city', 500);
  }
});

// ─── DELETE /cities/:cityId — delete city ────────────────────────────────────

router.delete('/cities/:cityId', ...adminGuard, async (req, res) => {
  try {
    const city = await prisma.city.findUnique({ where: { id: req.params.cityId } });
    if (!city) return error(res, 'City not found', 404);

    const jobCount = await prisma.job.count({ where: { cityId: req.params.cityId } });
    if (jobCount > 0) {
      return error(res, `Cannot delete city with ${jobCount} associated job(s)`, 400);
    }

    await prisma.city.delete({ where: { id: req.params.cityId } });
    return success(res, null, 'City deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete city', 500);
  }
});

module.exports = router;
