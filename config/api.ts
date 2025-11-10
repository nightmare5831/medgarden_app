import { Platform } from 'react-native';

// API Configuration

export const API_CONFIG = {
  BASE_URL: Platform.select({
    android: 'https://backend-main-6uoeqs.laravel.cloud/api',
    ios: 'https://backend-main-6uoeqs.laravel.cloud/api',
    web: 'https://backend-main-6uoeqs.laravel.cloud/api',
    default: 'https://backend-main-6uoeqs.laravel.cloud/api',
  }),
  TIMEOUT: 10000,
};

// Alternative URLs for reference
export const API_URLS = {
  LARAVEL_CLOUD: 'https://backend-main-6uoeqs.laravel.cloud/api',
  ANDROID_EMULATOR: 'http://10.0.2.2:8000/api',
  IOS_SIMULATOR: 'http://localhost:8000/api',
  LOCALHOST: 'http://localhost:8000/api',
  WEB: 'http://localhost:8000/api',
  PHYSICAL_DEVICE: 'http://192.168.1.100:8000/api',
};
