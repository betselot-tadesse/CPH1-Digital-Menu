
import React, { useState, useMemo } from 'react';
import { MenuData, FoodItem, Category } from '../types';
import { FoodForm } from './FoodForm';
import { CategoryManager } from './CategoryManager';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  data: MenuData;
  onUpdate: (data: MenuData) => void;
  onLogout: () => void;
}

type AvailabilityFilter = 'all' | 'available' | 'hidden';
type SortOrder = 'none' | 'asc' | 'desc';

export const AdminView: React.FC<Props> = ({ data, onUpdate, onLogout }) => {
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');
  
  // State for deletion confirmation
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (itemToDelete) {
      onUpdate({
        ...data,
        items: data.items.filter(i => i.id !== itemToDelete)
      });
      setItemToDelete(null);
    }
  };

  const handleSaveItem = (item: Partial<FoodItem>) => {
    let newItems = [...data.items];
    if (editingItem) {
      newItems = newItems.map(i => i.id === editingItem.id ? { ...i, ...item } as FoodItem : i);
    } else {
      const newItem = {
        ...item,
        id: `item-${Date.now()}`
      } as FoodItem;
      newItems.push(newItem);
    }
    onUpdate({ ...data, items: newItems });
    setEditingItem(null);
    setIsAdding(false);
  };

  const handleUpdateCategories = (newCategories: Category[]) => {
    onUpdate({
      ...data,
      categories: newCategories
    });
  };

  const processedItems = useMemo(() => {
    let filtered = data.items.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      const term = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        item.name.en.toLowerCase().includes(term) ||
        item.name.ar.toLowerCase().includes(term) ||
        item.name.ru.toLowerCase().includes(term) ||
        item.name.zh.toLowerCase().includes(term);

      const matchesAvailability = 
        availabilityFilter === 'all' || 
        (availabilityFilter === 'available' && item.isAvailable) ||
        (availabilityFilter === 'hidden' && !item.isAvailable);

      return matchesCategory && matchesSearch && matchesAvailability;
    });

    // Handle Sorting
    if (sortOrder === 'none') {
      // DEFAULT SORT: Prioritize Special Offers at the top
      // Modern browsers use stable sort, so original order is preserved within groups
      filtered.sort((a, b) => {
        if (a.isSpecialOffer === b.isSpecialOffer) return 0;
        return a.isSpecialOffer ? -1 : 1;
      });
    } else {
      // Alphabetical Sorts
      filtered.sort((a, b) => {
        const nameA = a.name.en.toLowerCase();
        const nameB = b.name.en.toLowerCase();
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    }

    return filtered;
  }, [data.items, activeCategory, searchTerm, availabilityFilter, sortOrder]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <ConfirmationModal
        isOpen={!!itemToDelete}
        title="Delete Item?"
        message="Are you sure you want to remove this dish from the menu? This action cannot be undone."
        confirmLabel="Delete Dish"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
        isDanger={true}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Management Dashboard</h1>
          <p className="text-slate-500 mt-1">Crystal Plaza Al Qasimia Digital Menu</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 px-4 py-2 font-medium transition-colors"
          >
            Logout
          </button>
          {!isAdding && !editingItem && !isManagingCategories && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsManagingCategories(true)}
                className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-xl hover:bg-slate-50 transition-all font-bold"
              >
                Edit Categories
              </button>
              <button
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 font-bold"
              >
                <span>+</span> Add Dish
              </button>
            </div>
          )}
        </div>
      </div>

      {isManagingCategories ? (
        <CategoryManager
          categories={data.categories}
          onSave={handleUpdateCategories}
          onClose={() => setIsManagingCategories(false)}
        />
      ) : (isAdding || editingItem) ? (
        <FoodForm
          item={editingItem || undefined}
          categories={data.categories}
          onSave={handleSaveItem}
          onCancel={() => { setEditingItem(null); setIsAdding(false); }}
        />
      ) : (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search dishes..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.25rem] shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">
            {/* Category Filter */}
            <div className="flex flex-col gap-2 w-full lg:w-auto">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Categories</span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide lg:pb-0">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors font-bold text-sm ${activeCategory === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                >
                  All Categories
                </button>
                {data.categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors font-bold text-sm ${activeCategory === cat.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                  >
                    {cat.name.en}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 items-end">
              {/* Status Filter */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</span>
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
                  {(['all', 'available', 'hidden'] as AvailabilityFilter[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => setAvailabilityFilter(status)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                        availabilityFilter === status
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alphabetical Sort */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sort Preference</span>
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl">
                  <button
                    onClick={() => setSortOrder('none')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      sortOrder === 'none'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    title="Specials first, then default order"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setSortOrder('asc')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      sortOrder === 'asc'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => setSortOrder('desc')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                      sortOrder === 'desc'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Z-A
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processedItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col">
                <div className="h-64 overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.name.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {item.isSpecialOffer && <span className="bg-amber-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full shadow-md">SPECIAL</span>}
                    {item.isVegan && <span className="bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">VEGAN</span>}
                    {!item.isAvailable && <span className="bg-slate-900/90 text-white text-[10px] font-bold px-3 py-1 rounded-full">HIDDEN</span>}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-slate-800">{item.name.en}</h3>
                    <span className="font-black text-blue-600">AED {item.price}</span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-6">{item.description.en}</p>
                  <div className="flex gap-3 border-t pt-6">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="flex-1 py-3 text-sm font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-colors"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => setItemToDelete(item.id)}
                      className="flex-1 py-3 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {processedItems.length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <p className="text-slate-400 font-bold text-lg">No items match your filters</p>
                <button 
                  onClick={() => {setSearchTerm(''); setActiveCategory('all'); setAvailabilityFilter('all'); setSortOrder('none');}} 
                  className="text-blue-600 font-bold mt-2 hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
