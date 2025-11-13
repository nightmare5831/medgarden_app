export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  thumbnail: string;
  category: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  shipping: {
    free: boolean;
    days: number;
  };
  // Phase 4: 3D Viewer support
  model3dUrl?: string;
  model3dType?: 'glb' | 'obj' | 'stl';
  videos?: string[];
  // Owner information
  ownerId?: string;
  ownerName?: string;
  ownerRole?: string;
}

export const categories = [
  { id: 'fashion', name: 'Moda', icon: '👗' },
  { id: 'beauty', name: 'Beleza', icon: '💄' },
  { id: 'home', name: 'Casa', icon: '🏠' },
  { id: 'sports', name: 'Esporte', icon: '⚽' },
  { id: 'tech', name: 'Tech', icon: '📱' },
  { id: 'food', name: 'Food', icon: '🍔' },
];
