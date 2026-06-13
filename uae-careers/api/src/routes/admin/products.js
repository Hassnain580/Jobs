'use strict';

const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { compressImage } = require('../../lib/compress');
const { uploadFile, deleteFile } = require('../../lib/storage');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const adminGuard = [verifyToken, requireRole('ADMIN', 'SUPER_USER')];
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

// ─── GET / — list products (banners) ─────────────────────────────────────────

router.get('/', ...adminGuard, async (req, res) => {
  try {
    const { isActive, isGlobal } = req.query;
    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isGlobal !== undefined) where.isGlobal = isGlobal === 'true';

    const products = await prisma.product.findMany({
      where,
      include: {
        categoryBanners: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return success(res, products);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch products', 500);
  }
});

// ─── POST / — create product with image upload ────────────────────────────────

router.post('/', ...adminGuard, upload.single('image'), async (req, res) => {
  try {
    const { name, description, linkUrl, isActive, isGlobal, sortOrder } = req.body;

    if (!name) return error(res, 'Product name is required', 400);
    if (!linkUrl) return error(res, 'Link URL is required', 400);

    let imageUrl = null;
    let imageKey = null;

    if (req.file) {
      const compressed = await compressImage(req.file.buffer, { preset: 'banner' });
      const key = `products/${uuidv4()}.webp`;
      await uploadFile(key, compressed, 'image/webp');
      imageUrl = `${process.env.B2_PUBLIC_URL}/${key}`;
      imageKey = key;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        imageUrl,
        imageKey,
        linkUrl,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        isGlobal: isGlobal !== undefined ? Boolean(isGlobal) : false,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
    });

    return success(res, product, 'Product created', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to create product', 500);
  }
});

// ─── PUT /:id — update product ────────────────────────────────────────────────

router.put('/:id', ...adminGuard, upload.single('image'), async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return error(res, 'Product not found', 404);

    const { name, description, linkUrl, isActive, isGlobal, sortOrder } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (isGlobal !== undefined) updateData.isGlobal = Boolean(isGlobal);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder, 10);

    if (req.file) {
      if (product.imageKey) {
        await deleteFile(product.imageKey).catch(() => {});
      }
      const compressed = await compressImage(req.file.buffer, { preset: 'banner' });
      const key = `products/${uuidv4()}.webp`;
      await uploadFile(key, compressed, 'image/webp');
      updateData.imageUrl = `${process.env.B2_PUBLIC_URL}/${key}`;
      updateData.imageKey = key;
    }

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    return success(res, updated, 'Product updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update product', 500);
  }
});

// ─── DELETE /:id — delete product ────────────────────────────────────────────

router.delete('/:id', ...adminGuard, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return error(res, 'Product not found', 404);

    if (product.imageKey) {
      await deleteFile(product.imageKey).catch(() => {});
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    return success(res, null, 'Product deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete product', 500);
  }
});

// ─── POST /:id/assign — assign product to category or set as global ───────────

router.post('/:id/assign', ...adminGuard, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return error(res, 'Product not found', 404);

    const { categoryId, isGlobal, sortOrder } = req.body;

    if (isGlobal) {
      const updated = await prisma.product.update({
        where: { id: req.params.id },
        data: { isGlobal: true },
      });
      return success(res, updated, 'Product set as global banner');
    }

    if (!categoryId) return error(res, 'categoryId or isGlobal is required', 400);

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return error(res, 'Category not found', 404);

    const existing = await prisma.productBanner.findFirst({
      where: { productId: req.params.id, categoryId },
    });
    if (existing) return error(res, 'Product already assigned to this category', 409);

    const banner = await prisma.productBanner.create({
      data: {
        productId: req.params.id,
        categoryId,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    return success(res, banner, 'Product assigned to category', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to assign product', 500);
  }
});

// ─── DELETE /:id/assign/:categoryId — remove category assignment ──────────────

router.delete('/:id/assign/:categoryId', ...adminGuard, async (req, res) => {
  try {
    const banner = await prisma.productBanner.findFirst({
      where: { productId: req.params.id, categoryId: req.params.categoryId },
    });

    if (!banner) return error(res, 'Assignment not found', 404);

    await prisma.productBanner.delete({ where: { id: banner.id } });
    return success(res, null, 'Category assignment removed');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to remove assignment', 500);
  }
});

module.exports = router;
