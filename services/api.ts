import { Product } from '../data/products';
import { API_CONFIG } from '../config/api';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

interface ApiResponse<T> {
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'professional' | 'association' | 'store' | 'super_admin';
}

interface LoginResponse {
  user: User;
  token: string;
  message?: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message?: string;
}

// Helper function for API calls with timeout
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);

      // Create error with status code
      const error: any = new Error(`API Error: ${response.status} - ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Better error messages for debugging
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Server took too long to respond');
    }
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
      throw new Error(`Cannot connect to server at ${API_BASE_URL}. Is Laravel running?`);
    }

    throw error;
  }
}

// Product API
export const productApi = {
  // Get all products (public endpoint)
  getAll: async (): Promise<Product[]> => {
    const response = await apiCall<PaginatedResponse<any>>('/products');

    // Transform Laravel response to match frontend Product interface
    return response.data.map(transformProduct);
  },

  // Get single product (public endpoint)
  getById: async (id: string): Promise<Product> => {
    const response = await apiCall<any>(`/products/${id}`);
    return transformProduct(response);
  },
};

// Transform Laravel Product to Frontend Product interface
function transformProduct(apiProduct: any): Product {
  // Parse images - Laravel returns JSON string, need to parse it
  let images: string[] = [];
  if (typeof apiProduct.images === 'string') {
    try {
      images = JSON.parse(apiProduct.images);
    } catch (e) {
      images = [];
    }
  } else if (Array.isArray(apiProduct.images)) {
    images = apiProduct.images;
  }

  // Parse videos - same issue
  let videos: string[] = [];
  if (typeof apiProduct.videos === 'string') {
    try {
      videos = JSON.parse(apiProduct.videos);
    } catch (e) {
      videos = [];
    }
  } else if (Array.isArray(apiProduct.videos)) {
    videos = apiProduct.videos;
  }

  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description || '',
    price: parseFloat(apiProduct.price || apiProduct.current_price || apiProduct.base_price),
    originalPrice: apiProduct.originalPrice || (apiProduct.base_price ? parseFloat(apiProduct.base_price) : undefined),
    discount: calculateDiscount(parseFloat(apiProduct.base_price), parseFloat(apiProduct.current_price)),
    images: images,
    thumbnail: images[0] || '',
    category: apiProduct.category || 'Uncategorized',
    rating: apiProduct.rating || 4.5,
    reviewCount: apiProduct.reviewCount || 0,
    featured: apiProduct.featured !== undefined ? apiProduct.featured : (apiProduct.status === 'approved' && apiProduct.is_active),
    shipping: apiProduct.shipping || {
      free: true,
      days: 5,
    },
    // 3D Model support (Phase 4)
    model3dUrl: apiProduct.model3dUrl || apiProduct.model_3d_url,
    model3dType: apiProduct.model3dType || apiProduct.model_3d_type,
    videos: videos,
    // Owner information - backend API returns flattened fields (ownerName, ownerRole)
    ownerId: apiProduct.ownerId?.toString() || apiProduct.user_id?.toString(),
    ownerName: apiProduct.ownerName || apiProduct.user?.name,
    ownerRole: apiProduct.ownerRole || apiProduct.user?.role,
  };
}

// Calculate discount percentage
function calculateDiscount(basePrice?: number, currentPrice?: number): number | undefined {
  if (!basePrice || !currentPrice || basePrice === currentPrice) {
    return undefined;
  }
  return Math.round(((basePrice - currentPrice) / basePrice) * 100);
}

// Auth API
export const authApi = {
  // Login
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiCall<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  },

  // Register
  register: async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string,
    phone?: string,
    role: 'patient' | 'professional' | 'association' | 'store' = 'patient'
  ): Promise<RegisterResponse> => {
    const response = await apiCall<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        password_confirmation,
        phone,
        role,
      }),
    });
    return response;
  },

  // Logout
  logout: async (token: string): Promise<void> => {
    await apiCall<void>('/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Get current user
  getMe: async (token: string): Promise<User> => {
    const response = await apiCall<{ user: User }>('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.user;
  },
};

// Message API
export interface MessageComment {
  id: string | number;
  owner: string;
  ownerName: string;
  ownerRole: string;
  content: string;
  timestamp: string;
}

export interface Message {
  id: string | number;
  owner: string;
  ownerName: string;
  ownerRole: string;
  content: string;
  timestamp: string;
  comments: MessageComment[];
  favorite: string[];
  good: string[];
  bad: string[];
}

export const messageApi = {
  getAll: async (token: string): Promise<Message[]> => {
    return await apiCall<Message[]>('/messages', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  create: async (token: string, content: string): Promise<Message> => {
    return await apiCall<Message>('/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
  },

  addComment: async (token: string, messageId: string | number, content: string): Promise<MessageComment> => {
    return await apiCall<MessageComment>(`/messages/${messageId}/comments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
  },

  toggleInteraction: async (token: string, messageId: string | number, type: 'favorite' | 'good' | 'bad'): Promise<{ favorite: string[], good: string[], bad: string[] }> => {
    return await apiCall<{ favorite: string[], good: string[], bad: string[] }>(`/messages/${messageId}/interactions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    });
  },

  delete: async (token: string, messageId: string | number): Promise<void> => {
    await apiCall<void>(`/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  deleteMultiple: async (token: string, ids: (string | number)[]): Promise<void> => {
    await apiCall<void>('/messages/delete-multiple', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });
  },
};

export default {
  productApi,
  authApi,
  messageApi,
};
