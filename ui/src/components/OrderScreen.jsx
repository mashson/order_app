import { useState } from 'react'
import { menuItems } from '../data/menu'
import './OrderScreen.css'

function OrderScreen() {
  const [cart, setCart] = useState([])

  // 장바구니 추가 함수
  const addToCart = (item, selectedOptions) => {
    const options = selectedOptions.filter(opt => opt.selected)
    const optionsText = options.length > 0 
      ? ` (${options.map(opt => opt.name).join(', ')})` 
      : ''
    
    const cartItem = {
      id: Date.now(),
      productId: item.id,
      productName: item.name + optionsText,
      quantity: 1,
      price: item.price + options.reduce((sum, opt) => sum + opt.price, 0)
    }

    // 같은 상품이 이미 있는지 확인
    const existingIndex = cart.findIndex(
      c => c.productName === cartItem.productName
    )

    if (existingIndex >= 0) {
      // 수량 증가
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      newCart[existingIndex].price = cartItem.price * newCart[existingIndex].quantity
      setCart(newCart)
    } else {
      // 새 항목 추가
      setCart([...cart, cartItem])
    }
  }

  // 장바구니에서 제거
  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id))
  }

  // 수량 조절
  const updateQuantity = (id, change) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) return null
        return {
          ...item,
          quantity: newQuantity,
          price: (item.price / item.quantity) * newQuantity
        }
      }
      return item
    }).filter(Boolean)
    setCart(newCart)
  }

  // 총 금액 계산
  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0)

  // 주문하기
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    alert(`주문이 완료되었습니다!\n총 금액: ${totalPrice.toLocaleString()}원`)
    setCart([])
  }

  return (
    <div className="order-screen">
      {/* 상품 목록 */}
      <div className="products-section">
        {menuItems.map(item => (
          <ProductCard 
            key={item.id} 
            item={item} 
            onAddToCart={addToCart}
          />
        ))}
      </div>

      {/* 장바구니 */}
      <div className="cart-section">
        <h3>장바구니</h3>
        {cart.length === 0 ? (
          <p className="empty-cart">장바구니가 비어있습니다.</p>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.productName}</span>
                    <span className="cart-quantity">X {item.quantity}</span>
                  </div>
                  <div className="cart-item-actions">
                    <span className="cart-item-price">
                      {item.price.toLocaleString()}원
                    </span>
                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="total-price">
                총 금액 <strong>{totalPrice.toLocaleString()}원</strong>
              </div>
              <button className="order-btn" onClick={handleOrder}>
                주문하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 상품 카드 컴포넌트
function ProductCard({ item, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState(
    item.options.map(opt => ({ ...opt, selected: false }))
  )

  const handleOptionChange = (index) => {
    const newOptions = [...selectedOptions]
    newOptions[index].selected = !newOptions[index].selected
    setSelectedOptions(newOptions)
  }

  const handleAddToCart = () => {
    onAddToCart(item, selectedOptions)
    // 옵션 초기화
    setSelectedOptions(item.options.map(opt => ({ ...opt, selected: false })))
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <img src={item.image} alt={item.name} />
      </div>
      <h4 className="product-name">{item.name}</h4>
      <p className="product-price">{item.price.toLocaleString()}원</p>
      <p className="product-description">{item.description}</p>
      <div className="product-options">
        {selectedOptions.map((option, index) => (
          <label key={index} className="option-item">
            <input
              type="checkbox"
              checked={option.selected}
              onChange={() => handleOptionChange(index)}
            />
            <span>
              {option.name}
              {option.price > 0 && <span>(+{option.price.toLocaleString()}원)</span>}
            </span>
          </label>
        ))}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        담기
      </button>
    </div>
  )
}

export default OrderScreen
