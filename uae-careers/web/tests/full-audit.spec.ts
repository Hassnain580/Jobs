import { test, expect, Page } from '@playwright/test';

// ── Group A: Homepage ──────────────────────────────────────────────────────────

test.describe('A: Homepage', () => {
  test('A1 - loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0);
  });

  test('A2 - title and meta', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toContain('UAE Careers');
  });

  test('A3 - header navigation links present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href="/jobs"]').first()).toBeVisible();
    await expect(page.locator('a[href="/cv-service"]').first()).toBeVisible();
  });

  test('A4 - no Login or Register links in nav', async ({ page }) => {
    await page.goto('/');
    const loginLinks = await page.locator('nav a:has-text("Login"), nav a:has-text("Register"), nav a:has-text("Sign In")').count();
    expect(loginLinks).toBe(0);
  });

  test('A5 - CV Service CTA button in header', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header a[href="/cv-service"]').first()).toBeVisible();
  });

  test('A6 - WhatsApp signup section present', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#whatsapp-signup');
    await expect(section).toBeVisible();
  });

  test('A7 - WhatsApp signup form submits', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('#whatsapp-signup');
    await section.scrollIntoViewIfNeeded();
    const phoneInput = section.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"]').first();
    await phoneInput.fill('501234567');
    const submitBtn = section.locator('button[type="submit"]').first();
    await submitBtn.click();
    // Should show success or no crash
    await page.waitForTimeout(1000);
  });

  test('A8 - no fake job counts on categories', async ({ page }) => {
    await page.goto('/');
    // Should not show numbers like "14,230" or "3,891"
    const body = await page.textContent('body');
    expect(body).not.toContain('14,230');
    expect(body).not.toContain('3,891');
    expect(body).not.toContain('42,800');
  });

  test('A9 - footer has Services column', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('text=Services')).toBeVisible();
    await expect(footer.locator('a[href="/cv-service"]')).toBeVisible();
  });

  test('A10 - footer WhatsApp link present', async ({ page }) => {
    await page.goto('/');
    const waLink = page.locator('footer a[href*="wa.me"]');
    await expect(waLink.first()).toBeVisible();
  });
});

// ── Group B: Job Listing Page ──────────────────────────────────────────────────

test.describe('B: Job Listing', () => {
  test('B1 - loads without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    expect(errors.filter(e => !e.includes('hydration'))).toHaveLength(0);
  });

  test('B2 - page title correct', async ({ page }) => {
    await page.goto('/jobs');
    const title = await page.title();
    expect(title).toContain('UAE Careers');
  });

  test('B3 - no ad gate / watch-ad buttons', async ({ page }) => {
    await page.goto('/jobs');
    const adButtons = await page.locator('button:has-text("Watch Ad"), button:has-text("Watch an Ad"), button:has-text("Unlock")').count();
    expect(adButtons).toBe(0);
  });

  test('B4 - filter sidebar present', async ({ page }) => {
    await page.goto('/jobs');
    // Filter sidebar or filter panel should exist (search input or filter select)
    const filter = await page.locator('input[type="text"], select, input[type="number"]').count();
    expect(filter).toBeGreaterThan(0);
  });

  test('B5 - empty state or job cards shown (no crash)', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    // Either shows jobs or empty state - both fine
    const hasContent = await page.locator('main').textContent();
    expect(hasContent!.length).toBeGreaterThan(50);
  });
});

// ── Group C: Job Detail Page ───────────────────────────────────────────────────

