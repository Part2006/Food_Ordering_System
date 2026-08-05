import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

const MenuManager = () => {
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRestaurantAndMenu();
  }, []);

  const fetchRestaurantAndMenu = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/restaurants/my-restaurant`);
      setRestaurant(res.data.restaurant);
      setMenu(res.data.menu);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddForm = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setName('');
    setPrice('');
    setCategory('Mains');
    setImage('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80');
    setIsVeg(true);
    setIsAvailable(true);
    setDescription('');
  };

  const handleOpenEditForm = (item) => {
    setIsEditing(true);
    setCurrentItemId(item._id);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image);
    setIsVeg(item.isVeg);
    setIsAvailable(item.isAvailable);
    setDescription(item.description || '');
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name || !price || !image) {
      toast.error('Please enter name, price, and image URL');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        restaurant: restaurant._id,
        name,
        price: parseFloat(price),
        category,
        image,
        isVeg,
        isAvailable,
        description
      };

      if (isEditing) {
        const res = await axios.put(`${API_URL}/menu/${currentItemId}`, payload);
        setMenu(prev => prev.map(item => item._id === currentItemId ? res.data : item));
        toast.success('Dish updated successfully!');
      } else {
        const res = await axios.post(`${API_URL}/menu`, payload);
        setMenu(prev => [...prev, res.data]);
        toast.success('Dish added to menu!');
      }
      
      // Reset forms
      handleOpenAddForm();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from the menu?')) return;

    try {
      await axios.delete(`${API_URL}/menu/${itemId}`);
      setMenu(prev => prev.filter(item => item._id !== itemId));
      toast.success('Item deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const updatedVal = !item.isAvailable;
      const res = await axios.put(`${API_URL}/menu/${item._id}`, { isAvailable: updatedVal });
      setMenu(prev => prev.map(m => m._id === item._id ? res.data : m));
      toast.success(`${item.name} availability updated`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle availability');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="h-48 bg-gray-250 rounded-3xl" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-16">
        <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900 mt-4">Profile required</h2>
        <p className="text-sm text-gray-400 mt-1">Please configure your restaurant dashboard profile first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Manage Menu Card</h1>
          <p className="text-sm text-gray-500 mt-1">List dishes, configure prices, categories and availability status.</p>
        </div>

        <span className="text-xs font-semibold text-gray-400">
          Total items listed: <span className="text-gray-900 font-extrabold">{menu.length}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Panel (Add / Edit) */}
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-50 pb-4 mb-6">
            {isEditing ? 'Modify Menu Item' : 'Add New Dish'}
          </h2>

          <form onSubmit={handleSaveItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">DISH NAME</label>
              <input
                type="text"
                required
                placeholder="e.g. Garlic Cheese Bread"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">PRICE (INR)</label>
                <input
                  type="number"
                  required
                  placeholder="₹"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold bg-white"
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Desserts">Desserts</option>
                  <option value="Beverages">Beverages</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">IMAGE URL</label>
              <input
                type="text"
                required
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5">DESCRIPTION</label>
              <textarea
                placeholder="Details about ingredients, serving size..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-semibold h-20"
              />
            </div>

            {/* Checkbox settings */}
            <div className="flex justify-between items-center bg-gray-50 p-3.5 rounded-2xl border border-gray-150">
              <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVeg}
                  onChange={(e) => setIsVeg(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 border-gray-300"
                />
                <span>Is Vegetarian</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="rounded text-brand-500 focus:ring-brand-500 h-4.5 w-4.5 border-gray-300"
                />
                <span>Available</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="py-3 text-gray-500 border border-gray-250 rounded-xl hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={saving}
                className={`py-3 rounded-xl text-white shadow-sm ${
                  isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-brand-500 hover:bg-brand-600'
                } col-span-1 flex items-center justify-center`}
              >
                {saving ? 'Saving...' : isEditing ? 'Update Dish' : 'Add Dish'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Menu Table / Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">
              Listed Dishes
            </h2>

            {menu.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                No items added to your menu card yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menu.map((item) => (
                  <div 
                    key={item._id}
                    className={`border border-gray-100 rounded-2xl p-4 flex gap-4 transition-all relative ${
                      !item.isAvailable ? 'bg-gray-50/70 border-dashed opacity-75' : 'bg-white'
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item info */}
                    <div className="flex-grow min-w-0 pr-4">
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm ${
                          item.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}>
                          <div className={`w-1 h-1 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`} />
                        </div>
                        <span className="text-[9px] text-gray-400 font-extrabold">{item.category}</span>
                      </div>
                      
                      <h3 className="font-extrabold text-sm text-gray-900 mt-1 truncate">{item.name}</h3>
                      <p className="font-bold text-xs text-gray-800 mt-0.5">₹{item.price}</p>
                      
                      {/* Description */}
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">
                        {item.description || 'No description added'}
                      </p>
                    </div>

                    {/* Quick actions top corner */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <button
                        onClick={() => handleOpenEditForm(item)}
                        className="p-1.5 text-gray-400 hover:text-amber-500 rounded-lg hover:bg-gray-50"
                        title="Edit Item"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-50"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Availability toggle bottom corner */}
                    <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-[10px]">
                      <span className="text-gray-400">Available:</span>
                      <button 
                        onClick={() => handleToggleAvailability(item)}
                        className="text-brand-500 focus:outline-none"
                      >
                        {item.isAvailable ? <ToggleRight className="h-6.5 w-6.5" /> : <ToggleLeft className="h-6.5 w-6.5 text-gray-300" />}
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default MenuManager;
