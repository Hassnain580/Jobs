'use strict';

const express = require('express');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];

// ─── GET / — list all CMS content keys ───────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const { page: pageStr, isPublished } = req.query;
    const where = {};
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    const contents = await prisma.cmsContent.findMany({
      where,
      select: {
        id: true,
        key: true,
        title: true,
        page: true,
        type: true,
        isPublished: true,
        version: true,
        updatedAt: true,
        updatedBy: true,
      },
      orderBy: [{ page: 'asc' }, { key: 'asc' }],
    });

    return success(res, contents);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch CMS content list', 500);
  }
});

// ─── GET /:key — get content by key ──────────────────────────────────────────

router.get('/:key', ...adminGuard, async (req, res) => {
  try {
    const content = await prisma.cmsContent.findUnique({
      where: { key: req.params.key },
    });

    if (!content) return error(res, 'Content not found', 404);
    return success(res, content);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch content', 500);
  }
});

// ─── PUT /:key — update content (saves previous version to history) ───────────

router.put('/:key', ...adminGuard, async (req, res) => {
  try {
    const { content, title, page, type, isPublished } = req.body;

    const existing = await prisma.cmsContent.findUnique({ where: { key: req.params.key } });

    if (existing) {
      // Save previous version to history before updating
      await prisma.cmsHistory.create({
        data: {
          contentId: existing.id,
          prevContent: existing.content,
          version: existing.version,
          updatedBy: existing.updatedBy,
        },
      });

      const updateData = { updatedBy: req.user.id, version: { increment: 1 } };
      if (content !== undefined) updateData.content = content;
      if (title !== undefined) updateData.title = title;
      if (page !== undefined) updateData.page = page;
      if (type !== undefined) updateData.type = type;
      if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);

      const updated = await prisma.cmsContent.update({
        where: { key: req.params.key },
        data: updateData,
      });

      return success(res, updated, 'Content updated');
    }

    // Create new content if key doesn't exist
    if (!content) return error(res, 'Content is required', 400);

    const created = await prisma.cmsContent.create({
      data: {
        key: req.params.key,
        content,
        title: title || null,
        page: page || null,
        type: type || 'text',
        isPublished: isPublished ?? true,
        updatedBy: req.user.id,
      },
    });

    return success(res, created, 'Content created', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update content', 500);
  }
});

// ─── GET /:key/history — get version history ──────────────────────────────────

router.get('/:key/history', ...adminGuard, async (req, res) => {
  try {
    const content = await prisma.cmsContent.findUnique({
      where: { key: req.params.key },
      select: { id: true },
    });

    if (!content) return error(res, 'Content not found', 404);

    const history = await prisma.cmsHistory.findMany({
      where: { contentId: content.id },
      orderBy: { version: 'desc' },
    });

    return success(res, history);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch content history', 500);
  }
});

module.exports = router;
