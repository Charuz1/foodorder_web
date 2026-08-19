import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Star, MessageSquare, Plus, Minus, X } from 'lucide-react';

const RestaurantDetail = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, showNotification } = useContext(AuthContext);

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');

  // Review state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchRestaurantDetails();
    fetchReviews();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/restaurants/${id}`);
      if (response.ok) {
        const data = await response.json();
        const { foods: menu, ...rest } = data;
        setRestaurant(rest);
        setFoods(menu || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews/restaurant/${id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setInstructions('');
  };

  const handleCloseModal = () => {
    setSelectedFood(null);
  };

  const handleAddToCart = () => {
    if (!selectedFood) return;
    // We can attach instructions if needed, for simplicity we just add
    addToCart(selectedFood, quantity);
    showNotification(`${selectedFood.title} x${quantity} added to cart`);
    handleCloseModal();
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please login to post a review', 'error');
      return;
    }
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          restaurantId: id,
          rating: newRating,
          comment: newComment
        })
      });
      if (response.ok) {
        setNewComment('');
        showNotification('Review submitted successfully!');
        fetchReviews();
        // Update restaurant rating
        fetchRestaurantDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>Loading menu...</div>;
  }

  if (!restaurant) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}>Restaurant not found</div>;
  }

  return (
    <div>
      {/* Restaurant Header */}
      <div 
        className="glass-card" 
        style={{ 
          display: 'flex', 
          gap: 32, 
          padding: 32, 
          borderRadius: 24, 
          marginBottom: 40,
          flexWrap: 'wrap'
        }}
      >
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          style={{ width: '100%', maxWidth: 360, height: 220, objectFit: 'cover', borderRadius: 16 }} 
        />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="card-category" style={{ width: 'fit-content', marginBottom: 12 }}>{restaurant.category}</span>
          <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 12 }}>{restaurant.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, marginBottom: 20 }}>
            {restaurant.description}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontWeight: 700 }}>
              <Star fill="currentColor" size={18} />
              <span>{restaurant.rating} Rating</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
              <MessageSquare size={18} />
              <span>{reviews.length} Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Foods Grid */}
      <h2 className="section-title" style={{ marginBottom: 24 }}>Explore Menu</h2>
      {foods.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40 }}>No menu items available at this time.</p>
      ) : (
        <div className="restaurants-grid" style={{ marginBottom: 60 }}>
          {foods.map(food => (
            <FoodCard key={food.id} food={food} onSelect={handleOpenModal} />
          ))}
        </div>
      )}

      {/* Review Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, flexWrap: 'wrap' }}>
        {/* Reviews List */}
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ marginBottom: 20 }}>Customer Reviews</h3>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to leave one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map((rev, idx) => (
                <div key={idx} style={{ paddingBottom: 16, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{rev.userName}</span>
                    <span style={{ color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                      <Star size={12} fill="currentColor" /> {rev.rating}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Review Form */}
        <div className="glass-card" style={{ padding: 28, height: 'fit-content' }}>
          <h3 style={{ marginBottom: 20 }}>Write a Review</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-group">
              <label>Rating (1 to 5 Stars)</label>
              <select 
                className="form-control" 
                value={newRating} 
                onChange={(e) => setNewRating(Number(e.target.value))}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                <option value={3}>⭐⭐⭐ (3/5)</option>
                <option value={2}>⭐⭐ (2/5)</option>
                <option value={1}>⭐ (1/5)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Your Comment</label>
              <textarea 
                className="form-control" 
                rows={3} 
                required
                placeholder="Share your thoughts about their food quality, delivery time, etc..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Submit Review
            </button>
          </form>
        </div>
      </div>

      {/* Interactive Modal */}
      {selectedFood && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <X size={18} />
            </button>
            <img src={selectedFood.image} alt={selectedFood.title} className="modal-img" />
            
            <div className="modal-body">
              <span className="card-category" style={{ marginBottom: 8, display: 'inline-block' }}>{selectedFood.category}</span>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>{selectedFood.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5, marginBottom: 20 }}>
                {selectedFood.description}
              </p>

              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: 8 }}>
                  Ingredients:
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {selectedFood.ingredients.map((ing, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid var(--border-color)', 
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        fontSize: 12 
                      }}
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Price per unit</span>
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent-color)' }}>Rs. {selectedFood.price.toFixed(2)}</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-color)', borderRadius: 10, padding: 4 }}>
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 6 }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', padding: 6 }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button className="btn btn-primary" onClick={handleAddToCart}>
                    Add to Cart • Rs. {(selectedFood.price * quantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetail;
