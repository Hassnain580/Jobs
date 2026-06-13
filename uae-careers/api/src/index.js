require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.get('/health', (req, res) => res.json({ success: true, message: 'OK' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/saved', require('./routes/saved'));

// Admin routes
app.use('/api/admin/users', require('./routes/admin/users'));
app.use('/api/admin/jobs', require('./routes/admin/jobs'));
app.use('/api/admin/settings', require('./routes/admin/settings'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/countries', require('./routes/admin/countries'));
app.use('/api/admin/cms', require('./routes/admin/cms'));
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/analytics', require('./routes/admin/analytics'));
app.use('/api/admin/admins', require('./routes/admin/admins'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
