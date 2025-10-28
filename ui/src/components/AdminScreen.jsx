import { useState } from 'react'
import { initialInventory, initialOrders, getStockStatus, calculateOrderStats } from '../data/adminData'
import './AdminScreen.css'

function AdminScreen() {
  const [inventory, setInventory] = useState(initialInventory)
  const [orders, setOrders] = useState(initialOrders)

  // 재고 수량 조절
  const updateStock = (id, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + change)
        return { ...item, stock: newStock }
      }
      return item
    }))
  }

  // 주문 상태 변경
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    }))
  }

  // 주문 통계 계산
  const orderStats = calculateOrderStats(orders)

  return (
    <div className="admin-screen">
      {/* 관리자 대시보드 */}
      <section className="dashboard-section">
        <h3>관리자 대시보드</h3>
        <div className="stats-container">
          <div className="stat-item">
            <span className="stat-label">총 주문</span>
            <span className="stat-value">{orderStats.totalOrders}</span>
          </div>
          <div className="stat-divider">/</div>
          <div className="stat-item">
            <span className="stat-label">주문 접수</span>
            <span className="stat-value">{orderStats.receivedOrders}</span>
          </div>
          <div className="stat-divider">/</div>
          <div className="stat-item">
            <span className="stat-label">제조 중</span>
            <span className="stat-value">{orderStats.inProgressOrders}</span>
          </div>
          <div className="stat-divider">/</div>
          <div className="stat-item">
            <span className="stat-label">제조 완료</span>
            <span className="stat-value">{orderStats.completedOrders}</span>
          </div>
        </div>
      </section>

      {/* 재고 현황 */}
      <section className="inventory-section">
        <h3>재고 현황</h3>
        <div className="inventory-grid">
          {inventory.map(item => {
            const stockInfo = getStockStatus(item.stock)
            return (
              <div key={item.id} className="inventory-card">
                <div className="inventory-header">
                  <h4 className="inventory-name">{item.name}</h4>
                  <div className="stock-info">
                    <span className="stock-count">{item.stock}개</span>
                    <span 
                      className="stock-status" 
                      style={{ color: stockInfo.color }}
                    >
                      {stockInfo.status}
                    </span>
                  </div>
                </div>
                <div className="inventory-controls">
                  <button 
                    className="stock-btn decrease"
                    onClick={() => updateStock(item.id, -1)}
                    disabled={item.stock === 0}
                  >
                    -
                  </button>
                  <button 
                    className="stock-btn increase"
                    onClick={() => updateStock(item.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 주문 현황 */}
      <section className="orders-section">
        <h3>주문 현황</h3>
        <div className="orders-container">
          {orders.length === 0 ? (
            <p className="no-orders">주문이 없습니다.</p>
          ) : (
            orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusUpdate={updateOrderStatus}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

// 주문 카드 컴포넌트
function OrderCard({ order, onStatusUpdate }) {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case '주문 접수':
        return '제조 중'
      case '제조 중':
        return '제조 완료'
      default:
        return null
    }
  }

  const getStatusButtonText = (currentStatus) => {
    switch (currentStatus) {
      case '주문 접수':
        return '제조 시작'
      case '제조 중':
        return '제조 완료'
      default:
        return null
    }
  }

  const nextStatus = getNextStatus(order.status)
  const buttonText = getStatusButtonText(order.status)

  return (
    <div className="order-card">
      <div className="order-info">
        <div className="order-time">
          {formatDateTime(order.orderTime)}
        </div>
        <div className="order-items">
          {order.items.map((item, index) => (
            <span key={index} className="order-item">
              {item.productName}
              {item.options.length > 0 && ` (${item.options.join(', ')})`}
              {' x '}{item.quantity}
            </span>
          ))}
        </div>
        <div className="order-price">
          {order.totalPrice.toLocaleString()}원
        </div>
      </div>
      <div className="order-actions">
        <span className={`order-status status-${order.status.replace(' ', '-')}`}>
          {order.status}
        </span>
        {nextStatus && (
          <button 
            className="status-btn"
            onClick={() => onStatusUpdate(order.id, nextStatus)}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminScreen
