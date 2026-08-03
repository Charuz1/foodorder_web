import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Plus, ShoppingCart } from 'lucide-react';

const FoodCard = ({ food, onSelect }) => {
  const { addToCart } = useContext(CartContext);

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(food, 1);
  };

  return (
    <div 
      className="glass-card" 
      onClick={() => onSelect(food)}
      style={{ 
        cursor: 'pointer', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        transition: 'transform 0.3s ease, border-color 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
        <img 
          src={food.image} 
          alt={food.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <span 
          style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            background: 'var(--accent-color)', 
            padding: '4px 10px', 
            borderRadius: 8, 
            fontSize: 12, 
            fontWeight: 700 
          }}
        >
          Rs. {food.price.toFixed(2)}
        </span>
      </div>
      
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{food.title}</h4>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: 16, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {food.description}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Category: {food.category}
          </span>
          <button 
            onClick={handleQuickAdd} 
            className="btn btn-primary" 
            style={{ padding: '8px 12px', borderRadius: 8, fontSize: 13 }}
            title="Quick Add to Cart"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
