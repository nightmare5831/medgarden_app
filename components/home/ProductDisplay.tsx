import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/products';
import { Message } from '../../services/api';

type ContentItem = (Product & { type: 'product' }) | (Message & { type: 'message' });

interface ProductDisplayProps {
  currentItem: ContentItem | undefined;
  isLoading: boolean;
  selectedImageIndex: number;
  showDetail: boolean;
  onThumbnailClick: (index: number) => void;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  currentItem,
  isLoading,
  selectedImageIndex,
  showDetail,
  onThumbnailClick,
}) => {
  if (isLoading) {
    return (
      <View style={styles.productDisplay}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={styles.productDisplay}>
        <View style={styles.emptyProduct}>
          <Ionicons name="image-outline" size={80} color="#fff" />
          <Text style={styles.emptyText}>Nenhum conteúdo disponível</Text>
        </View>
      </View>
    );
  }

  if (currentItem.type === 'product') {
    // Check if product has images
    const hasImages = currentItem.images && currentItem.images.length > 0;
    const displayImages = hasImages ? currentItem.images : [null, null, null]; // 3 placeholder slots

    // Ensure selectedImageIndex is valid
    const validImageIndex = hasImages && selectedImageIndex < currentItem.images.length
      ? selectedImageIndex
      : 0;
    return (
      <View style={styles.productDisplay}>
        <Image
          source={
            hasImages && currentItem.images[validImageIndex]
              ? { uri: currentItem.images[validImageIndex] }
              : require('../../assets/pbg.png')
          }
          style={styles.productImage}
          resizeMode="contain"
          onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
        />
        {/* Image Thumbnails - Always show 3 thumbnails when detail is shown */}
        {showDetail && (
          <View style={styles.thumbnailsOverlay}>
            <View style={styles.thumbnailContainer}>
              {displayImages.slice(0, 3).map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnailButton,
                    idx === validImageIndex && styles.thumbnailButtonActive
                  ]}
                  onPress={() => onThumbnailClick(idx)}
                >
                  <Image
                    source={img ? { uri: img } : require('../../assets/pbg.png')}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  // Message display - show placeholder image
  return (
    <View style={styles.productDisplay}>
      <Image
        source={require('../../assets/pbg.png')}
        style={styles.productImage}
        resizeMode="contain"
      />
      {!showDetail && (
        <View style={styles.messageInfoOverlay}>
          <Text style={styles.messageContent} numberOfLines={4}>
            {currentItem.content}
          </Text>
          <View style={styles.messageStats}>
            <View style={styles.messageStat}>
              <Ionicons name="heart" size={16} color="#ef4444" />
              <Text style={styles.messageStatText}>{currentItem.favorite?.length || 0}</Text>
            </View>
            <View style={styles.messageStat}>
              <Ionicons name="chatbubble" size={16} color="#6b7280" />
              <Text style={styles.messageStatText}>{currentItem.comments?.length || 0}</Text>
            </View>
          </View>
        </View>
      )}
      {showDetail && (
        <View style={styles.thumbnailsOverlay}>
          <View style={styles.thumbnailContainer}>
            {[0, 1, 2].map((idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.thumbnailButton,
                  idx === selectedImageIndex && styles.thumbnailButtonActive
                ]}
                onPress={() => onThumbnailClick(idx)}
              >
                <Image
                  source={require('../../assets/pbg.png')}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productDisplay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailsOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    zIndex: 100,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  thumbnailButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  thumbnailButtonActive: {
    borderColor: '#6fee5f',
    borderWidth: 4,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  emptyProduct: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 12,
  },
  messageInfoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  messageContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  messageStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  messageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageStatText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});
