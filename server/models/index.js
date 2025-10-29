import pool from '../config/database.js';

// 메뉴 모델
export const Menu = {
  // 전체 메뉴 조회 (옵션 포함)
  async findAll() {
    const query = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'price', o.price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id AND o.is_available = true
      WHERE m.is_available = true
      GROUP BY m.id
      ORDER BY m.id;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // 특정 메뉴 조회
  async findById(id) {
    const query = `
      SELECT 
        m.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', o.id,
              'name', o.name,
              'price', o.price
            )
          ) FILTER (WHERE o.id IS NOT NULL),
          '[]'
        ) as options
      FROM menus m
      LEFT JOIN options o ON m.id = o.menu_id AND o.is_available = true
      WHERE m.id = $1 AND m.is_available = true
      GROUP BY m.id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // 재고 수량 업데이트
  async updateStock(id, quantity) {
    const query = `
      UPDATE menus 
      SET stock_quantity = $2, 
          is_available = $2 > 0,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, quantity]);
    return result.rows[0];
  }
};

// 주문 모델
export const Order = {
  // 새 주문 생성
  async create(orderData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 주문 기본 정보 삽입
      const orderQuery = `
        INSERT INTO orders (total_price, status)
        VALUES ($1, 'received')
        RETURNING *;
      `;
      const orderResult = await client.query(orderQuery, [orderData.total_price]);
      const order = orderResult.rows[0];

      // 주문 상세 항목들 삽입
      for (const item of orderData.items) {
        const itemQuery = `
          INSERT INTO order_items (order_id, menu_id, quantity, unit_price, subtotal, selected_options)
          VALUES ($1, $2, $3, $4, $5, $6);
        `;
        await client.query(itemQuery, [
          order.id,
          item.menu_id,
          item.quantity,
          item.unit_price,
          item.subtotal,
          JSON.stringify(item.selected_options || [])
        ]);

        // 재고 차감
        const stockQuery = `
          UPDATE menus 
          SET stock_quantity = stock_quantity - $2,
              is_available = (stock_quantity - $2) > 0,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1;
        `;
        await client.query(stockQuery, [item.menu_id, item.quantity]);
      }

      await client.query('COMMIT');
      return order;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // 주문 조회 (상세 정보 포함)
  async findById(id) {
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal,
              'selected_options', oi.selected_options
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id = $1
      GROUP BY o.id;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // 주문 상태 업데이트
  async updateStatus(id, status) {
    const query = `
      UPDATE orders 
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [id, status]);
    return result.rows[0];
  },

  // 주문 목록 조회 (관리자용)
  async findAll(filters = {}) {
    let query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'menu_id', oi.menu_id,
              'menu_name', m.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal,
              'selected_options', oi.selected_options
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`o.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY o.id ORDER BY o.order_time DESC`;

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  },

  // 주문 통계 조회
  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'received') as received_orders,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders
      FROM orders;
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
};

// 재고 모델
export const Inventory = {
  // 전체 재고 조회
  async findAll() {
    const query = `
      SELECT id, name, stock_quantity, is_available
      FROM menus
      ORDER BY id;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
};
