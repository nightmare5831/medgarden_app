import { Platform } from 'react-native';

// API Configuration

export const API_CONFIG = {
  BASE_URL: Platform.select({
    android: 'https://medgarden-backend-main-rbinlj.laravel.cloud/api',
    ios: 'https://medgarden-backend-main-rbinlj.laravel.cloud/api',
    web: 'https://medgarden-backend-main-rbinlj.laravel.cloud/api',
    default: 'https://medgarden-backend-main-rbinlj.laravel.cloud/api',
  }),
  TIMEOUT: 10000,
};