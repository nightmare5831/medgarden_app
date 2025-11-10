import { create } from 'zustand';
import { filterTree, type FilterConfig } from '../data/filterConfig';
import type { Product } from '../data/products';
import type { Review } from '../data/reviews';
import type { Notification } from '../data/notifications';
import { productApi, authApi, type User } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CatalogMode = 'browse' | 'detail';

interface AppState {
  // Auth State
  currentUser: User | null;
  authToken: string | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;

  // App State
  products: Product[];
  reviews: Review[];
  notifications: Notification[];
  followedUsers: string[];
  likedReviews: string[];
  savedProducts: string[];
  isLoading: boolean;
  error: string | null;

  // Catalog State
  catalogMode: CatalogMode;
  currentProductIndex: number;
  selectedFilters: string[];
  currentFilterSet: FilterConfig[];
  filteredProducts: Product[];
  selectedMediaIndex: number;

  // Auth Actions
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string, phone?: string, role?: 'buyer' | 'seller') => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;

  // Actions
  toggleFollow: (userId: string) => void;
  toggleLike: (reviewId: string) => void;
  toggleSave: (productId: string) => void;
  loadProducts: () => Promise<void>;

  // Catalog Actions
  setCatalogMode: (mode: CatalogMode) => void;
  nextProduct: () => void;
  previousProduct: () => void;
  selectFilter: (filterId: string) => void;
  goBackFilter: () => void;
  resetFilters: () => void;
  setSelectedMediaIndex: (index: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth initial state
  currentUser: null,
  authToken: null,
  isAuthLoading: false,
  isAuthenticated: false,

  // App initial state
  products: [],
  reviews: [],
  notifications: [],
  followedUsers: [],
  likedReviews: [],
  savedProducts: [],
  isLoading: true,
  error: null,

  // Catalog initial state
  catalogMode: 'browse',
  currentProductIndex: 0,
  selectedFilters: [],
  currentFilterSet: filterTree.root,
  filteredProducts: [],
  selectedMediaIndex: 0,

  // Auth actions
  login: async (email, password, remember = false) => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await authApi.login(email, password);

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.token);
      if (remember) {
        await AsyncStorage.setItem('rememberMe', 'true');
      }

      set({
        currentUser: response.user,
        authToken: response.token,
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch (error: any) {
      set({ isAuthLoading: false, error: error.message });
      throw error;
    }
  },

  register: async (name, email, password, passwordConfirmation, phone, role = 'buyer') => {
    set({ isAuthLoading: true, error: null });
    try {
      const response = await authApi.register(name, email, password, passwordConfirmation, phone, role);

      // Store token in AsyncStorage
      await AsyncStorage.setItem('authToken', response.token);

      set({
        currentUser: response.user,
        authToken: response.token,
        isAuthenticated: true,
        isAuthLoading: false,
      });
    } catch (error: any) {
      set({ isAuthLoading: false, error: error.message });
      throw error;
    }
  },

  logout: async () => {
    const { authToken } = get();
    try {
      if (authToken) {
        await authApi.logout(authToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear auth state and storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('rememberMe');

      set({
        currentUser: null,
        authToken: null,
        isAuthenticated: false,
      });
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');

      if (token) {
        // Verify token and get user
        const user = await authApi.getMe(token);
        set({
          currentUser: user,
          authToken: token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      // Token invalid or expired, clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('rememberMe');
      set({
        currentUser: null,
        authToken: null,
        isAuthenticated: false,
      });
    }
  },

  // Load products from API - PRODUCTION DATA ONLY
  loadProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const products = await productApi.getAll();

      // Add mock categories and limit images (backend provides 3D model)
      const categories = ['male', 'female', 'graduation', 'wedding'];
      const subcategories: Record<string, string[]> = {
        male: ['rings', 'necklaces', 'bracelets', 'earrings', 'watches', 'chains'],
        female: ['rings', 'necklaces', 'bracelets', 'earrings', 'anklets', 'pendants'],
        graduation: ['rings', 'medals', 'pins', 'cufflinks', 'pendants', 'sets'],
        wedding: ['rings', 'sets', 'tiaras', 'bracelets', 'earrings', 'necklaces'],
      };

      const productsWithMedia = products.map((p, idx) => {
        const category = categories[idx % categories.length];
        const subcat = subcategories[category][idx % subcategories[category].length];

        return {
          ...p,
          category,
          subcategory: subcat,
          images: p.images.slice(0, 3),
          videos: p.videos?.length > 0 ? p.videos : ['https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'],
        };
      });

      set({
        products: productsWithMedia,
        filteredProducts: productsWithMedia,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: 'Failed to load products. Please check your connection.'
      });
    }
  },

  toggleFollow: (userId) =>
    set((state) => ({
      followedUsers: state.followedUsers.includes(userId)
        ? state.followedUsers.filter((id) => id !== userId)
        : [...state.followedUsers, userId],
    })),

  toggleLike: (reviewId) =>
    set((state) => ({
      likedReviews: state.likedReviews.includes(reviewId)
        ? state.likedReviews.filter((id) => id !== reviewId)
        : [...state.likedReviews, reviewId],
    })),

  toggleSave: (productId) =>
    set((state) => ({
      savedProducts: state.savedProducts.includes(productId)
        ? state.savedProducts.filter((id) => id !== productId)
        : [...state.savedProducts, productId],
    })),

  // Catalog actions
  setCatalogMode: (mode) => set({ catalogMode: mode }),

  nextProduct: () =>
    set((state) => ({
      currentProductIndex:
        state.currentProductIndex < state.filteredProducts.length - 1
          ? state.currentProductIndex + 1
          : state.currentProductIndex,
    })),

  previousProduct: () =>
    set((state) => ({
      currentProductIndex:
        state.currentProductIndex > 0
          ? state.currentProductIndex - 1
          : state.currentProductIndex,
    })),

  selectFilter: (filterId) =>
    set((state) => {
      // Check if this filter has sub-filters (parent category)
      const hasSubFilters = filterTree[filterId] && filterTree[filterId].length > 0;

      if (hasSubFilters) {
        // Parent category: Navigate to subcategory view AND filter by parent category
        const newSelectedFilters = [...state.selectedFilters, filterId];
        const newFilterSet = filterTree[filterId];

        // Filter products by parent category
        const filtered = state.products.filter((product) => {
          return product.category?.toLowerCase() === filterId.toLowerCase();
        });

        return {
          selectedFilters: newSelectedFilters,
          currentFilterSet: newFilterSet,
          filteredProducts: filtered.length > 0 ? filtered : state.products,
          currentProductIndex: 0,
        };
      } else {
        // Subcategory (leaf node): Filter products by parent category AND subcategory
        const parentCategory = state.selectedFilters[state.selectedFilters.length - 1];

        const filtered = state.products.filter((product) => {
          const categoryMatch = product.category?.toLowerCase() === parentCategory?.toLowerCase();
          const subcategoryMatch = product.subcategory?.toLowerCase() === filterId.toLowerCase();
          return categoryMatch && subcategoryMatch;
        });

        return {
          filteredProducts: filtered.length > 0 ? filtered : state.products,
          currentProductIndex: 0,
        };
      }
    }),

  goBackFilter: () =>
    set((state) => {
      if (state.selectedFilters.length === 0) return state;

      const newSelectedFilters = state.selectedFilters.slice(0, -1);
      const lastFilter =
        newSelectedFilters[newSelectedFilters.length - 1] || 'root';
      const newFilterSet = filterTree[lastFilter] || filterTree.root;

      return {
        selectedFilters: newSelectedFilters,
        currentFilterSet: newFilterSet,
        filteredProducts: state.products,
        currentProductIndex: 0,
      };
    }),

  resetFilters: () =>
    set((state) => ({
      selectedFilters: [],
      currentFilterSet: filterTree.root,
      filteredProducts: state.products,
      currentProductIndex: 0,
    })),

  setSelectedMediaIndex: (index) => set({ selectedMediaIndex: index }),
}));
