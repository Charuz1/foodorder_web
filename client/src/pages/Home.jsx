import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';
import { Search } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All', icon: '🍽️' },
  { id: 'Italian', name: 'Italian', icon: '🍕' },
  { id: 'Asian', name: 'Asian', icon: '🥢' },
  { id: 'American', name: 'American', icon: '🍔' },
  { id: 'Japanese', name: 'Japanese', icon: '🍣' }
];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRestaurants();
    fetchFoods();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await fetch('/api/foods');
      if (response.ok) {
        const data = await response.json();
        setFoods(data);
      }
    } catch (err) {
      console.error('Error fetching foods:', err);
    }
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesCategory = selectedCategory === 'all' || r.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
                          r.name.toLowerCase().includes(query) || 
                          r.description.toLowerCase().includes(query) ||
                          r.category.toLowerCase().includes(query) ||
                          foods.some(f => f.restaurantId === r.id && (
                            f.title.toLowerCase().includes(query) ||
                            f.description.toLowerCase().includes(query)
                          ));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero Banner Section */}
      <section className="hero-section glass-card">
        <div className="hero-content">
          <h1 className="hero-title">
            Fast. Fresh.<br />
            <span>Delivered.</span>
          </h1>
          <p className="hero-subtitle">
            Order food from your favorite restaurants and get it delivered directly to your doorstep in minutes.
          </p>
          
          <div className="search-container">
            <Search size={20} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search restaurants, cuisines, dishes..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
            alt="Delicious Meal Banner" 
            className="hero-img"
          />
        </div>
      </section>

      {/* Categories slider */}
      <section className="category-container">
        <h2 className="section-title" style={{ marginBottom: 20 }}>In the Mood For?</h2>
        <div className="categories-grid">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className={`category-card glass-card ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-name">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Restaurants List */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Popular Restaurants</h2>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            Showing {filteredRestaurants.length} restaurants
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            Loading deliciousness...
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            No restaurants found matching your criteria.
          </div>
        ) : (
          <div className="restaurants-grid">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
