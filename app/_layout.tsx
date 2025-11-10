import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAppStore } from '../store/useAppStore';
import '../global.css';

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, checkAuth } = useAppStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, []);

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const { currentUser } = useAppStore.getState();

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect based on user role after login
      if (currentUser?.role === 'seller') {
        router.replace('/(tabs)/seller-dashboard');
      } else {
        router.replace('/(tabs)'); // Buyer goes to product catalog
      }
    } else if (isAuthenticated && inTabsGroup && currentUser) {
      // Protect routes based on role
      const currentRoute = segments[1];

      if (currentUser.role === 'seller') {
        // Seller trying to access buyer's product catalog
        if (currentRoute === 'index' || !currentRoute) {
          router.replace('/(tabs)/seller-dashboard');
        }
      } else if (currentUser.role === 'buyer' || currentUser.role === 'admin') {
        // Buyer/Admin trying to access seller dashboard
        if (currentRoute === 'seller-dashboard') {
          router.replace('/(tabs)');
        }
      }
    }
  }, [isAuthenticated, segments]);

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="product/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
      </Stack>
    </>
  );
}
