
import React, { useState } from 'react';
import { FoodItem, Category, MultilingualString } from '../types';
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

  const [isTranslating, setIsTranslating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'translating' | 'saving'>('idle');

  const handleBlurTranslate = async (field: 'name' | 'description') => {
    const text = formData[field]?.en;
    if (!text || text.trim().length < 2) return;
    
    // Only auto-translate if other fields are empty to avoid overwriting or redundant calls
    const isMissingTranslations = !formData[field]?.ar || !formData[field]?.ru || !formData[field]?.zh;
    if (!isMissingTranslations) return;

    setIsTranslating(true);
    const translations = await translateWithGemini(text);
    if (translations) {
      setFormData((prev) => ({
        ...prev,
        [field]: translations,
      }));
    }
    setIsTranslating(false);
  };

  const handleFinalSave = async () => {
    setSaveStatus('translating');
    
    let finalName = { ...formData.name! };
    let finalDesc = { ...formData.description! };

    // Check if we need to force translate Name
    if (!finalName.ar || !finalName.ru || !finalName.zh) {
      const nameTrans = await translateWithGemini(finalName.en);
      if (nameTrans) finalName = nameTrans;
    }

    // Check if we need to force translate Description
    if (finalDesc.en && (!finalDesc.ar || !finalDesc.ru || !finalDesc.zh)) {
      const descTrans = await translateWithGemini(finalDesc.en);
      if (descTrans) finalDesc = descTrans;
    }

    setSaveStatus('saving');
    onSave({
      ...formData,
      name: finalName,
      description: finalDesc
    });
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
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 relative overflow-hidden">
      {saveStatus !== 'idle' && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-black text-slate-800">
            {saveStatus === 'translating' ? 'AI is translating your dish...' : 'Saving to menu...'}
          </p>
          <p className="text-slate-500 mt-2">Crystal Plaza Al Qasimia Management</p>
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <h2 className="text-3xl font-black text-slate-800">
          {item ? 'Modify Dish' : 'New Menu Item'}
        </h2>
        <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-600 font-bold text-xs uppercase tracking-widest">
          English-First Input
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">English Name</label>
            <input
              type="text"
              value={formData.name?.en}
              onChange={(e) => setFormData({ ...formData, name: { ...formData.name!, en: e.target.value } })}
              onBlur={() => handleBlurTranslate('name')}
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
              placeholder="e.g. Grilled Salmon"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">English Description</label>
            <textarea
              value={formData.description?.en}
              onChange={(e) => setFormData({ ...formData, description: { ...formData.description!, en: e.target.value } })}
              onBlur={() => handleBlurTranslate('description')}
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none h-32 italic"
              placeholder="Describe the dish in English..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Price (AED)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold"
              >
                {categories.map(c => <option key={c.id} value={c.id}>{c.name.en}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
             {[
               { id: 'isVegan', label: 'Vegan Friendly', color: 'accent-green-600' },
               { id: 'isSpicy', label: 'Spicy / Chili', color: 'accent-red-600' },
               { id: 'isSpecialOffer', label: 'Special Offer', color: 'accent-amber-500' },
               { id: 'isAvailable', label: 'Show on Menu', color: 'accent-blue-600' },
             ].map(opt => (
               <label key={opt.id} className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                 <input 
                   type="checkbox" 
                   checked={(formData as any)[opt.id]} 
                   onChange={e => setFormData({...formData, [opt.id]: e.target.checked})} 
                   className={`w-5 h-5 rounded ${opt.color}`} 
                 />
                 <span className="text-sm font-bold text-slate-700">{opt.label}</span>
               </label>
             ))}
          </div>
        </div>

        <div className="space-y-8">
           <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Dish Image</label>
              <div className="group relative w-full h-80 rounded-[2rem] border-4 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 transition-all cursor-pointer">
                {formData.imageUrl ? (
                  <>
                    <img src={formData.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-bold border border-white/50 px-6 py-2 rounded-full backdrop-blur-sm">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    <p className="font-bold">Upload Photo</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              </div>
           </div>

           <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs uppercase font-black text-slate-400 tracking-widest">Translation Preview</h3>
                {isTranslating && (
                  <div className="flex items-center gap-2 text-blue-500">
                    <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-bold">Updating...</span>
                  </div>
                )}
             </div>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇦🇪</span>
                  <div className="flex-1 text-right font-arabic font-bold text-slate-700 truncate">{formData.name?.ar || '...'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇷🇺</span>
                  <div className="flex-1 text-slate-700 font-bold truncate">{formData.name?.ru || '...'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🇨🇳</span>
                  <div className="flex-1 font-chinese font-bold text-slate-700 truncate">{formData.name?.zh || '...'}</div>
                </div>
             </div>
             <p className="text-[10px] text-slate-300 mt-6 text-center uppercase font-bold tracking-tighter">Translations are managed by Crystal Plaza AI</p>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12 pt-8 border-t border-slate-100">
        <button onClick={onCancel} className="px-8 py-4 text-slate-400 hover:text-slate-600 font-bold">Discard</button>
        <button
          onClick={handleFinalSave}
          disabled={!formData.name?.en}
          className="px-12 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {item ? 'Save & Update' : 'Publish Menu Item'}
        </button>
      </div>
    </div>
  );
};
