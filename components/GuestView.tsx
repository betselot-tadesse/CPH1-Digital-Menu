
import React, { useState, useMemo } from 'react';
import { MenuData, Language, FoodItem } from '../types';
import { LANGUAGES } from '../constants';
import { LanguageToggle } from './LanguageToggle';

interface Props {
  data: MenuData;
}

export const GuestView: React.FC<Props> = ({ data }) => {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeCategory, setActiveCategory] = useState<string>(data.categories[0]?.id || 'all');

  const langConfig = useMemo(() => LANGUAGES.find(l => l.code === currentLang)!, [currentLang]);
  const isRtl = langConfig.dir === 'rtl';

  const filteredItems = useMemo(() => {
    return data.items.filter(i => i.isAvailable && (activeCategory === 'all' || i.category === activeCategory));
  }, [data.items, activeCategory]);

  const labels = {
    en: { vegan: 'Vegan', veg: 'Vegetarian', spicy: 'Spicy', price: 'AED', menu: 'Menu', subtitle: 'Crystal Plaza Al Qasimia' },
    ar: { vegan: 'نباتي صرف', veg: 'نباتي', spicy: 'حار', price: 'درهم', menu: 'القائمة', subtitle: 'كريستال بلازا القاسمية' },
    ru: { vegan: 'Веган', veg: 'Вегетарианское', spicy: 'Острое', price: 'AED', menu: 'Меню', subtitle: 'Crystal Plaza Al Qasimia' },
    zh: { vegan: '纯素', veg: '素食', spicy: '辣', price: 'AED', menu: '菜单', subtitle: 'Crystal Plaza Al Qasimia' }
  }[currentLang];

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${isRtl ? 'font-arabic' : currentLang === 'zh' ? 'font-chinese' : ''}`} dir={langConfig.dir}>
      {/* Hero Header */}
      <header className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1200"
          className="w-full h-full object-cover"
          alt="Crystal Plaza Al Qasimia"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">{labels.menu}</h1>
          <p className="text-slate-200 mt-2 md:text-2xl font-medium opacity-90">{labels.subtitle}</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto -mt-12 relative px-4">
        {/* Language Selection Bar */}
        <div className="mb-8">
          <LanguageToggle currentLang={currentLang} onLanguageChange={setCurrentLang} />
        </div>

        {/* Category Navbar - Sticky */}
        <div className="sticky top-4 z-40 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-2 mb-10 overflow-x-auto flex gap-2 scrollbar-hide">
          {data.categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-xl whitespace-nowrap font-bold transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat.name[currentLang]}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 gap-10">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col md:flex-row hover:shadow-2xl transition-all duration-500 group"
            >
              {/* Massive Image Section */}
              <div className="w-full md:w-2/5 lg:w-1/2 h-72 md:h-auto relative overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name[currentLang]} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                   {item.isVegan && (
                    <span className="bg-green-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {labels.vegan}
                    </span>
                  )}
                  {item.isSpicy && (
                    <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      🌶️ {labels.spicy}
                    </span>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {item.name[currentLang]}
                  </h3>
                  <div className="bg-blue-50 px-4 py-2 rounded-2xl">
                    <span className="text-xl md:text-2xl font-black text-blue-600 whitespace-nowrap">
                      {item.price} <span className="text-xs font-bold uppercase opacity-60 ml-1">{labels.price}</span>
                    </span>
                  </div>
                </div>
                
                <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-6 italic opacity-80">
                  {item.description[currentLang]}
                </p>

                <div className={`flex items-center gap-4 mt-auto pt-6 border-t border-slate-50 ${isRtl ? 'flex-row-reverse' : ''}`}>
                   <div className="flex -space-x-2">
                     {item.isVegetarian && !item.isVegan && (
                        <div title={labels.veg} className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600 shadow-sm">
                          🥗
                        </div>
                     )}
                     {item.isVegan && (
                        <div title={labels.vegan} className="w-10 h-10 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 shadow-sm">
                          🌿
                        </div>
                     )}
                   </div>
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Freshly Prepared
                   </span>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-xl font-medium">Our chefs are preparing something new.</p>
              <p className="text-slate-300 mt-2">Please check another category.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-20 text-center text-slate-400 text-sm pb-10">
        <div className="flex justify-center gap-6 mb-4 opacity-50">
          <span>WiFi Available</span>
          <span>•</span>
          <span>Open 24/7</span>
          <span>•</span>
          <span>Room Service</span>
        </div>
        &copy; {new Date().getFullYear()} Crystal Plaza Al Qasimia. All rights reserved.
      </footer>
    </div>
  );
};
