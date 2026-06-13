'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../../lib/prisma');
const { success, error } = require('../../lib/response');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
const superUserGuard = [verifyToken, requireRole('SUPER_USER')];

// ─── GET / — list admin users ─────────────────────────────────────────────────

router.get('/', ...superUserGuard, async (req, res) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { role: { in: ['ADMIN', 'SUPER_USER'] } };

    const [admins, total] = await Promise.all([
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
          lastLogin: true,
          createdAt: true,
          adminProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              permissions: true,
              createdBy: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return success(res, {
      admins,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch admins', 500);
  }
});

// ─── POST / — create admin with permissions object ────────────────────────────

router.post('/', ...superUserGuard, async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, permissions, role } = req.body;

    if (!email && !phone) return error(res, 'Email or phone is required', 400);
    if (!password) return error(res, 'Password is required', 400);

    const allowedRoles = ['ADMIN', 'SUPER_USER'];
    const adminRole = allowedRoles.includes(role) ? role : 'ADMIN';

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error(res, 'Email already registered', 409);
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return error(res, 'Phone already registered', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: adminRole,
        approvalStatus: 'APPROVED',
        isActive: true,
        registeredVia: 'admin',
        adminProfile: {
          create: {
            firstName: firstName || null,
            lastName: lastName || null,
            permissions: permissions || {},
            createdBy: req.user.id,
          },
        },
      },
      include: { adminProfile: true },
    });

    const { passwordHash: _pw, ...safeUser } = user;
    return success(res, safeUser, 'Admin created', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to create admin', 500);
  }
});

// ─── PUT /:id/permissions — update admin permissions ─────────────────────────

router.put('/:id/permissions', ...superUserGuard, async (req, res) => {
  try {
    const { permissions } = req.body;

    if (permissions === undefined || typeof permissions !== 'object') {
      return error(res, 'permissions must be an object', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);
    if (!['ADMIN', 'SUPER_USER'].includes(user.role)) {
      return error(res, 'User is not an admin', 400);
    }

    const adminProfile = await prisma.adminProfile.findUnique({ where: { userId: req.params.id } });
    if (!adminProfile) return error(res, 'Admin profile not found', 404);

    const updated = await prisma.adminProfile.update({
      where: { userId: req.params.id },
      data: { permissions },
    });

    return success(res, updated, 'Permissions updated');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to update permissions', 500);
  }
});

// ─── DELETE /:id — delete admin ───────────────────────────────────────────────

router.delete('/:id', ...superUserGuard, async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user.id) {
      return error(res, 'Cannot delete your own account', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'User not found', 404);
    if (!['ADMIN', 'SUPER_USER'].includes(user.role)) {
      return error(res, 'User is not an admin', 400);
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    return success(res, null, 'Admin deleted');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to delete admin', 500);
  }
});

module.exports = router;
