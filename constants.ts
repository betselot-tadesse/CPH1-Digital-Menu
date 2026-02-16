
import { MenuData, Language } from './types';

export const LANGUAGES: { code: Language; name: string; label: string; flag: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', label: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', label: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'ru', name: 'Russian', label: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', label: '中文', flag: '🇨🇳', dir: 'ltr' }
];

export const INITIAL_DATA: MenuData = {
  categories: [
    { id: 'cat-1', name: { en: 'Appetizers', ar: 'مقبلات', ru: 'Закуски', zh: '小吃' } },
    { id: 'cat-2', name: { en: 'Main Course', ar: 'الطباق الرئيسية', ru: 'Основное блюдо', zh: '主食' } },
    { id: 'cat-3', name: { en: 'Desserts', ar: 'حلويات', ru: 'Десерты', zh: '甜点' } },
    { id: 'cat-4', name: { en: 'Drinks', ar: 'مشروبات', ru: 'Напитки', zh: '饮料' } }
  ],
  items: [
    {
      id: 'item-1',
      name: { en: 'Hummus with Pita', ar: 'حمص مع خبز بيتا', ru: 'Хумус с питой', zh: '鹰嘴豆泥配皮塔饼' },
      description: { en: 'Classic middle eastern chickpeas dip served with fresh pita.', ar: 'غمس الحمص الشرق أوسطي الكلاسيكي يقدم مع خبز بيتا الطازج.', ru: 'Классический ближневосточный соус из нута, подается со свежей питой.', zh: '经典的中东鹰嘴豆泥，搭配新鲜的皮塔饼。' },
      price: 15,
      category: 'cat-1',
      imageUrl: 'https://images.unsplash.com/photo-1577906030551-5b91627210e7?auto=format&fit=crop&q=80&w=800',
      isVegan: true,
      isVegetarian: true,
      isSpicy: false,
      isAvailable: true,
      isSpecialOffer: false
    },
    {
      id: 'item-2',
      name: { en: 'Mixed Grill', ar: 'مشاوي مشكلة', ru: 'Ассорти на гриле', zh: '混合烧烤' },
      description: { en: 'A selection of marinated lamb and chicken grilled to perfection.', ar: 'مجموعة مختارة من لحم الغنم والدجاج المتبل المشوي بإتقان.', ru: 'Ассорти из маринованной баранины и курицы, приготовленное на гриле.', zh: '精选腌制羊肉和鸡肉，烤至完美。' },
      price: 45,
      category: 'cat-2',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      isVegan: false,
      isVegetarian: false,
      isSpicy: true,
      isAvailable: true,
      isSpecialOffer: true
    }
  ]
};
