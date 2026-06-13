'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { slugify, slugifyWithSuffix } = require('../../lib/slugify');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── Slug uniqueness helper ───────────────────────────────────────────────────

const uniqueSlug = async (name, existingId = null) => {
  const base = slugify(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === existingId) break;
    slug = slugifyWithSuffix(base, counter++);
  }
  return slug;
};

// ─── GET / — list categories ──────────────────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const categories = await prisma.category.findMany({
      where,
      include: { _count: { select: { jobs: true } } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return success(res, categories);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch categories', 500);
  }
});

// ─── POST / — create category ─────────────────────────────────────────────────

router.post('/', ...adminGuard, async (req, res) => {
  try {
    const {
      name, description, icon, sortOrder,
      adsEnabled, adType, applyMethod, noteRequired, noteCharLimit,
    } = req.body;

    if (!name) return error(res, 'Category name is required', 400);

    const slug = await uniqueSlug(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        adsEnabled: adsEnabled ?? true,
        adType: adType || null,
        applyMethod: applyMethod || null,
        noteRequired: noteRequired ?? false,
        noteCharLimit: noteCharLimit ? parseInt(noteCharLimit, 10) : 500,
      },
    });

    return success(res, category, 'Category created', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to create category', 500);
  }
});

// ─── PUT /:id — update category ───────────────────────────────────────────────

router.put('/:id', ...adminGuard, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return error(res, 'Category not found', 404);

    const {
      name, description, icon, sortOrder, isActive,
      adsEnabled, adType, applyMethod, noteRequired, noteCharLimit,
    } = req.body;

    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = await uniqueSlug(name, category.id);
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (adsEnabled !== undefined) updateData.adsEnabled = Boolean(adsEnabled);
    if (adType !== undefined) updateData.adType = adType || null;
    if (applyMethod !== undefined) updateData.applyMethod = applyMethod || null;
    if (noteRequired !== undefined) updateData.noteRequired = Boolean(noteRequired);
    if (noteCharLimit !== undefined) updateData.noteCharLimit = parseInt(noteCharLimit, 10);

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return success(res, updated, 'Category updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update category', 500);
  }
});

// ─── DELETE /:id — delete category ───────────────────────────────────────────

router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return error(res, 'Category not found', 404);

    const jobCount = await prisma.job.count({ where: { categoryId: req.params.id } });
    if (jobCount > 0) {
      return error(res, `Cannot delete category with ${jobCount} associated job(s)`, 400);
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    return success(res, null, 'Category deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete category', 500);
  }
});

// ─── PUT /:id/toggle — enable / disable category ─────────────────────────────

router.put('/:id/toggle', ...adminGuard, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) return error(res, 'Category not found', 404);

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: { isActive: !category.isActive },
    });

    return success(res, updated, updated.isActive ? 'Category enabled' : 'Category disabled');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to toggle category', 500);
  }
});

module.exports = router;
