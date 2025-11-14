import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { OwnerInfo } from '../../components/home/OwnerInfo';
import { ProductDisplay } from '../../components/home/ProductDisplay';
import { NavigationControls } from '../../components/home/NavigationControls';
import { BottomSection } from '../../components/home/BottomSection';
import { DetailView } from '../../components/home/DetailView';

const GOLDEN_RATIO = 0.618;

// Category mapping
const CATEGORY_LABELS = {
  profissionais: 'male',
  pacientes: 'female',
  associacoes: 'graduation',
  produtos: 'wedding',
};

export default function BuyerDashboard() {
  const {
    currentUser,
    filteredProducts,
    currentProductIndex,
    isLoading,
    loadProducts,
    loadMessages,
    filterByCategory,
    nextProduct,
    previousProduct,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Load products and messages on mount
  useEffect(() => {
    loadProducts();
    loadMessages();
  }, []);

  const currentItem = filteredProducts[currentProductIndex];

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [currentProductIndex]);

  const handleShowDetail = () => {
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleCategoryClick = (categoryKey: string) => {
    const category = CATEGORY_LABELS[categoryKey as keyof typeof CATEGORY_LABELS];

    if (selectedCategory === categoryKey) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
      filterByCategory(null);
    } else {
      // Select new category
      setSelectedCategory(categoryKey);
      filterByCategory(category);
    }
  };

  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    const names = currentUser.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* TOP SECTION - 61.8% (Product Display Area) */}
      <ImageBackground
        source={require('../../assets/pbg.png')}
        style={styles.topSection}
        resizeMode="cover"
      >
        {/* Owner Info Header - Hide when detail is shown */}
        {!showDetail && (
          <View style={styles.ownerInfoWrapper}>
            <OwnerInfo
              ownerName={currentItem?.ownerName}
              ownerRole={currentItem?.ownerRole}
              variant="header"
            />
          </View>
        )}

        {/* Product/Message Display Area - Always visible */}
        <ProductDisplay
          currentItem={currentItem}
          isLoading={isLoading}
          selectedImageIndex={selectedImageIndex}
          showDetail={showDetail}
          onThumbnailClick={handleThumbnailClick}
        />

        {/* Navigation Controls Overlay */}
        <NavigationControls
          showDetail={showDetail}
          onDetailToggle={showDetail ? handleCloseDetail : handleShowDetail}
          onPrevious={previousProduct}
          onNext={nextProduct}
        />
      </ImageBackground>

      {/* BOTTOM SECTION - 38.2% (Navigation Grid or Detail View) */}
      <View style={styles.bottomSection}>
        {!showDetail ? (
          <BottomSection
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            currentUser={currentUser}
            getUserInitials={getUserInitials}
          />
        ) : (
          <DetailView currentItem={currentItem} />
        )}
      </View>

      {/* Product Counter */}
      {filteredProducts.length > 0 && (
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentProductIndex + 1} / {filteredProducts.length}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#c4c4c4',
  },
  topSection: {
    flex: GOLDEN_RATIO,
    position: 'relative',
  },
  ownerInfoWrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  bottomSection: {
    flex: 1 - GOLDEN_RATIO,
    backgroundColor: '#fff',
  },
  counterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
