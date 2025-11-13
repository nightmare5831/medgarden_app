import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
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
        {/* User Profile Header */}
        <View style={styles.userProfile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getUserInitials()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {currentUser?.name || 'Usuário'}
            </Text>
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

        {/* Product/Message Display Area */}
        <View style={styles.productDisplay}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : currentItem ? (
            currentItem.type === 'product' ? (
              <>
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
                          onPress={() => handleThumbnailClick(idx)}
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
              </>
            ) : (
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
            )
          ) : (
            <View style={styles.emptyProduct}>
              <Ionicons name="image-outline" size={80} color="#fff" />
              <Text style={styles.emptyText}>Nenhum conteúdo disponível</Text>
            </View>
          )}
        </View>

        {/* Navigation Controls Overlay */}
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={showDetail ? handleCloseDetail : handleShowDetail}
            disabled={!currentItem}
          >
            <Ionicons
              name={showDetail ? "close" : "ellipsis-horizontal"}
              size={24}
              color="#000"
            />
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

      {/* BOTTOM SECTION - 38.2% (Navigation Grid or Detail View) */}
      <View style={styles.bottomSection}>
        {!showDetail ? (
          <>
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
              <Image
                source={require('../../assets/profesional.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
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
              <Image
                source={require('../../assets/pacient.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
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
              <Image
                source={require('../../assets/association.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
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
              <Image
                source={require('../../assets/products.png')}
                style={styles.categoryImage}
                resizeMode="contain"
              />
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
                <Image
                  source={require('../../assets/forum.png')}
                  style={styles.forumImage}
                  resizeMode="contain"
                />
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
              <Text style={styles.profileLabel}>{currentUser?.name?.split(' ')[0] || 'Perfil'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.horizontalDivider} />

          {/* Bottom Row - Postar Button */}
          <View style={styles.rightBottomSection}>
            <TouchableOpacity style={styles.postarButton}>
              <View style={styles.postarIconCircle}>
                <Image
                  source={require('../../assets/post.png')}
                  style={styles.postarImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.postarLabel}>Postar</Text>
            </TouchableOpacity>
          </View>
        </View>
          </>
        ) : (
          /* DETAIL VIEW */
          <View style={styles.detailView}>
            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              {currentItem && currentItem.type === 'product' ? (
                /* Product Detail */
                <>
                  <View style={styles.detailHeader}>
                    <View style={styles.detailBadgeRow}>
                      {currentItem.featured && (
                        <View style={styles.detailBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#10b981" />
                          <Text style={styles.detailBadgeText}>DESTAQUE</Text>
                        </View>
                      )}
                      <View style={styles.detailRating}>
                        <Ionicons name="star" size={16} color="#f59e0b" />
                        <Text style={styles.detailRatingText}>{currentItem.rating.toFixed(1)}</Text>
                        <Text style={styles.detailReviewCount}>({currentItem.reviewCount})</Text>
                      </View>
                      <Text style={styles.detailPrice}>R$ {currentItem.price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.detailName}>{currentItem.name}</Text>
                    <Text style={styles.detailCategory}>Categoria: {currentItem.category}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    {currentItem.originalPrice && (
                      <View style={styles.detailPriceInfo}>
                        <Text style={styles.detailOriginalPrice}>
                          De: R$ {currentItem.originalPrice.toFixed(2)}
                        </Text>
                        {currentItem.discount && (
                          <Text style={styles.detailDiscount}>
                            {currentItem.discount}% OFF
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.detailShippingInfo}>
                      <Ionicons
                        name={currentItem.shipping.free ? "checkmark-circle" : "close-circle"}
                        size={18}
                        color={currentItem.shipping.free ? "#10b981" : "#ef4444"}
                      />
                      <Text style={styles.detailShippingText}>
                        {currentItem.shipping.free ? 'Frete Grátis' : 'Frete Pago'} - Entrega em {currentItem.shipping.days} dias
                      </Text>
                    </View>

                    <View style={styles.detailDescriptionSection}>
                      <Text style={styles.detailSectionTitle}>Descrição</Text>
                      <Text style={styles.detailDescription}>{currentItem.description}</Text>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.detailButton}>
                    <Text style={styles.detailButtonText}>Contratar</Text>
                  </TouchableOpacity>
                </>
              ) : currentItem && currentItem.type === 'message' ? (
                /* Message Detail */
                <>
                  <View style={styles.detailHeader}>
                    <View style={styles.messageDetailHeader}>
                      <View style={styles.messageDetailAvatar}>
                        <Text style={styles.messageDetailAvatarText}>
                          {currentItem.ownerName?.substring(0, 2).toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.detailName}>{currentItem.ownerName}</Text>
                        <Text style={styles.messageDetailRole}>{currentItem.ownerRole}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailDescription}>{currentItem.content}</Text>
                  </View>

                  <View style={styles.messageDetailStats}>
                    <View style={styles.messageDetailStat}>
                      <Ionicons name="chatbubble" size={20} color="#6b7280" />
                      <Text style={styles.messageDetailStatText}>
                        {currentItem.comments?.length || 0} comentários
                      </Text>
                    </View>
                    <View style={styles.messageDetailStat}>
                      <Ionicons name="heart" size={20} color="#ef4444" />
                      <Text style={styles.messageDetailStatText}>
                        {currentItem.favorite?.length || 0} favoritos
                      </Text>
                    </View>
                    <View style={styles.messageDetailStat}>
                      <Ionicons name="thumbs-up" size={20} color="#10b981" />
                      <Text style={styles.messageDetailStatText}>
                        {currentItem.good?.length || 0} curtidas
                      </Text>
                    </View>
                  </View>
                </>
              ) : null}
            </ScrollView>
          </View>
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
    borderRadius: 50,
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
    borderWidth: 3,
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
  categoryImage: {
    width: 60,
    height: 60,
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
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forumLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  forumImage: {
    width: 55,
    height: 55,
  },
  profileCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 60,
    height: 60,
    backgroundColor: '#3b82f6',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  profileAvatarText: {
    fontSize: 20,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  postarImage: {
    width: 60,
    height: 60,
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

  // Message Card Styles
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

  // Detail View Styles
  detailView: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  detailScroll: {
    flex: 1,
    padding: 20,
  },
  detailHeader: {
    marginBottom: 16,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#065f46',
  },
  detailRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 'auto',
  },
  detailName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  detailCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  detailReviewCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailPriceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  detailOriginalPrice: {
    fontSize: 14,
    color: '#92400e',
    textDecorationLine: 'line-through',
  },
  detailDiscount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  detailShippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  detailShippingText: {
    fontSize: 14,
    color: '#374151',
  },
  detailDescriptionSection: {
    marginTop: 8,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  detailTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detailTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  detailTagText: {
    fontSize: 12,
    color: '#374151',
  },
  detailDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  detailButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 10,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageDetailAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageDetailAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  messageDetailRole: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  messageDetailStats: {
    flexDirection: 'column',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  messageDetailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  messageDetailStatText: {
    fontSize: 14,
    color: '#374151',
  },
});