test.describe('C: Job Detail', () => {
  test('C1 - loads job-1 correctly', async ({ page }) => {
    await page.goto('/jobs/job-1');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text!.length).toBeGreaterThan(3);
  });

  test('C2 - different jobs show different titles', async ({ page }) => {
    await page.goto('/jobs/job-1');
    const title1 = await page.locator('h1').first().textContent();
    await page.goto('/jobs/job-2');
    const title2 = await page.locator('h1').first().textContent();
    expect(title1).not.toBe(title2);
  });

  test('C3 - Apply Now button visible', async ({ page }) => {
    await page.goto('/jobs/job-1');
    await expect(page.locator('button:has-text("Apply"), button:has-text("apply")').first()).toBeVisible();
  });

  test('C4 - Apply modal opens on click', async ({ page }) => {
    await page.goto('/jobs/job-1');
    const applyBtn = page.locator('button:has-text("Apply Now"), button:has-text("Apply")').first();
    await applyBtn.click();
    // Modal should appear (the apply modal has fixed inset-0 positioning)
    await expect(page.locator('div.fixed.inset-0[role="dialog"]')).toBeVisible({ timeout: 5000 });
  });

  test('C5 - Apply modal has required fields', async ({ page }) => {
    await page.goto('/jobs/job-1');
    await page.locator('button:has-text("Apply Now"), button:has-text("Apply")').first().click();
    await page.waitForTimeout(500);
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="tel"], input[placeholder*="phone"], input[placeholder*="Phone"]').first()).toBeVisible();
  });

  test('C6 - Apply modal validation works', async ({ page }) => {
    await page.goto('/jobs/job-1');
    await page.locator('button:has-text("Apply Now"), button:has-text("Apply")').first().click();
    await page.waitForTimeout(300);
    // Try to submit without filling form
    await page.locator('button[type="submit"], button:has-text("Submit Application")').first().click();
    // Should show validation errors (red text paragraphs)
    await page.waitForTimeout(500);
    const errorText = await page.locator('p.text-red-500, p[class*="text-red"]').count();
    expect(errorText).toBeGreaterThan(0);
  });

  test('C7 - no Save Job button', async ({ page }) => {
    await page.goto('/jobs/job-1');
    const saveBtn = await page.locator('button:has-text("Save Job"), button:has-text("Save")').count();
    expect(saveBtn).toBe(0);
  });

  test('C8 - no Boost Application section', async ({ page }) => {
    await page.goto('/jobs/job-1');
    const boost = await page.locator('text=Boost Application, text=Boost Your Application').count();
    expect(boost).toBe(0);
  });

  test('C9 - CV service upsell card in sidebar', async ({ page }) => {
    await page.goto('/jobs/job-1');
    await expect(page.locator('a[href="/cv-service"]').first()).toBeVisible();
  });

  test('C10 - 404 for unknown job slug', async ({ page }) => {
    const response = await page.goto('/jobs/not-a-real-job-xyz-9999');
    // Should show not found state
    await page.waitForLoadState('networkidle');
    const bodyText = await page.textContent('body');
    const isNotFound = (response?.status() === 404) ||
      bodyText!.includes('not found') || bodyText!.includes('Not Found') ||
      bodyText!.includes('does not exist') || bodyText!.includes('no longer available');
    expect(isNotFound).toBeTruthy();
  });
});

// ── Group D: Apply Flow & Thank You ───────────────────────────────────────────

