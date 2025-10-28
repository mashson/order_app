// 관리자 화면용 데이터
export const initialInventory = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    stock: 10
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    stock: 3
  },
  {
    id: 3,
    name: '카페라떼',
    stock: 0
  }
];

export const initialOrders = [
  {
    id: 1,
    orderTime: '2024-07-31T13:00:00',
    items: [
      {
        productName: '아메리카노(ICE)',
        quantity: 1,
        options: ['샷 추가']
      }
    ],
    totalPrice: 4500,
    status: '주문 접수'
  },
  {
    id: 2,
    orderTime: '2024-07-31T12:45:00',
    items: [
      {
        productName: '카페라떼',
        quantity: 2,
        options: []
      }
    ],
    totalPrice: 10000,
    status: '제조 중'
  }
];

// 재고 상태 계산 함수
export const getStockStatus = (stock) => {
  if (stock === 0) return { status: '품절', color: '#ef4444' };
  if (stock < 5) return { status: '주의', color: '#f59e0b' };
  return { status: '정상', color: '#10b981' };
};

// 주문 통계 계산 함수
export const calculateOrderStats = (orders) => {
  const totalOrders = orders.length;
  const receivedOrders = orders.filter(order => order.status === '주문 접수').length;
  const inProgressOrders = orders.filter(order => order.status === '제조 중').length;
  const completedOrders = orders.filter(order => order.status === '제조 완료').length;
  
  return {
    totalOrders,
    receivedOrders,
    inProgressOrders,
    completedOrders
  };
};
