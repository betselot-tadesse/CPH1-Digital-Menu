
import React, { useState } from 'react';
import { FoodItem, Category, Language, MultilingualString } from '../types';
import { translateWithGemini } from '../services/geminiService';

interface Props {
  item?: FoodItem;
  categories: Category[];
  onSave: (item: Partial<FoodItem>) => void;
  onCancel: () => void;
}

export const FoodForm: React.FC<Props> = ({ item, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<FoodItem>>(
    item || {
      name: { en: '', ar: '', ru: '', zh: '' },
      description: { en: '', ar: '', ru: '', zh: '' },
      price: 0,
      category: categories[0]?.id || '',
      imageUrl: '',
      isVegan: false,
      isVegetarian: false,
      isSpicy: false,
      isAvailable: true,
      isSpecialOffer: false,
    }
  );

  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);

  const handleAutoTranslate = async (field: 'name' | 'description') => {
    const text = formData[field]?.en;
    if (!text || text.trim().length < 2) return;
    
    // Don't re-translate if translations already exist unless manually forced (optional)
    // For this implementation, we translate whenever the English field loses focus
    
    if (field === 'name') setIsTranslatingName(true);
    else setIsTranslatingDesc(true);

    const translations = await translateWithGemini(text);
    if (translations) {
      setFormData((prev) => ({
        ...prev,
        [field]: translations,
      }));
    }
    
    if (field === 'name') setIsTranslatingName(false);
    else setIsTranslatingDesc(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-slate-200">
      <h2 className="text-3xl font-black mb-8 text-slate-800">
        {item ? 'Modify Dish' : 'Create New Dish'}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: General Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
              English Name <span className="text-[10px] text-blue-500 font-black ml-2 tracking-tighter">(Auto-Translates)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name?.en}
                onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, en: e.target.value } })}
                onBlur={() => handleAutoTranslate('name')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none pr-12"
                placeholder="e.g. Traditional Hummus"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                {isTranslatingName ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span title="Will translate automatically on focus out" className="text-slate-300">✨</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
              English Description <span className="text-[10px] text-blue-500 font-black ml-2 tracking-tighter">(Auto-Translates)</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.description?.en}
                onChange={(e) => setFormData({ ...formData, description: { ...formData.description!, en: e.target.value } })}
                onBlur={() => handleAutoTranslate('description')}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 pr-12"
                placeholder="Tell guests about this delicious dish..."
              />
              <div className="absolute right-4 top-4">
                 {isTranslatingDesc ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-slate-300">✨</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Price (AED)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 pt-4">
             <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={formData.isVegan} onChange={e => setFormData({...formData, isVegan: e.target.checked})} className="w-6 h-6 rounded-lg accent-green-600" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-green-600 transition-colors">Vegan Friendly</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={formData.isVegetarian} onChange={e => setFormData({...formData, isVegetarian: e.target.checked})} className="w-6 h-6 rounded-lg accent-emerald-600" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">Vegetarian</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={formData.isSpicy} onChange={e => setFormData({...formData, isSpicy: e.target.checked})} className="w-6 h-6 rounded-lg accent-red-600" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors">Spicy</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-6 h-6 rounded-lg accent-blue-600" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Active on Menu</span>
             </label>
             <label className="flex items-center gap-3 cursor-pointer group">
               <input type="checkbox" checked={formData.isSpecialOffer} onChange={e => setFormData({...formData, isSpecialOffer: e.target.checked})} className="w-6 h-6 rounded-lg accent-amber-500" />
               <span className="text-sm font-bold text-slate-700 group-hover:text-amber-500 transition-colors">Mark as Special Offer</span>
             </label>
          </div>
        </div>

        {/* Right Side: Image & Translations */}
        <div className="space-y-8">
           <div>
              <label className="block text-sm font-bold text-slate-600 mb-4 uppercase tracking-wide">Food Image (Preview)</label>
              <div className="group relative w-full h-80 rounded-[2rem] border-4 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                    <p className="text-slate-500 font-bold">Upload a high-quality photo</p>
                    <p className="text-slate-400 text-xs mt-1">Recommended: 1200 x 800px</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
           </div>

           <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest">Automatic Translations</h3>
                {(isTranslatingName || isTranslatingDesc) && (
                  <span className="text-[10px] font-bold text-blue-500 animate-pulse flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    Updating translations...
                  </span>
                )}
             </div>
             <div className="space-y-4">
               <div>
                 <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Arabic</span>
                 <input
                   dir="rtl"
                   type="text"
                   value={formData.name?.ar}
                   onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, ar: e.target.value } })}
                   className="w-full p-3 bg-white border border-slate-200 rounded-xl font-arabic mt-1 focus:ring-1 focus:ring-blue-400 outline-none"
                   placeholder={isTranslatingName ? "Translating..." : "Auto-generated"}
                 />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Russian</span>
                   <input
                     type="text"
                     value={formData.name?.ru}
                     onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, ru: e.target.value } })}
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl mt-1 focus:ring-1 focus:ring-blue-400 outline-none"
                     placeholder={isTranslatingName ? "..." : "Auto-generated"}
                   />
                 </div>
                 <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase ml-1">Chinese</span>
                   <input
                     type="text"
                     value={formData.name?.zh}
                     onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, zh: e.target.value } })}
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl mt-1 font-chinese focus:ring-1 focus:ring-blue-400 outline-none"
                     placeholder={isTranslatingName ? "..." : "Auto-generated"}
                   />
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
        <button 
          onClick={onCancel} 
          className="px-8 py-4 text-slate-500 hover:text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors order-2 sm:order-1"
        >
          Discard Changes
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-12 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] order-1 sm:order-2"
        >
          {item ? 'Save Updates' : 'Publish to Menu'}
        </button>
      </div>
    </div>
  );
};
