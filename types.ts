
export type Language = 'en' | 'ar' | 'ru' | 'zh';

export interface MultilingualString {
  en: string;
  ar: string;
  ru: string;
  zh: string;
}

export interface FoodItem {
  id: string;
  name: MultilingualString;
  description: MultilingualString;
  price: number;
  category: string;
  imageUrl: string;
  isVegan: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: MultilingualString;
}

export interface MenuData {
  categories: Category[];
  items: FoodItem[];
}
