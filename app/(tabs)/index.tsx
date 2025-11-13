import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';

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
    filterByCategory,
    nextProduct,
    previousProduct,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const currentProduct = filteredProducts[currentProductIndex];

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
        {/* User Profile Header */}
        <View style={styles.userProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser?.name || 'Lucas Monte'}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {currentUser?.role === 'patient' ? 'PACIENTE' :
                 currentUser?.role === 'professional' ? 'PROFISSIONAL' :
                 currentUser?.role === 'association' ? 'ASSOCIAÇÃO' :
                 currentUser?.role === 'store' ? 'LOJA' : 'PACIENTE'}
              </Text>
            </View>
          </View>
        </View>

        {/* Product/Image Display Area */}
        <View style={styles.productDisplay}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : currentProduct ? (
            <>
              <Image
                source={{ uri: currentProduct.thumbnail }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfoOverlay}>
                <Text style={styles.productName} numberOfLines={1}>
                  {currentProduct.name}
                </Text>
                <Text style={styles.productPrice}>
                  R$ {currentProduct.price.toFixed(2)}
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.emptyProduct}>
              <Ionicons name="image-outline" size={80} color="#fff" />
              <Text style={styles.emptyText}>Nenhum produto disponível</Text>
            </View>
          )}
        </View>

        {/* Navigation Controls Overlay */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={previousProduct}
            disabled={filteredProducts.length === 0}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={nextProduct}
            disabled={filteredProducts.length === 0}
          >
            <Ionicons name="arrow-forward" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* BOTTOM SECTION - 38.2% (Navigation Grid) */}
      <View style={styles.bottomSection}>
        {/* LEFT SIDE - 60% (2x2 Category Grid) */}
        <View style={styles.leftColumn}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.gridCell,
                selectedCategory === 'profissionais' && styles.gridCellSelected
              ]}
              onPress={() => handleCategoryClick('profissionais')}
            >
              <Ionicons name="people-outline" size={40} color="#000" />
              <Text style={styles.gridLabel}>Profissionais</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity
              style={[
                styles.gridCell,
                selectedCategory === 'pacientes' && styles.gridCellSelected
              ]}
              onPress={() => handleCategoryClick('pacientes')}
            >
              <Ionicons name="document-text-outline" size={40} color="#000" />
              <Text style={styles.gridLabel}>Pacientes</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalDivider} />

          {/* Row 2 */}
          <View style={styles.gridRow}>
            <TouchableOpacity
              style={[
                styles.gridCell,
                selectedCategory === 'associacoes' && styles.gridCellSelected
              ]}
              onPress={() => handleCategoryClick('associacoes')}
            >
              <Ionicons name="people-circle-outline" size={40} color="#000" />
              <Text style={styles.gridLabel}>Associações</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            <TouchableOpacity
              style={[
                styles.gridCell,
                selectedCategory === 'produtos' && styles.gridCellSelected
              ]}
              onPress={() => handleCategoryClick('produtos')}
            >
              <Ionicons name="storefront-outline" size={40} color="#000" />
              <Text style={styles.gridLabel}>Produtos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.mainVerticalDivider} />

        {/* RIGHT SIDE - 40% (Forum, Profile, Postar) */}
        <View style={styles.rightColumn}>
          {/* Top Row - Forum and Profile (Side by Side) */}
          <View style={styles.rightTopRow}>
            {/* Forum Button (Left) */}
            <TouchableOpacity
              style={styles.forumCell}
              onPress={() => router.push('/(tabs)/forum')}
            >
              <View style={styles.forumButton}>
                <Ionicons name="chatbubbles" size={32} color="#fff" />
              </View>
              <Text style={styles.forumLabel}>Forum</Text>
            </TouchableOpacity>

            <View style={styles.verticalDivider} />

            {/* Profile Button (Right) */}
            <TouchableOpacity
              style={styles.profileCell}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <View style={styles.profileButton}>
                <Text style={styles.profileAvatarText}>{getUserInitials()}</Text>
              </View>
              <Text style={styles.profileLabel}>Rodrigo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalDivider} />

          {/* Bottom Row - Postar Button */}
          <View style={styles.rightBottomSection}>
            <TouchableOpacity style={styles.postarButton}>
              <View style={styles.postarIconCircle}>
                <Ionicons name="add" size={32} color="#000" />
              </View>
              <Text style={styles.postarLabel}>Postar</Text>
            </TouchableOpacity>
          </View>
        </View>
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

  // TOP SECTION - 61.8%
  topSection: {
    flex: GOLDEN_RATIO,
    position: 'relative',
  },
  userProfile: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusBadge: {
    backgroundColor: '#6fee5f',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  productDisplay: {
    flex: 1,
    marginTop: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '70%',
    height: '80%',
    borderRadius: 12,
    transform: [{ rotate: '-5deg' }],
  },
  productInfoOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6fee5f',
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
  controlsOverlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },

  // BOTTOM SECTION - 38.2% (Left-Right Split)
  bottomSection: {
    flex: 1 - GOLDEN_RATIO,
    backgroundColor: '#fff',
    flexDirection: 'row',
  },

  // LEFT COLUMN - 60% (2x2 Category Grid)
  leftColumn: {
    flex: 0.6,
    backgroundColor: '#fff',
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  gridCellSelected: {
    backgroundColor: '#e0f2fe',
  },
  gridLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // RIGHT COLUMN - 40% (Forum, Profile, Postar)
  rightColumn: {
    flex: 0.4,
    backgroundColor: '#fff',
  },
  mainVerticalDivider: {
    width: 2,
    backgroundColor: '#d1d5db',
  },

  // Right Top Row - Forum and Profile (Side by Side) - 1/3
  rightTopRow: {
    flex: 1,
    flexDirection: 'row',
  },
  forumCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forumButton: {
    backgroundColor: '#10b981',
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 6,
  },
  forumLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  profileCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 65,
    height: 65,
    backgroundColor: '#3b82f6',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 6,
  },
  profileAvatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },

  // Right Bottom Section - Postar Button - 2/3
  rightBottomSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  postarButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  postarIconCircle: {
    backgroundColor: '#6fee5f',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  postarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },

  // Dividers
  verticalDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  // Counter Badge
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
