'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../lib/prisma');
const { success, error } = require('../lib/response');
const { generateOtp, sendSmsOtp, sendEmailOtp } = require('../lib/otp');
const { getSetting } = require('../lib/settings');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ─── Token helpers ────────────────────────────────────────────────────────────

const signAccess = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });

const signRefresh = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

const issueTokens = (user) => ({
  accessToken: signAccess(user),
  refreshToken: signRefresh(user),
});

// ─── POST /register ───────────────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName } = req.body;

    if (!password) return error(res, 'Password is required', 400);
    if (!email && !phone) return error(res, 'Email or phone is required', 400);

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error(res, 'Email already registered', 409);
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return error(res, 'Phone already registered', 409);
    }

    const autoApprove = await getSetting('seeker_auto_approve');
    const approvalStatus = autoApprove === 'true' ? 'APPROVED' : 'PENDING';

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: 'JOB_SEEKER',
        approvalStatus,
        registeredVia: 'email',
        jobSeekerProfile: {
          create: {
            firstName: firstName || null,
            lastName: lastName || null,
          },
        },
      },
      include: { jobSeekerProfile: true },
    });

    const tokens = issueTokens(user);
    return success(res, { user: { id: user.id, email: user.email, role: user.role }, ...tokens }, 'Registered successfully', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Registration failed', 500);
  }
});

// ─── POST /register/employer ──────────────────────────────────────────────────

router.post('/register/employer', async (req, res) => {
  try {
    const { email, phone, password, companyName, firstName, lastName } = req.body;

    if (!email && !phone) return error(res, 'Email or phone is required', 400);
    if (!password) return error(res, 'Password is required', 400);

    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return error(res, 'Email already registered', 409);
    }
    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return error(res, 'Phone already registered', 409);
    }

    const autoApprove = await getSetting('employer_auto_approve');
    const approvalStatus = autoApprove === 'true' ? 'APPROVED' : 'PENDING';

    const passwordHash = await bcrypt.hash(password, 12);

    const freePostsLimit = parseInt(await getSetting('employer_free_posts_limit') || '3', 10);

    const user = await prisma.user.create({
      data: {
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: 'EMPLOYER',
        approvalStatus,
        registeredVia: 'email',
        employerProfile: {
          create: {
            companyName: companyName || null,
            freePostsLimit,
          },
        },
      },
      include: { employerProfile: true },
    });

    const tokens = issueTokens(user);
    return success(res, { user: { id: user.id, email: user.email, role: user.role }, ...tokens }, 'Employer registered successfully', 201);
  } catch (err) {
    console.error(err);
    return error(res, 'Registration failed', 500);
  }
});

// ─── POST /login ──────────────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password) return error(res, 'Password is required', 400);
    if (!email && !phone) return error(res, 'Email or phone is required', 400);

    const user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user || !user.passwordHash) return error(res, 'Invalid credentials', 401);
    if (user.isBanned) return error(res, 'Account is banned', 403);
    if (!user.isActive) return error(res, 'Account is inactive', 403);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return error(res, 'Invalid credentials', 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const tokens = issueTokens(user);
    return success(res, { user: { id: user.id, email: user.email, phone: user.phone, role: user.role }, ...tokens }, 'Login successful');
  } catch (err) {
    console.error(err);
    return error(res, 'Login failed', 500);
  }
});

// ─── POST /login/otp/send ─────────────────────────────────────────────────────

router.post('/login/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return error(res, 'Phone number is required', 400);

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const user = await prisma.user.findUnique({ where: { phone } });

    await prisma.otpCode.create({
      data: {
        userId: user ? user.id : null,
        phone,
        code,
        expiresAt,
      },
    });

    await sendSmsOtp(phone, code);

    return success(res, null, 'OTP sent successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to send OTP', 500);
  }
});

// ─── POST /login/otp/verify ───────────────────────────────────────────────────

router.post('/login/otp/verify', async (req, res) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code) return error(res, 'Phone and code are required', 400);

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) return error(res, 'Invalid or expired OTP', 400);

    await prisma.otpCode.update({ where: { id: otpRecord.id }, data: { used: true } });

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      const autoApprove = await getSetting('seeker_auto_approve');
      const approvalStatus = autoApprove === 'true' ? 'APPROVED' : 'PENDING';

      user = await prisma.user.create({
        data: {
          phone,
          role: 'JOB_SEEKER',
          approvalStatus,
          phoneVerified: true,
          registeredVia: 'otp',
          jobSeekerProfile: { create: {} },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true, lastLogin: new Date() },
      });
    }

    if (user.isBanned) return error(res, 'Account is banned', 403);

    const tokens = issueTokens(user);
    return success(res, { user: { id: user.id, phone: user.phone, role: user.role }, ...tokens }, 'OTP verified');
  } catch (err) {
    console.error(err);
    return error(res, 'OTP verification failed', 500);
  }
});

// ─── POST /refresh ────────────────────────────────────────────────────────────

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required', 400);

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch {
      return error(res, 'Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return error(res, 'User not found', 401);
    if (user.isBanned || !user.isActive) return error(res, 'Account unavailable', 403);

    return success(res, { accessToken: signAccess(user) }, 'Token refreshed');
  } catch (err) {
    console.error(err);
    return error(res, 'Token refresh failed', 500);
  }
});

// ─── POST /logout ─────────────────────────────────────────────────────────────

router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Stateless JWT — client discards tokens. Placeholder for blocklist if needed.
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    console.error(err);
    return error(res, 'Logout failed', 500);
  }
});

// ─── GET /me ──────────────────────────────────────────────────────────────────

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        jobSeekerProfile: true,
        employerProfile: true,
        adminProfile: true,
      },
    });

    if (!user) return error(res, 'User not found', 404);

    const { passwordHash, ...safeUser } = user;
    return success(res, safeUser, 'User fetched');
  } catch (err) {
    console.error(err);
    return error(res, 'Failed to fetch user', 500);
  }
});

// ─── POST /google ─────────────────────────────────────────────────────────────

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return error(res, 'Google ID token required', 400);

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const client = new OAuth2Client(clientId);

    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: clientId });
      payload = ticket.getPayload();
    } catch {
      return error(res, 'Invalid Google token', 401);
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, ...(email ? [{ email }] : [])] },
    });

    if (!user) {
      const autoApprove = await getSetting('seeker_auto_approve');
      const approvalStatus = autoApprove === 'true' ? 'APPROVED' : 'PENDING';

      user = await prisma.user.create({
        data: {
          email: email || null,
          googleId,
          role: 'JOB_SEEKER',
          approvalStatus,
          emailVerified: true,
          registeredVia: 'google',
          jobSeekerProfile: {
            create: { firstName: firstName || null, lastName: lastName || null },
          },
        },
      });
    } else {
      if (!user.googleId) {
        await prisma.user.update({ where: { id: user.id }, data: { googleId } });
      }
      await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
    }

    if (user.isBanned) return error(res, 'Account is banned', 403);

    const tokens = issueTokens(user);
    return success(res, { user: { id: user.id, email: user.email, role: user.role }, ...tokens }, 'Google login successful');
  } catch (err) {
    console.error(err);
    return error(res, 'Google login failed', 500);
  }
});

module.exports = router;
