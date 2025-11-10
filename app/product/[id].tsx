import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StarRating, Button, Avatar } from '../../components/ui';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { products, reviews, currentUser, toggleSave } = useAppStore();

  const product = products.find((p) => p.id === id);
  const productReviews = reviews.filter((r) => r.productId === id);
  const isSaved = currentUser.savedProducts?.includes(id as string) || false;

  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Build media items array (video, images only - 3D disabled for now)
  const mediaItems = useMemo(() => {
    const items: Array<{ type: 'image' | 'video' | '3d'; url: string }> = [];

    // 3D model removed for now
    // const model3dUrl = product.model3dUrl || 'https://github.com/nightmare5831/public_asset/releases/download/3d-models-v1/jewelry.glb';
    // items.push({ type: '3d', url: model3dUrl });

    // Add video
    if (product.videos && product.videos[0]) {
      items.push({ type: 'video', url: product.videos[0] });
    }

    // Add images
    product.images.forEach(img => {
      items.push({ type: 'image', url: img });
    });

    return items;
  }, [product]);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Product not found</Text>
      </SafeAreaView>
    );
  }

  const shippingInfo = product.shipping?.free
    ? `Free shipping • Arrives in ${product.shipping.days} days`
    : `Shipping • Arrives in ${product.shipping?.days || 5} days`;

  const handleSave = () => {
    toggleSave(product.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
          Product Details
        </Text>
        <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
          <Text className="text-2xl">{isSaved ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Media Gallery */}
        <View>
          {mediaItems[selectedMediaIndex]?.type === 'image' && (
            <Image
              source={{ uri: mediaItems[selectedMediaIndex].url }}
              style={{ width, height: width }}
              contentFit="cover"
              transition={200}
            />
          )}
          {mediaItems[selectedMediaIndex]?.type === 'video' && (
            <View style={{ width, height: width, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 18 }}>Video Player</Text>
              <Text style={{ color: '#fff', fontSize: 14, marginTop: 8 }}>Coming Soon</Text>
            </View>
          )}

          {/* Discount Badge */}
          {product.discount > 0 && (
            <View className="absolute top-4 left-4 bg-red-500 rounded-lg px-3 py-1.5">
              <Text className="text-white font-bold">-{product.discount}%</Text>
            </View>
          )}

          {/* Media Indicators */}
          {mediaItems.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {mediaItems.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedMediaIndex(index)}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === selectedMediaIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="p-4">
          {/* Category & Stock */}
          <View className="flex-row items-center justify-between mb-2">
            <View className="bg-primary/10 rounded-full px-3 py-1">
              <Text className="text-xs font-semibold text-primary capitalize">
                {product.category}
              </Text>
            </View>
            <Text className="text-xs text-secondary font-medium">
              ✓ In Stock
            </Text>
          </View>

          {/* Product Name */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mb-4">
            <StarRating rating={product.rating} size="md" showValue />
            <Text className="text-sm text-gray-500 ml-2">
              ({product.reviewCount} reviews)
            </Text>
          </View>

          {/* Price */}
          <View className="flex-row items-end mb-4">
            <Text className="text-3xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </Text>
            {product.originalPrice && (
              <Text className="text-lg text-gray-400 line-through ml-3 mb-1">
                R$ {product.originalPrice.toFixed(2)}
              </Text>
            )}
          </View>

          {/* Shipping Info */}
          {shippingInfo && (
            <View className="bg-gray-50 rounded-lg p-3 mb-4">
              <Text className="text-sm text-gray-700">
                📦 {shippingInfo}
              </Text>
            </View>
          )}

          {/* Tabs */}
          <View className="flex-row border-b border-gray-200 mb-4">
            <TouchableOpacity
              onPress={() => setActiveTab('details')}
              className={`flex-1 py-3 border-b-2 ${
                activeTab === 'details' ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'details' ? 'text-primary' : 'text-gray-500'
                }`}
              >
                Details
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('reviews')}
              className={`flex-1 py-3 border-b-2 ${
                activeTab === 'reviews' ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === 'reviews' ? 'text-primary' : 'text-gray-500'
                }`}
              >
                Reviews ({productReviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <View>
              <Text className="text-gray-700 leading-6 mb-4">
                {product.description}
              </Text>
              <Text className="text-sm text-gray-500">
                This is a premium product with excellent quality and design.
                Perfect for everyday use and special occasions.
              </Text>
            </View>
          ) : (
            <View>
              {productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <View key={review.id} className="mb-6 pb-6 border-b border-gray-100">
                    <View className="flex-row items-start mb-3">
                      <Avatar
                        uri={review.userAvatar}
                        name={review.userName}
                        size="sm"
                        isPremium={review.isPremium}
                      />
                      <View className="ml-3 flex-1">
                        <Text className="font-bold text-gray-900">
                          {review.userName}
                        </Text>
                        <Text className="text-xs text-gray-500">{review.timeAgo}</Text>
                      </View>
                      <StarRating rating={review.rating} size="sm" showValue />
                    </View>
                    <Text className="text-gray-700 leading-5">{review.content}</Text>
                    {review.images && review.images.length > 0 && (
                      <View className="flex-row mt-3">
                        {review.images.slice(0, 3).map((img, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: img }}
                            className="w-20 h-20 rounded-lg mr-2"
                            contentFit="cover"
                          />
                        ))}
                      </View>
                    )}
                  </View>
                ))
              ) : (
                <Text className="text-center text-gray-500 py-8">
                  No reviews yet. Be the first to review!
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View className="p-4 border-t border-gray-200 bg-white">
        <View className="flex-row items-center space-x-3">
          <TouchableOpacity
            className="border-2 border-primary rounded-lg px-6 py-4 active:bg-gray-50"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-bold text-center">💬 Chat</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Button onPress={() => console.log('Add to cart')} fullWidth>
              Add to Cart
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
