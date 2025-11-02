import { createContext, useContext, useState, useEffect } from 'react'
import { initialInventory, initialOrders } from '../data/adminData'
import { api } from '../utils/api'

const AppContext = createContext()

// 옵션 ID 배열을 옵션 이름 배열로 변환하는 헬퍼 함수
const formatOrderOptions = (optionIds, optionMap) => {
  // null 체크 및 배열 검증
  if (!optionIds || !Array.isArray(optionIds) || optionIds.length === 0) {
    return ''
  }
  
  // null/undefined 필터링
  const validOptionIds = optionIds.filter(id => id != null && id !== undefined && id !== '')
  
  if (validOptionIds.length === 0) {
    return ''
  }
  
  // 디버깅 로그
  console.log('🔍 formatOrderOptions 호출:')
  console.log('  - 원본 옵션 ID 배열:', optionIds)
  console.log('  - 유효한 옵션 ID:', validOptionIds)
  console.log('  - 옵션 매핑 테이블:', optionMap)
  
  // 옵션 ID가 숫자/문자열 혼재일 수 있으므로 모두 숫자로 변환해서 매핑
  const optionNames = validOptionIds
    .map(optId => {
      // 숫자로 변환해서 매핑 테이블에서 찾기
      const numId = typeof optId === 'string' ? parseInt(optId, 10) : optId
      
      // NaN 체크
      if (isNaN(numId)) {
        console.warn(`⚠️ 옵션 ID ${optId}는 유효한 숫자가 아닙니다.`)
        return null
      }
      
      const name = optionMap[numId] || optionMap[optId] // 숫자 ID와 문자열 ID 모두 시도
      
      // 디버깅: 찾지 못한 경우 경고
      if (!name) {
        console.warn(`⚠️ 옵션 ID ${optId} (숫자: ${numId})를 매핑 테이블에서 찾을 수 없습니다.`)
      } else {
        console.log(`✅ 옵션 ID ${optId} → ${name}`)
      }
      
      return name
    })
    .filter(Boolean) // null/undefined/빈 문자열 제거
  
  console.log('  - 최종 옵션 이름:', optionNames)
  
  return optionNames.length > 0 ? ` (${optionNames.join(', ')})` : ''
}

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 서버에서 초기 데이터 로드
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const [invRes, ordersRes, menusRes] = await Promise.all([
          api.admin.inventory(),
          api.admin.orders({ limit: 50 }),
          api.getMenus(), // 메뉴와 옵션 정보 가져오기
        ])
        if (!mounted) return
        
        // 옵션 ID -> 옵션 이름 매핑 테이블 생성 (숫자 ID로 저장)
        const optionMap = {}
        ;(menusRes?.data || []).forEach(menu => {
          if (Array.isArray(menu.options)) {
            menu.options.forEach(opt => {
              if (opt.id && opt.name) {
                // ID를 숫자로 변환해서 저장 (문자열/숫자 모두 지원)
                const numId = typeof opt.id === 'string' ? parseInt(opt.id, 10) : opt.id
                optionMap[numId] = opt.name
                // 문자열 키도 추가해서 이중 보호
                if (typeof opt.id === 'string') {
                  optionMap[opt.id] = opt.name
                }
              }
            })
          }
        })
        // 디버깅: 옵션 매핑 테이블 확인
        console.log('📋 옵션 매핑 테이블 생성 완료:', optionMap)
        
        // 재고: 서버 필드(stock_quantity) -> 클라이언트 필드(stock)로 매핑
        const inv = (invRes?.data || []).map(i => ({
          id: i.id,
          name: i.name,
          stock: i.stock_quantity,
          is_available: i.is_available,
        }))
        // 주문: 서버 필드 매핑 (옵션 ID를 옵션 이름으로 변환)
        const ord = (ordersRes?.data || []).map(o => {
          console.log('📦 주문 처리:', o.id, '항목:', o.items)
          return {
            id: o.id,
            orderTime: o.order_time,
            items: (o.items || []).map(it => {
              console.log('  - 주문 항목:', {
                menu_name: it.menu_name,
                selected_options: it.selected_options,
                selected_options_type: typeof it.selected_options,
                is_array: Array.isArray(it.selected_options)
              })
              return {
                productName: `${it.menu_name}${formatOrderOptions(it.selected_options, optionMap)}`,
                quantity: it.quantity,
                price: it.unit_price,
              }
            }),
            totalPrice: o.total_price,
            status: o.status === 'received' ? '주문 접수' : o.status === 'in_progress' ? '제조 중' : o.status === 'completed' ? '제조 완료' : o.status,
          }
        })
        setInventory(inv)
        setOrders(ord)
      } catch (e) {
        console.error('초기 데이터 로드 실패:', e)
        setError('데이터 로드에 실패했습니다.')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  // 로컬스토리지에 상태 저장
  useEffect(() => {
    localStorage.setItem('cozy-inventory', JSON.stringify(inventory))
  }, [inventory])

  useEffect(() => {
    localStorage.setItem('cozy-orders', JSON.stringify(orders))
  }, [orders])

  // 재고 업데이트 (서버 반영)
  const updateStock = async (id, change) => {
    try {
      const target = inventory.find(i => i.id === id)
      if (!target) return
      const next = Math.max(0, (target.stock || 0) + change)
      const res = await api.admin.updateInventory(id, next)
      const data = res?.data
      setInventory(prev => prev.map(item => item.id === id ? {
        ...item,
        stock: data?.stock_quantity ?? next,
        is_available: data?.is_available ?? next > 0,
      } : item))
    } catch (e) {
      alert('재고 수정 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  // 옵션 매핑 테이블 생성 헬퍼 함수
  const buildOptionMap = async () => {
    try {
      const menusRes = await api.getMenus()
      const optionMap = {}
      ;(menusRes?.data || []).forEach(menu => {
        if (Array.isArray(menu.options)) {
          menu.options.forEach(opt => {
            if (opt.id && opt.name) {
              // ID를 숫자로 변환해서 저장 (문자열/숫자 모두 지원)
              const numId = typeof opt.id === 'string' ? parseInt(opt.id, 10) : opt.id
              optionMap[numId] = opt.name
              // 문자열 키도 추가해서 이중 보호
              if (typeof opt.id === 'string') {
                optionMap[opt.id] = opt.name
              }
            }
          })
        }
      })
      return optionMap
    } catch (e) {
      console.error('옵션 매핑 테이블 생성 실패:', e)
      return {}
    }
  }

  // 주문 추가 (서버 반영)
  const addOrder = async (orderData) => {
    try {
      // orderData는 서버 스키마(snake_case)에 맞춰 전달됨
      const res = await api.createOrder(orderData)
      // 주문 목록 갱신: 서버에서 최신 목록 가져오기
      const [ordersRes, optionMap] = await Promise.all([
        api.admin.orders({ limit: 50 }),
        buildOptionMap(),
      ])
      const ord = (ordersRes?.data || []).map(o => ({
        id: o.id,
        orderTime: o.order_time,
        items: (o.items || []).map(it => ({
          productName: `${it.menu_name}${formatOrderOptions(it.selected_options, optionMap)}`,
          quantity: it.quantity,
          price: it.unit_price,
        })),
        totalPrice: o.total_price,
        status: o.status === 'received' ? '주문 접수' : o.status === 'in_progress' ? '제조 중' : o.status === 'completed' ? '제조 완료' : o.status,
      }))
      setOrders(ord)
      // 재고도 다시 로드
      const invRes = await api.admin.inventory()
      const inv = (invRes?.data || []).map(i => ({ id: i.id, name: i.name, stock: i.stock_quantity, is_available: i.is_available }))
      setInventory(inv)
      return res
    } catch (e) {
      alert('주문 생성 중 오류가 발생했습니다.')
      console.error(e)
    }
  }

  // 주문 상태 업데이트 (서버 반영)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('🔄 주문 상태 업데이트 시도:', { orderId, newStatus })
      
      // 한글 → 서버 상태코드 변환
      const mapToServer = (s) => (s === '주문 접수' ? 'received' : s === '제조 중' ? 'in_progress' : s === '제조 완료' ? 'completed' : s)
      const serverStatus = mapToServer(newStatus)
      
      console.log('📤 서버로 전송할 상태:', serverStatus)
      
      await api.admin.updateOrderStatus(orderId, serverStatus)
      
      console.log('✅ 상태 업데이트 성공, 목록 재조회 중...')
      
      // 목록 재조회
      const [ordersRes, optionMap] = await Promise.all([
        api.admin.orders({ limit: 50 }),
        buildOptionMap(),
      ])
      const ord = (ordersRes?.data || []).map(o => ({
        id: o.id,
        orderTime: o.order_time,
        items: (o.items || []).map(it => ({
          productName: `${it.menu_name}${formatOrderOptions(it.selected_options, optionMap)}`,
          quantity: it.quantity,
          price: it.unit_price,
        })),
        totalPrice: o.total_price,
        status: o.status === 'received' ? '주문 접수' : o.status === 'in_progress' ? '제조 중' : o.status === 'completed' ? '제조 완료' : o.status,
      }))
      setOrders(ord)
      
      console.log('✅ 주문 목록 갱신 완료')
    } catch (e) {
      console.error('❌ 주문 상태 변경 실패:', e)
      console.error('에러 상세:', e.message, e.stack)
      alert(`주문 상태 변경 중 오류가 발생했습니다.\n\n상세: ${e.message}`)
    }
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
    loading,
    error,
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
