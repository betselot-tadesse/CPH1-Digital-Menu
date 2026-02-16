
import React, { useState } from 'react';
import { MenuData, FoodItem, Category } from '../types';
import { FoodForm } from './FoodForm';

interface Props {
  data: MenuData;
  onUpdate: (data: MenuData) => void;
  onLogout: () => void;
}

export const AdminView: React.FC<Props> = ({ data, onUpdate, onLogout }) => {
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onUpdate({
        ...data,
        items: data.items.filter(i => i.id !== id)
      });
    }
  };

  const handleSave = (item: Partial<FoodItem>) => {
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

  const filteredItems = activeCategory === 'all'
    ? data.items
    : data.items.filter(i => i.category === activeCategory);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
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
          {!isAdding && !editingItem && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2 font-bold"
            >
              <span>+</span> Add Dish
            </button>
          )}
        </div>
      </div>

      {(isAdding || editingItem) ? (
        <FoodForm
          item={editingItem || undefined}
          categories={data.categories}
          onSave={handleSave}
          onCancel={() => { setEditingItem(null); setIsAdding(false); }}
        />
      ) : (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
            >
              All Items
            </button>
            {data.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeCategory === cat.id ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border'}`}
              >
                {cat.name.en}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group flex flex-col">
                <div className="h-64 overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.name.en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-2">
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
                      onClick={() => handleDelete(item.id)}
                      className="flex-1 py-3 text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-24 text-center bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">This category is currently empty.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
