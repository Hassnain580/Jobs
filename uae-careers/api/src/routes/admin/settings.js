'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { setSetting } = require('../../lib/settings');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── GET / — get all platform settings grouped ────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const settings = await prisma.platformSetting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    // Group by the group field
    const grouped = settings.reduce((acc, s) => {
      const groupKey = s.group || 'general';
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(s);
      return acc;
    }, {});

    return success(res, grouped);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch settings', 500);
  }
});

// ─── PUT / — update one or multiple settings ──────────────────────────────────

router.put('/', ...adminGuard, async (req, res) => {
  try {
    const updates = req.body; // { key: value } or { settings: [{key, value, type, group, label}] }

    if (Array.isArray(updates.settings)) {
      // Batch update with full metadata
      await Promise.all(
        updates.settings.map((s) =>
          prisma.platformSetting.upsert({
            where: { key: s.key },
            update: {
              value: String(s.value),
              type: s.type || 'string',
              group: s.group || null,
              label: s.label || null,
              updatedBy: req.user.id,
            },
            create: {
              key: s.key,
              value: String(s.value),
              type: s.type || 'string',
              group: s.group || null,
              label: s.label || null,
              updatedBy: req.user.id,
            },
          })
        )
      );
    } else {
      // Simple key-value map update
      const entries = Object.entries(updates).filter(([k]) => k !== 'settings');
      await Promise.all(
        entries.map(([key, value]) =>
          prisma.platformSetting.upsert({
            where: { key },
            update: { value: String(value), updatedBy: req.user.id },
            create: { key, value: String(value), updatedBy: req.user.id },
          })
        )
      );
    }

    return success(res, null, 'Settings updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update settings', 500);
  }
});

// ─── GET /apply-methods — get apply method settings per category ──────────────

router.get('/apply-methods', ...adminGuard, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        applyMethod: true,
        noteRequired: true,
        noteCharLimit: true,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    // Also get the global default apply method setting
    const globalDefault = await prisma.platformSetting.findUnique({
      where: { key: 'default_apply_method' },
    });

    return success(res, {
      globalDefault: globalDefault?.value || 'EMAIL',
      categories,
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch apply method settings', 500);
  }
});

// ─── PUT /apply-methods — update apply method settings ───────────────────────

router.put('/apply-methods', ...adminGuard, async (req, res) => {
  try {
    const { globalDefault, categories } = req.body;

    const ops = [];

    if (globalDefault) {
      ops.push(
        prisma.platformSetting.upsert({
          where: { key: 'default_apply_method' },
          update: { value: globalDefault, updatedBy: req.user.id },
          create: { key: 'default_apply_method', value: globalDefault, group: 'jobs', updatedBy: req.user.id },
        })
      );
    }

    if (Array.isArray(categories)) {
      for (const cat of categories) {
        if (!cat.id) continue;
        ops.push(
          prisma.category.update({
            where: { id: cat.id },
            data: {
              applyMethod: cat.applyMethod || null,
              noteRequired: cat.noteRequired ?? undefined,
              noteCharLimit: cat.noteCharLimit ? parseInt(cat.noteCharLimit, 10) : undefined,
            },
          })
        );
      }
    }

    await Promise.all(ops);
    return success(res, null, 'Apply method settings updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update apply method settings', 500);
  }
});

module.exports = router;
