import express from 'express';
import { Order } from '../models/index.js';

const router = express.Router();

// POST /api/orders - 새 주문 생성
router.post('/', async (req, res) => {
  try {
    const { items, total_price } = req.body;

    // 입력 데이터 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ORDER_DATA',
          message: '주문 항목이 필요합니다.'
        }
      });
    }

    if (!total_price || total_price <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOTAL_PRICE',
          message: '올바른 총 금액이 필요합니다.'
        }
      });
    }

    // 주문 생성
    const order = await Order.create({ items, total_price });

    res.status(201).json({
      success: true,
      data: {
        order_id: order.id,
        order_time: order.order_time,
        total_price: order.total_price,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_CREATION_FAILED',
        message: '주문 생성 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/orders/:id - 특정 주문 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
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
      data: order
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ORDER_FETCH_FAILED',
        message: '주문 조회 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;
