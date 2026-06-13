require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Countries (GCC)
  const countries = await Promise.all([
    prisma.country.upsert({ where: { code: 'AE' }, update: {}, create: { name: 'United Arab Emirates', code: 'AE', sortOrder: 1 } }),
    prisma.country.upsert({ where: { code: 'SA' }, update: {}, create: { name: 'Saudi Arabia', code: 'SA', sortOrder: 2 } }),
    prisma.country.upsert({ where: { code: 'QA' }, update: {}, create: { name: 'Qatar', code: 'QA', sortOrder: 3 } }),
    prisma.country.upsert({ where: { code: 'KW' }, update: {}, create: { name: 'Kuwait', code: 'KW', sortOrder: 4 } }),
    prisma.country.upsert({ where: { code: 'OM' }, update: {}, create: { name: 'Oman', code: 'OM', sortOrder: 5 } }),
    prisma.country.upsert({ where: { code: 'BH' }, update: {}, create: { name: 'Bahrain', code: 'BH', sortOrder: 6 } }),
  ])

  const [uae, sa, qa, kw, om, bh] = countries

  // Cities
  const cities = [
    { name: 'Dubai', countryId: uae.id },
    { name: 'Abu Dhabi', countryId: uae.id },
    { name: 'Sharjah', countryId: uae.id },
    { name: 'Ajman', countryId: uae.id },
    { name: 'Ras Al Khaimah', countryId: uae.id },
    { name: 'Riyadh', countryId: sa.id },
    { name: 'Jeddah', countryId: sa.id },
    { name: 'Dammam', countryId: sa.id },
    { name: 'Mecca', countryId: sa.id },
    { name: 'Doha', countryId: qa.id },
    { name: 'Kuwait City', countryId: kw.id },
    { name: 'Muscat', countryId: om.id },
    { name: 'Manama', countryId: bh.id },
  ]

  for (const city of cities) {
    await prisma.city.create({ data: city }).catch(() => {})
  }

  // Categories
  const categories = [
    { name: 'Accounting & Finance', slug: 'accounting-finance', icon: '💼', sortOrder: 1 },
    { name: 'Information Technology', slug: 'information-technology', icon: '💻', sortOrder: 2 },
    { name: 'Engineering', slug: 'engineering', icon: '⚙️', sortOrder: 3 },
    { name: 'Sales & Marketing', slug: 'sales-marketing', icon: '📊', sortOrder: 4 },
    { name: 'Human Resources', slug: 'human-resources', icon: '👥', sortOrder: 5 },
    { name: 'Healthcare & Medical', slug: 'healthcare-medical', icon: '🏥', sortOrder: 6 },
    { name: 'Hospitality & Tourism', slug: 'hospitality-tourism', icon: '🏨', sortOrder: 7 },
    { name: 'Construction & Real Estate', slug: 'construction-real-estate', icon: '🏗️', sortOrder: 8 },
    { name: 'Legal', slug: 'legal', icon: '⚖️', sortOrder: 9 },
    { name: 'Education & Training', slug: 'education-training', icon: '📚', sortOrder: 10 },
    { name: 'Logistics & Supply Chain', slug: 'logistics-supply-chain', icon: '🚚', sortOrder: 11 },
    { name: 'Customer Service', slug: 'customer-service', icon: '🎧', sortOrder: 12 },
    { name: 'Administration', slug: 'administration', icon: '📋', sortOrder: 13 },
    { name: 'Retail', slug: 'retail', icon: '🛍️', sortOrder: 14 },
    { name: 'Oil & Gas', slug: 'oil-gas', icon: '⛽', sortOrder: 15 },
    { name: 'Cyber Security', slug: 'cyber-security', icon: '🔒', sortOrder: 16 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat })
  }

  // Platform Settings (defaults)
  const settings = [
    // General
    { key: 'site_name', value: 'UAE Careers', type: 'string', group: 'general', label: 'Site Name' },
    { key: 'fraud_notice_text', value: '⚠️ Notice: uaecareer.ae is not a recruiter. We only share publicly available walk-in opportunities. Never pay anyone for job applications, interviews, tests, or recruitment processes. Genuine walk-ins are always free.', type: 'text', group: 'general', label: 'Fraud Notice Text' },
    { key: 'fraud_report_email', value: 'ask@uaecareer.ae', type: 'string', group: 'general', label: 'Fraud Report Email' },
    // Ad settings
    { key: 'landing_ad_type', value: 'GOOGLE_ADSENSE', type: 'string', group: 'ads', label: 'Landing Page Ad Type' },
    { key: 'rewarded_ad_enabled', value: 'true', type: 'boolean', group: 'ads', label: 'Rewarded Ad Enabled' },
    { key: 'rewarded_ad_timer_web', value: '5', type: 'number', group: 'ads', label: 'Rewarded Ad Close Timer (Web, seconds)' },
    { key: 'rewarded_ad_timer_mobile', value: '5', type: 'number', group: 'ads', label: 'Rewarded Ad Close Timer (Mobile, seconds)' },
    { key: 'free_jobs_before_ad', value: '5', type: 'number', group: 'ads', label: 'Free Jobs Before Ad Gate' },
    { key: 'adsense_slot_header', value: '', type: 'string', group: 'ads', label: 'AdSense Header Slot ID' },
    { key: 'adsense_slot_sidebar', value: '', type: 'string', group: 'ads', label: 'AdSense Sidebar Slot ID' },
    { key: 'whatsapp_channel_url', value: '', type: 'string', group: 'ads', label: 'WhatsApp Channel URL' },
    // User approval
    { key: 'jobseeker_auto_approve', value: 'true', type: 'boolean', group: 'approval', label: 'Job Seeker Auto Approve' },
    { key: 'employer_auto_approve', value: 'false', type: 'boolean', group: 'approval', label: 'Employer Auto Approve' },
    // CV & Media
    { key: 'cv_upload_enabled', value: 'false', type: 'boolean', group: 'media', label: 'CV Upload Enabled' },
    { key: 'photo_upload_enabled', value: 'false', type: 'boolean', group: 'media', label: 'Photo Upload Enabled' },
    { key: 'max_cv_size_mb', value: '2', type: 'number', group: 'media', label: 'Max CV Size (MB)' },
    // Employer limits
    { key: 'employer_free_posts_limit', value: '3', type: 'number', group: 'employer', label: 'Employer Free Posts Limit' },
    { key: 'extra_post_price_usd', value: '10', type: 'number', group: 'employer', label: 'Extra Job Post Price (USD)' },
    // Premium
    { key: 'premium_gate_enabled', value: 'false', type: 'boolean', group: 'premium', label: 'Premium Gate Enabled' },
    { key: 'free_job_view_limit', value: '5', type: 'number', group: 'premium', label: 'Free Job View Limit (Non-premium)' },
    { key: 'premium_price_monthly', value: '9.99', type: 'number', group: 'premium', label: 'Premium Monthly Price (USD)' },
    // Payments
    { key: 'stripe_enabled', value: 'false', type: 'boolean', group: 'payments', label: 'Stripe Enabled' },
    { key: 'paypal_enabled', value: 'false', type: 'boolean', group: 'payments', label: 'PayPal Enabled' },
    // LLM
    { key: 'llm_global_enabled', value: 'false', type: 'boolean', group: 'llm', label: 'Global LLM Enabled' },
    { key: 'llm_provider', value: 'OPENAI', type: 'string', group: 'llm', label: 'LLM Provider' },
    { key: 'llm_employer_mode', value: 'false', type: 'boolean', group: 'llm', label: 'Employer LLM Mode' },
    // Apply methods
    { key: 'default_apply_method', value: 'EMAIL', type: 'string', group: 'apply', label: 'Default Apply Method' },
    // AI Chatbot
    { key: 'chatbot_enabled', value: 'false', type: 'boolean', group: 'llm', label: 'AI Chatbot Enabled' },
    { key: 'chatbot_name', value: 'Career Assistant', type: 'string', group: 'llm', label: 'Chatbot Name' },
    { key: 'chatbot_greeting', value: 'Hi! I can help you find jobs and answer your questions.', type: 'string', group: 'llm', label: 'Chatbot Greeting' },
  ]

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { ...setting, updatedAt: new Date() },
    })
  }

  // CMS Content defaults
  const cmsContent = [
    { key: 'hero_title', title: 'Hero Title', content: 'Find Your Dream Job in the Gulf', page: 'home' },
    { key: 'hero_subtitle', title: 'Hero Subtitle', content: '50-100 fresh job openings every day — free, fast, and trusted.', page: 'home' },
    { key: 'hero_cta', title: 'Hero CTA Button', content: 'Search Jobs', page: 'home' },
    { key: 'about_us', title: 'About Us', content: 'UAE Careers is the Gulf\'s leading job portal connecting talented professionals with top employers across the GCC region.', page: 'about' },
    { key: 'footer_tagline', title: 'Footer Tagline', content: 'Your trusted GCC job portal.', page: 'footer' },
    { key: 'terms', title: 'Terms & Conditions', content: 'Terms and conditions content here.', page: 'legal' },
    { key: 'privacy', title: 'Privacy Policy', content: 'Privacy policy content here.', page: 'legal' },
  ]

  for (const cms of cmsContent) {
    await prisma.cmsContent.upsert({
      where: { key: cms.key },
      update: {},
      create: { ...cms, updatedAt: new Date() },
    })
  }

  // Super User
  const superUserExists = await prisma.user.findFirst({ where: { role: 'SUPER_USER' } })
  if (!superUserExists) {
    const hash = await bcrypt.hash('Admin@123456', 12)
    const superUser = await prisma.user.create({
      data: {
        email: 'admin@uaecareer.ae',
        passwordHash: hash,
        role: 'SUPER_USER',
        approvalStatus: 'APPROVED',
        emailVerified: true,
        registeredVia: 'seed',
      },
    })
    await prisma.adminProfile.create({
      data: {
        userId: superUser.id,
        firstName: 'Super',
        lastName: 'Admin',
        permissions: { all: true },
      },
    })
    console.log('Super User created: admin@uaecareer.ae / Admin@123456')
  }

  console.log('Seeding complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
