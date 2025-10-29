import express from 'express';
import { Order, Inventory, Menu } from '../models/index.js';

const router = express.Router();

// GET /api/admin/dashboard - 관리자 대시보드 통계 조회
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Order.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DASHBOARD_STATS_FAILED',
        message: '대시보드 통계 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/admin/inventory - 재고 현황 조회
router.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.findAll();
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_FETCH_FAILED',
        message: '재고 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

// PATCH /api/admin/inventory/:id - 재고 수량 수정
router.patch('/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STOCK_QUANTITY',
          message: '올바른 재고 수량이 필요합니다.'
        }
      });
    }

    const updatedItem = await Menu.updateStock(id, stock_quantity);

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ITEM_NOT_FOUND',
          message: '재고 항목을 찾을 수 없습니다.'
        }
      });
    }

    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Inventory update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INVENTORY_UPDATE_FAILED',
        message: '재고 수정 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/admin/orders - 전체 주문 목록 조회 (관리자용)
router.get('/orders', async (req, res) => {
  try {
    const { status, limit = 10 } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit);

    const orders = await Order.findAll(filters);

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDERS_FETCH_FAILED',
        message: '주문 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

// PATCH /api/admin/orders/:id - 주문 상태 변경
router.patch('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['received', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '올바른 주문 상태가 필요합니다.'
        }
      });
    }

    const updatedOrder = await Order.updateStatus(id, status);

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ORDER_NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }

    res.json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    console.error('Order status update error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_STATUS_UPDATE_FAILED',
        message: '주문 상태 변경 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;
