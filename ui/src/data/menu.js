// 커피 메뉴 데이터
import americanoIce from '../images/americano-ice.jpg'
import americanoHot from '../images/americano-hot.jpg'
import caffeLatte from '../images/caffe-latte.jpg'

export const menuItems = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '진한 에스프레소에 시원한 얼음과 물을 더한 음료',
    image: americanoIce,
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '진한 에스프레소에 뜨거운 물을 더한 음료',
    image: americanoHot,
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    image: caffeLatte,
    options: [
      { name: '샷 추가', price: 500 },
      { name: '시럽 추가', price: 0 }
    ]
  }
];
