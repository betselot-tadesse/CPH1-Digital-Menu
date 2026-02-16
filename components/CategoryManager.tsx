
import React, { useState } from 'react';
import { Category, MultilingualString } from '../types';
import { translateWithGemini } from '../services/geminiService';
import { ConfirmationModal } from './ConfirmationModal';

interface Props {
  categories: Category[];
  onSave: (categories: Category[]) => void;
  onClose: () => void;
}

export const CategoryManager: React.FC<Props> = ({ categories, onSave, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MultilingualString>({ en: '', ar: '', ru: '', zh: '' });
  const [isTranslating, setIsTranslating] = useState(false);
  
  // State for deletion confirmation
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId('new');
    setFormData({ en: '', ar: '', ru: '', zh: '' });
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ ...cat.name });
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      onSave(categories.filter(c => c.id !== categoryToDelete));
      setCategoryToDelete(null);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.en || formData.en.trim().length < 2) return;
    setIsTranslating(true);
    const result = await translateWithGemini(formData.en);
    if (result) {
      setFormData(result);
    }
    setIsTranslating(false);
  };

  const handleSave = () => {
    if (!formData.en) return;
    
    let newCategories = [...categories];
    if (editingId === 'new') {
      newCategories.push({
        id: `cat-${Date.now()}`,
        name: formData
      });
    } else {
      newCategories = newCategories.map(c => c.id === editingId ? { ...c, name: formData } : c);
    }
    
    onSave(newCategories);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
      <ConfirmationModal
        isOpen={!!categoryToDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? Items in this category will remain but might need to be reassigned later."
        confirmLabel="Delete Category"
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isDanger={true}
      />

      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Manage Categories</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="p-6">
        {editingId ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                  English Name <span className="text-blue-500 font-bold ml-1 tracking-tighter">(Auto-Translates)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.en}
                    onChange={e => setFormData({ ...formData, en: e.target.value })}
                    onBlur={handleAutoTranslate}
                    className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    placeholder="Category name"
                  />
                  {isTranslating && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Arabic</label>
                <input
                  dir="rtl"
                  type="text"
                  value={formData.ar}
                  onChange={e => setFormData({ ...formData, ar: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-arabic"
                  placeholder={isTranslating ? "Translating..." : ""}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Russian</label>
                <input
                  type="text"
                  value={formData.ru}
                  onChange={e => setFormData({ ...formData, ru: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={isTranslating ? "..." : ""}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Chinese</label>
                <input
                  type="text"
                  value={formData.zh}
                  onChange={e => setFormData({ ...formData, zh: e.target.value })}
                  className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-chinese"
                  placeholder={isTranslating ? "..." : ""}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={() => setEditingId(null)} className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100">
                {editingId === 'new' ? 'Add Category' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 font-bold shadow-sm">
                    {cat.name.en.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{cat.name.en}</h3>
                    <p className="text-xs text-slate-400 font-medium">{cat.name.ar} • {cat.name.ru} • {cat.name.zh}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button
                    onClick={() => setCategoryToDelete(cat.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleAdd}
              className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all font-bold flex items-center justify-center gap-2"
            >
              <span>+</span> Add New Category
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
