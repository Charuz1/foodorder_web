import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="restaurant-card glass-card">
        <div className="card-img-wrapper">
          <img src={restaurant.image} alt={restaurant.name} className="card-img" />
          <div className="card-badge-rating">
            <Star size={14} fill="currentColor" />
            <span>{restaurant.rating}</span>
          </div>
        </div>
        <div className="card-body">
          <h3 className="card-title">{restaurant.name}</h3>
          <p className="card-description">{restaurant.description}</p>
          <div className="card-footer">
            <span className="card-category">{restaurant.category}</span>
            <span style={{ fontSize: 13, color: 'var(--accent-color)', fontWeight: 600 }}>
              View Menu &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
