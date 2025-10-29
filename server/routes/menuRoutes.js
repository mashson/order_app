import express from 'express';
import { Menu } from '../models/index.js';

const router = express.Router();

// GET /api/menus - 전체 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.json({
      success: true,
      data: menus
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MENU_FETCH_FAILED',
        message: '메뉴 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/menus/:id - 특정 메뉴 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MENU_NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Menu fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MENU_FETCH_FAILED',
        message: '메뉴 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;
