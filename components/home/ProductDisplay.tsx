import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
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
    return (
      <View style={styles.productDisplay}>
        <Image
          source={{ uri: currentItem.images[selectedImageIndex] || currentItem.thumbnail }}
          style={styles.productImage}
          resizeMode="contain"
        />
        {/* Image Thumbnails */}
        {showDetail && currentItem.images && currentItem.images.length > 0 && (
          <View style={styles.thumbnailsOverlay}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {currentItem.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnailButton,
                    idx === selectedImageIndex && styles.thumbnailButtonActive
                  ]}
                  onPress={() => onThumbnailClick(idx)}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }

  // Message display
  return (
    <View style={styles.productDisplay}>
      <View style={styles.messageCard}>
        <View style={styles.messageHeader}>
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>
              {currentItem.ownerName?.substring(0, 2).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.messageAuthor}>
            <Text style={styles.messageName}>{currentItem.ownerName}</Text>
            <Text style={styles.messageRole}>{currentItem.ownerRole}</Text>
          </View>
        </View>
        <Text style={styles.messageContent}>{currentItem.content}</Text>
        <View style={styles.messageStats}>
          <View style={styles.messageStat}>
            <Ionicons name="chatbubble-outline" size={16} color="#fff" />
            <Text style={styles.messageStatText}>{currentItem.comments?.length || 0}</Text>
          </View>
          <View style={styles.messageStat}>
            <Ionicons name="heart" size={16} color="#ef4444" />
            <Text style={styles.messageStatText}>{currentItem.favorite?.length || 0}</Text>
          </View>
          <View style={styles.messageStat}>
            <Ionicons name="thumbs-up" size={16} color="#10b981" />
            <Text style={styles.messageStatText}>{currentItem.good?.length || 0}</Text>
          </View>
        </View>
      </View>
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
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  thumbnailButton: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  thumbnailButtonActive: {
    borderColor: '#6fee5f',
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
  messageCard: {
    width: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageAuthor: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  messageRole: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  messageContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  messageStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageStatText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
});