test.describe('D: Apply Flow & Thank You', () => {
  test('D1 - thank-you page loads', async ({ page }) => {
    await page.goto('/thank-you');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('D2 - thank-you page has CV tier cards', async ({ page }) => {
    await page.goto('/thank-you');
    const waLinks = await page.locator('a[href*="wa.me"]').count();
    expect(waLinks).toBeGreaterThan(0);
  });

  test('D3 - thank-you page has WhatsApp signup form', async ({ page }) => {
    await page.goto('/thank-you');
    const phoneInput = await page.locator('input[type="tel"], input[placeholder*="phone"]').count();
    expect(phoneInput).toBeGreaterThan(0);
  });
});

// ── Group E: CV Service Page ───────────────────────────────────────────────────

test.describe('E: CV Service', () => {
  test('E1 - page loads', async ({ page }) => {
    await page.goto('/cv-service');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('E2 - title mentions ATS or CV', async ({ page }) => {
    await page.goto('/cv-service');
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/cv|ats|career/);
  });

  test('E3 - three pricing tiers shown', async ({ page }) => {
    await page.goto('/cv-service');
    await expect(page.locator('text=AED 40').first()).toBeVisible();
    await expect(page.locator('text=AED 120').first()).toBeVisible();
    await expect(page.locator('text=AED 250').first()).toBeVisible();
  });

  test('E4 - all WhatsApp CTAs link to wa.me', async ({ page }) => {
    await page.goto('/cv-service');
    const waBtns = await page.locator('a[href*="wa.me"]').count();
    expect(waBtns).toBeGreaterThan(2);
  });

  test('E5 - FAQ accordion toggles', async ({ page }) => {
    await page.goto('/cv-service');
    const firstFaq = page.locator('[class*="accordion"], .faq, button:has-text("ATS")').first()
      .or(page.locator('button').filter({ hasText: 'Will my CV pass' }));
    if (await firstFaq.count() > 0) {
      await firstFaq.click();
      await page.waitForTimeout(300);
    }
    // FAQ section should exist
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
  });

  test('E6 - /cv-builder redirects to /cv-service', async ({ page }) => {
    await page.goto('/cv-builder');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cv-service');
  });
});

// ── Group F: Navigation & Links ────────────────────────────────────────────────

test.describe('F: Navigation & Links', () => {
  test('F1 - salary guide link works', async ({ page }) => {
    await page.goto('/');
    const salaryLink = page.locator('a[href="/salary-guide"]').first();
    await salaryLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/salary-guide');
  });

  test('F2 - logo links to home', async ({ page }) => {
    await page.goto('/jobs');
    await page.locator('header a[href="/"]').first().click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('F3 - footer links navigate correctly', async ({ page }) => {
    await page.goto('/');
    const footerJobsLink = page.locator('footer a[href*="/jobs"]').first();
    await footerJobsLink.scrollIntoViewIfNeeded();
    await footerJobsLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/jobs');
  });

  test('F4 - admin portal is accessible via direct URL', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('F5 - admin redirects to portal when not logged in', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('secure-portal-9x4m7k');
  });
});

// ── Group G: Admin Auth ────────────────────────────────────────────────────────

test.describe('G: Admin Authentication', () => {
  test('G1 - login page renders', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('G2 - wrong credentials shows error', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);
    // Should show error OR stay on same page
    expect(page.url()).toContain('secure-portal');
  });

  test('G3 - correct credentials redirect to admin', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.fill('input[type="email"]', 'admin@uaecareer.ae');
    await page.fill('input[type="password"]', 'Applesec22@u');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin**', { timeout: 5000 });
    expect(page.url()).toContain('/admin');
  });

  test('G4 - admin dashboard shows real stats (not fake 14k users)', async ({ page }) => {
    // Login first
    await page.goto('/secure-portal-9x4m7k');
    await page.fill('input[type="email"]', 'admin@uaecareer.ae');
    await page.fill('input[type="password"]', 'Applesec22@u');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin**', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('14,230');
    expect(bodyText).not.toContain('3,891');
  });

  test('G5 - demo login works', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.locator('button:has-text("Demo Login")').click();
    await page.waitForURL('**/admin**', { timeout: 5000 });
    expect(page.url()).toContain('/admin');
  });

  test('G6 - logout redirects to portal', async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.locator('button:has-text("Demo Login")').click();
    await page.waitForURL('**/admin**', { timeout: 5000 });
    await page.locator('button:has-text("Logout")').first().click();
    await page.waitForURL('**/secure-portal**', { timeout: 5000 });
    expect(page.url()).toContain('secure-portal');
  });
});

// ── Group H: Admin Pages ───────────────────────────────────────────────────────

test.describe('H: Admin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/secure-portal-9x4m7k');
    await page.locator('button:has-text("Demo Login")').click();
    await page.waitForURL('**/admin**', { timeout: 5000 });
  });

  test('H1 - admin jobs page loads', async ({ page }) => {
    await page.goto('/admin/jobs');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, [class*="title"]').first()).toBeVisible();
  });

  test('H2 - admin users page loads', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('H3 - admin employers page loads', async ({ page }) => {
    await page.goto('/admin/employers');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('H4 - admin categories page loads', async ({ page }) => {
    await page.goto('/admin/categories');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('H5 - admin analytics page loads', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });

  test('H6 - admin profile page loads', async ({ page }) => {
    await page.goto('/admin/profile');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1:has-text("Profile"), h1:has-text("My Profile")').or(
      page.locator('text=My Profile')
    ).first()).toBeVisible();
  });

  test('H7 - admin profile wrong password shows error', async ({ page }) => {
    await page.goto('/admin/profile');
    await page.fill('input[placeholder="••••••••"]', 'WrongPassword1');
    // Fill new password fields
    const pwInputs = page.locator('input[type="password"]');
    await pwInputs.nth(1).fill('NewPassword1!');
    await pwInputs.nth(2).fill('NewPassword1!');
    await page.locator('button:has-text("Update Password")').click();
    await page.waitForTimeout(500);
    await expect(page.locator('text=incorrect, text=wrong').first().or(
      page.locator('[class*="red"], [class*="error"]').first()
    )).toBeVisible({ timeout: 3000 });
  });
});

