import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, Compass, ArrowRight, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:5000/api';

const CUISINES = [
  'All',
  'Pizza',
  'Burgers',
  'Sandwiches',
  'North Indian',
  'South Indian',
  'Thalis',
  'Desserts',
  'Ice Creams',
  'Beverages'
];

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [featuredDishes, setFeaturedDishes] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [minRating, setMinRating] = useState(0);

  const { addToCart } = useContext(CartContext);

  // Fetch featured trending dishes across all kitchens on mount
  useEffect(() => {
    fetchFeatured();
  }, []);

  useEffect(() => {
    if (selectedCuisine === 'All') {
      fetchRestaurants();
    } else {
      fetchDishes();
    }
  }, [selectedCuisine, minRating]);

  // Autoplay for featured slider
  useEffect(() => {
    if (featuredDishes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredDishes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredDishes]);

  const fetchFeatured = async () => {
    try {
      const res = await axios.get(`${API_URL}/menu`);
      const items = res.data;
      const uniqueRestItems = [];
      const seenRests = new Set();
      
      // Pull one representative dish from each restaurant
      for (const item of items) {
        if (item.restaurant && !seenRests.has(item.restaurant._id)) {
          seenRests.add(item.restaurant._id);
          uniqueRestItems.push(item);
        }
      }
      setFeaturedDishes(uniqueRestItems.slice(0, 10)); // Max 10 trending items
    } catch (err) {
      console.error('Error loading featured slider:', err);
    }
  };

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      let query = `${API_URL}/restaurants?`;
      if (minRating > 0) {
        query += `rating=${minRating}&`;
      }
      if (search) {
        query += `search=${search}&`;
      }
      
      const res = await axios.get(query);
      setRestaurants(res.data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDishes = async () => {
    try {
      setLoading(true);
      let query = `${API_URL}/menu?category=${selectedCuisine}&`;
      if (search) {
        query += `search=${search}&`;
      }
      
      const res = await axios.get(query);
      setDishes(res.data);
    } catch (err) {
      console.error('Error fetching dishes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (selectedCuisine === 'All') {
      fetchRestaurants();
    } else {
      fetchDishes();
    }
  };

  const handleAddDishToCart = (dish) => {
    const res = addToCart(
      {
        _id: dish._id,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        isVeg: dish.isVeg
      },
      dish.restaurant?._id,
      dish.restaurant?.name
    );
    if (res.success) {
      toast.success(`Added ${dish.name} to cart!`);
    } else {
      toast.error(res.message || 'Failed to add item');
    }
  };

  return (
    <div className="pb-16">
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-r from-rose-500 to-brand-600 py-20 px-4 sm:px-6 lg:px-8 text-white text-center shadow-md overflow-hidden">
        {/* Floating Background Icons */}
        <div className="absolute top-8 left-10 text-4xl opacity-35 select-none pointer-events-none animate-float-slow">🍕</div>
        <div className="absolute bottom-6 left-16 text-5xl opacity-30 select-none pointer-events-none animate-float-medium">🍔</div>
        <div className="absolute top-10 right-12 text-4xl opacity-40 select-none pointer-events-none animate-float-fast">🍩</div>
        <div className="absolute bottom-8 right-16 text-5xl opacity-30 select-none pointer-events-none animate-float-slow">🥤</div>
        <div className="absolute top-1/2 left-8 text-3xl opacity-30 select-none pointer-events-none animate-float-medium">🌮</div>
        <div className="absolute top-1/3 right-8 text-3xl opacity-35 select-none pointer-events-none animate-float-fast">🍰</div>
        <div className="absolute bottom-20 left-1/3 text-4xl opacity-35 select-none pointer-events-none animate-float-fast">🍟</div>
        <div className="absolute top-4 left-1/2 text-3xl opacity-40 select-none pointer-events-none animate-float-slow">🍪</div>
        <div className="absolute bottom-16 right-1/3 text-4xl opacity-35 select-none pointer-events-none animate-float-medium">🍦</div>
        <div className="absolute top-20 left-1/4 text-4xl opacity-30 select-none pointer-events-none animate-float-slow">🌭</div>
        <div className="absolute bottom-12 right-1/4 text-3xl opacity-40 select-none pointer-events-none animate-float-fast">🍭</div>

        <div className="max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Delicious food, delivered to your doorstep
          </h1>
          <p className="mt-4 text-lg text-rose-100">
            Search from the best restaurants and dishes in town offering your favorite food.
          </p>
          
          {/* Search bar inside hero */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-xl mx-auto flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={selectedCuisine === 'All' ? "Search for restaurants..." : `Search for ${selectedCuisine} dishes...`}
                className="block w-full pl-12 pr-4 py-4 rounded-l-2xl text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm sm:text-base shadow-sm"
              />
            </div>
            <button 
              type="submit"
              className="bg-gray-950 hover:bg-gray-900 text-white font-bold px-6 py-4 rounded-r-2xl text-sm sm:text-base transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Cuisine categories bubble scroll */}
        <div className="mb-8">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center space-x-2">
            <Compass className="h-5 w-5 text-brand-500" />
            <span>Inspiration for your first order</span>
          </h2>
          <div className="mt-4 flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => {
                  setSelectedCuisine(cuisine);
                  setSearch('');
                }}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-155 ${
                  selectedCuisine === cuisine 
                    ? 'bg-brand-500 text-white shadow-sm ring-2 ring-brand-300' 
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Auto-Sliding Dishes Carousel Section */}
        {selectedCuisine === 'All' && featuredDishes.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl overflow-hidden shadow-lg border border-gray-700/30 p-6 sm:p-8 text-white relative group">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">
                Trending dishes from all restaurants
              </span>
              <span className="text-[10px] text-gray-400 font-bold bg-white/10 px-2.5 py-1 rounded-lg">
                Slide {currentSlide + 1} of {featuredDishes.length}
              </span>
            </div>

            {/* Slider container viewport */}
            <div className="relative h-64 sm:h-48 overflow-hidden">
              {featuredDishes.map((dish, idx) => (
                <div
                  key={dish._id}
                  className={`absolute inset-0 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-700 ease-in-out ${
                    idx === currentSlide 
                      ? 'opacity-100 translate-x-0 pointer-events-auto' 
                      : 'opacity-0 translate-x-16 pointer-events-none'
                  }`}
                >
                  {/* Left Side info */}
                  <div className="flex-grow space-y-2 min-w-0 z-10 w-full sm:w-1/2 text-left">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
                        dish.isVeg ? 'border-emerald-500' : 'border-red-500'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                      </div>
                      <span className="text-xs font-bold text-gray-300">
                        {dish.restaurant?.name || 'QuickBite Partner'}
                      </span>
                    </div>

                    <h4 className="text-xl sm:text-2xl font-extrabold truncate text-white">{dish.name}</h4>
                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>

                    <div className="flex items-center space-x-4 pt-3">
                      <span className="text-xl font-extrabold text-brand-400">₹{dish.price}</span>
                      <button
                        onClick={() => handleAddDishToCart(dish)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-sm transition-all"
                      >
                        ADD TO CART
                      </button>
                    </div>
                  </div>

                  {/* Right Side image */}
                  <div className="w-full sm:w-2/5 h-32 sm:h-full rounded-2xl overflow-hidden shadow-md flex-shrink-0 relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                    <Link 
                      to={`/restaurant/${dish.restaurant?._id}`}
                      className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white px-2.5 py-1 rounded-lg hover:bg-brand-500 transition-colors"
                    >
                      Visit Shop
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Arrow Controls */}
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredDishes.length) % featuredDishes.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              title="Previous Dish"
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredDishes.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              title="Next Dish"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        )}

        {/* Filters and sorting info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6">
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900">
              {selectedCuisine === 'All' 
                ? `${restaurants.length} ${restaurants.length === 1 ? 'Restaurant' : 'Restaurants'} near you`
                : `${dishes.length} ${dishes.length === 1 ? 'Dish' : 'Dishes'} in ${selectedCuisine}`
              }
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedCuisine === 'All' ? 'Showing active & verified kitchens' : `Showing direct menu items in ${selectedCuisine}`}
            </p>
          </div>
          
          {selectedCuisine === 'All' && (
            <div className="mt-4 sm:mt-0 flex items-center space-x-3 text-sm">
              <span className="font-semibold text-gray-600">Filter by Rating:</span>
              <div className="flex space-x-1.5 bg-white p-1 rounded-xl border border-gray-200">
                {[0, 3, 4].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMinRating(rate)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                      minRating === rate 
                        ? 'bg-brand-500 text-white' 
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {rate === 0 ? 'All' : `${rate}★+`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl overflow-hidden border border-gray-100 h-96">
                <div className="bg-gray-200 h-48 w-full" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : selectedCuisine === 'All' ? (
          // Render Restaurants Grid
          restaurants.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto mt-6">
              <Compass className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">No restaurants match your search</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try resetting your filters or searching for something else.
              </p>
              <button
                onClick={() => {
                  setSelectedCuisine('All');
                  setMinRating(0);
                  setSearch('');
                }}
                className="mt-6 inline-flex items-center space-x-2 text-sm font-semibold bg-brand-500 text-white px-4 py-2.5 rounded-xl hover:bg-brand-600"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {restaurants.map((restaurant) => (
                <Link 
                  key={restaurant._id} 
                  to={`/restaurant/${restaurant._id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full"
                >
                  <div className="relative overflow-hidden aspect-video bg-gray-100">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-sm">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-gray-900">
                        {restaurant.rating > 0 ? restaurant.rating.toFixed(1) : 'New'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="text-lg font-extrabold text-gray-900 group-hover:text-brand-500 transition-colors">
                      {restaurant.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {restaurant.cuisine.join(', ')}
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">{restaurant.deliveryRadius} km</span>
                        <span className="text-gray-400"> radius</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">{restaurant.timing?.open} - {restaurant.timing?.close}</span>
                      </div>
                    </div>
                    <div className="mt-auto pt-4 flex items-center text-sm font-bold text-brand-500 group-hover:translate-x-1 transition-transform duration-200">
                      <span>Order now</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : (
          // Render Dishes Grid
          dishes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-xl mx-auto mt-6">
              <Compass className="h-12 w-12 text-gray-300 mx-auto" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">No dishes match this category</h3>
              <p className="mt-2 text-sm text-gray-500">
                Try searching for something else or choosing another food group.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {dishes.map((dish) => (
                <div 
                  key={dish._id} 
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col h-full"
                >
                  <div className="relative overflow-hidden aspect-video bg-gray-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-xl flex items-center space-x-1 shadow-sm">
                      <div className={`w-3 h-3 border flex items-center justify-center rounded-sm ${
                        dish.isVeg ? 'border-emerald-600' : 'border-red-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                        }`} />
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 capitalize">
                        {dish.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className="text-base font-extrabold text-gray-900 truncate pr-2" title={dish.name}>
                        {dish.name}
                      </h4>
                      <span className="text-base font-extrabold text-brand-500 flex-shrink-0">₹{dish.price}</span>
                    </div>

                    <p className="text-xs text-gray-400 font-semibold mt-1">
                      From: <span className="text-gray-600 font-extrabold">{dish.restaurant?.name}</span>
                    </p>

                    <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2">
                      {dish.description}
                    </p>

                    <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                      <Link 
                        to={`/restaurant/${dish.restaurant?._id}`}
                        className="text-xs font-bold text-gray-400 hover:text-brand-500 flex items-center space-x-0.5"
                      >
                        <span>View Kitchen</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        onClick={() => handleAddDishToCart(dish)}
                        className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-xs py-2 px-5 rounded-xl shadow-sm transition-all"
                      >
                        ADD
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
