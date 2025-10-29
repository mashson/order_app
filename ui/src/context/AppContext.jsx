import { createContext, useContext, useState, useEffect } from 'react'
import { initialInventory, initialOrders } from '../data/adminData'

const AppContext = createContext()

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('cozy-inventory')
    return saved ? JSON.parse(saved) : initialInventory
  })
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('cozy-orders')
    return saved ? JSON.parse(saved) : initialOrders
  })

  // 로컬스토리지에 상태 저장
  useEffect(() => {
    localStorage.setItem('cozy-inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem('cozy-orders', JSON.stringify(orders))
  }, [orders])

  // 재고 업데이트
  const updateStock = (id, change) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stock + change)
        return { ...item, stock: newStock }
      }
      return item
    }))
  }

  // 주문 추가
  const addOrder = (orderData) => {
    const newOrder = {
      id: Date.now(),
      orderTime: new Date().toISOString(),
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      status: '주문 접수'
    }
    setOrders(prev => [newOrder, ...prev])
    
    // 재고 감소
    orderData.items.forEach(item => {
      const productName = item.productName.split(' (')[0] // 옵션 제거
      setInventory(prev => prev.map(invItem => {
        if (invItem.name === productName) {
          return {
            ...invItem,
            stock: Math.max(0, invItem.stock - item.quantity)
          }
        }
        return invItem
      }))
    })
  }

  // 주문 상태 업데이트
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return { ...order, status: newStatus }
      }
      return order
    }))
  }

  // 데이터 초기화 (개발용)
  const resetData = () => {
    setInventory(initialInventory)
    setOrders(initialOrders)
    localStorage.removeItem('cozy-inventory')
    localStorage.removeItem('cozy-orders')
  }

  const value = {
    inventory,
    orders,
    updateStock,
    addOrder,
    updateOrderStatus,
    resetData
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export default AppContext
