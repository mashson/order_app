import express from 'express';
import menuRoutes from './menuRoutes.js';
import orderRoutes from './orderRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// API 라우트 등록
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;