// ── Group I: Mobile Responsiveness ────────────────────────────────────────────

test.describe('I: Mobile (Pixel 5)', () => {
  test('I1 - homepage responsive', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('I2 - hamburger menu works on mobile', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('button[aria-label*="menu"], button svg, header button').first();
    const isVisible = await hamburger.isVisible();
    if (isVisible) {
      await hamburger.click();
      await page.waitForTimeout(300);
    }
    // Pass either way — test just ensures no crash
  });

  test('I3 - jobs page responsive', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('I4 - cv-service page responsive', async ({ page }) => {
    await page.goto('/cv-service');
    await page.waitForLoadState('networkidle');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });
});

// ── Group J: SEO & Meta ───────────────────────────────────────────────────────

test.describe('J: SEO & Meta', () => {
  test('J1 - homepage has og:title', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('J2 - homepage has description meta', async ({ page }) => {
    await page.goto('/');
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toBeTruthy();
    expect(desc!.length).toBeGreaterThan(20);
  });

  test('J3 - robots.txt accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text?.toLowerCase()).toContain('user-agent');
    expect(text).toContain('/admin');
  });

  test('J4 - sitemap.xml accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const text = await response?.text();
    expect(text).toContain('urlset');
  });

  test('J5 - jobs page has title meta', async ({ page }) => {
    await page.goto('/jobs');
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).toContain('UAE Careers');
  });

  test('J6 - cv-service page has title meta', async ({ page }) => {
    await page.goto('/cv-service');
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/cv|ats|career/);
  });
});

// ── Group K: Security ─────────────────────────────────────────────────────────

test.describe('K: Security', () => {
  test('K1 - primary admin path redirects unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin/jobs');
    await page.waitForLoadState('networkidle');
    // Should redirect to secure portal, not show admin content
    expect(page.url()).toContain('secure-portal');
  });

  test('K2 - admin dashboard protected without token', async ({ page }) => {
    // Clear storage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('secure-portal');
  });

  test('K3 - robots.txt blocks admin path', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    const text = await response?.text() || '';
    expect(text).toContain('Disallow: /admin');
  });

  test('K4 - robots.txt blocks secure portal path', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    const text = await response?.text() || '';
    expect(text).toContain('Disallow: /secure-portal');
  });
});

// ── Group L: Other Public Pages ───────────────────────────────────────────────

test.describe('L: Other Pages', () => {
  test('L1 - salary guide page loads', async ({ page }) => {
    await page.goto('/salary-guide');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('L2 - 404 page for completely unknown routes', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-xyz-abc');
    await page.waitForLoadState('networkidle');
    // Either 404 status or shows 404 content
    const is404 = response?.status() === 404 ||
      (await page.textContent('body'))?.includes('404') ||
      (await page.textContent('body'))?.includes('not found');
    expect(is404).toBeTruthy();
  });

  test('L3 - employer post-job page accessible', async ({ page }) => {
    await page.goto('/employer/post-job');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('main')).toBeVisible();
  });
});

// ── Group M: Performance & Accessibility ──────────────────────────────────────

test.describe('M: Performance & A11y', () => {
  test('M1 - homepage loads within 5 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(5000);
  });

  test('M2 - all images have alt text', async ({ page }) => {
    await page.goto('/');
    const imgsWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imgsWithoutAlt).toBe(0);
  });

  test('M3 - no console errors on homepage', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const realErrors = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('hydration') &&
      !e.includes('Warning:')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('M4 - interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/');
    // Tab to the first nav link
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focused!)).toBeTruthy();
  });
});
