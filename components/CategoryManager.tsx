
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
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId('new');
    setFormData({ en: '', ar: '', ru: '', zh: '' });
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormData({ ...cat.name });
  };

  const handleSave = async () => {
    if (!formData.en) return;
    
    setIsTranslating(true);
    let finalTranslations = { ...formData };
    
    // Always ensure we have translations before saving
    if (!finalTranslations.ar || !finalTranslations.ru || !finalTranslations.zh) {
      const result = await translateWithGemini(formData.en);
      if (result) finalTranslations = result;
    }

    let newCategories = [...categories];
    if (editingId === 'new') {
      newCategories.push({
        id: `cat-${Date.now()}`,
        name: finalTranslations
      });
    } else {
      newCategories = newCategories.map(c => c.id === editingId ? { ...c, name: finalTranslations } : c);
    }
    
    onSave(newCategories);
    setEditingId(null);
    setIsTranslating(false);
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200 overflow-hidden relative">
      {isTranslating && (
        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <span className="font-bold text-slate-800">Translating...</span>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!categoryToDelete}
        title="Remove Category?"
        message="This will remove the category. Items in this category will stay but won't belong to any group."
        onConfirm={() => { onSave(categories.filter(c => c.id !== categoryToDelete)); setCategoryToDelete(null); }}
        onCancel={() => setCategoryToDelete(null)}
      />

      <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-2xl font-black text-slate-800">Manage Menu Sections</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div className="p-8">
        {editingId ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">English Category Name</label>
              <input
                type="text"
                autoFocus
                value={formData.en}
                onChange={e => setFormData({ ...formData, en: e.target.value })}
                className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xl font-bold"
                placeholder="e.g. Breakfast, Seafood..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button onClick={() => setEditingId(null)} className="px-6 py-3 text-slate-400 font-bold">Cancel</button>
              <button onClick={handleSave} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-100">
                Save Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-slate-800">{cat.name.en}</span>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                    <span>{cat.name.ar}</span>•<span>{cat.name.ru}</span>•<span>{cat.name.zh}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-blue-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button onClick={() => setCategoryToDelete(cat.id)} className="p-2 text-slate-400 hover:text-red-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={handleAdd}
              className="w-full p-5 border-4 border-dashed border-slate-100 rounded-2xl text-slate-300 hover:text-blue-500 hover:border-blue-100 hover:bg-blue-50 transition-all font-black text-center"
            >
              + Add New Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
