import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../data/products';
import { Message, messageApi } from '../../services/api';
import { OwnerInfo } from './OwnerInfo';
import { useAppStore } from '../../store/useAppStore';

type ContentItem = (Product & { type: 'product' }) | (Message & { type: 'message' });

interface DetailViewProps {
  currentItem: ContentItem | undefined;
  onMessageUpdate?: (updatedMessage: Message) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({ currentItem, onMessageUpdate }) => {
  const { authToken, currentUser } = useAppStore();
  const [commentText, setCommentText] = useState('');

  const getUserInitials = () => {
    if (!currentUser?.name) return 'U';
    const names = currentUser.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentUser.name.substring(0, 2).toUpperCase();
  };

  const handleImagePicker = () => {
    // TODO: Implement image picker functionality
    Alert.alert('Em breve', 'Funcionalidade de adicionar imagem em desenvolvimento');
  };

  const handlePostComment = async () => {
    if (commentText.trim() && authToken && currentItem && currentItem.type === 'message') {
      try {
        const newComment = await messageApi.addComment(authToken, currentItem.id, commentText);
        const updatedMessage = { ...currentItem, comments: [...currentItem.comments, newComment] };
        if (onMessageUpdate) {
          onMessageUpdate(updatedMessage as Message);
        }
        setCommentText('');
      } catch (error) {
        console.error('Failed to post comment:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o comentário');
      }
    }
  };

  const handleInteraction = async (type: 'favorite' | 'good' | 'bad') => {
    if (!authToken || !currentItem || currentItem.type !== 'message') return;
    try {
      const result = await messageApi.toggleInteraction(authToken, currentItem.id, type);
      const updatedMessage = { ...currentItem, ...result };
      if (onMessageUpdate) {
        onMessageUpdate(updatedMessage as Message);
      }
    } catch (error) {
      console.error('Failed to toggle interaction:', error);
      Alert.alert('Erro', 'Não foi possível realizar a ação');
    }
  };

  const isMessageType = currentItem && currentItem.type === 'message';

  return (
    <View style={styles.detailView}>
      <ScrollView
        style={styles.detailScroll}
        contentContainerStyle={styles.detailScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {currentItem && currentItem.type === 'product' ? (
          /* Product Detail */
          <>
            {/* Owner Info Section */}
            <View style={styles.ownerInfoSection}>
              <OwnerInfo
                ownerName={currentItem.ownerName}
                ownerRole={currentItem.ownerRole}
                variant="detail"
                rating={currentItem.rating}
                price={currentItem.price}
              />
            </View>

            <View style={styles.detailHeader}>
              <Text style={styles.detailName}>{currentItem.name}</Text>
              <Text style={styles.detailCategory}>Categoria: {currentItem.category}</Text>
            </View>

            <View style={styles.detailSection}>
              {currentItem.originalPrice && typeof currentItem.originalPrice === 'number' && (
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

              {currentItem.shipping && (
                <View style={styles.detailShippingInfo}>
                  <Ionicons
                    name={currentItem.shipping.free ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={currentItem.shipping.free ? "#10b981" : "#ef4444"}
                  />
                  <Text style={styles.detailShippingText}>
                    {currentItem.shipping.free ? 'Frete Grátis' : 'Frete Pago'} - Entrega em {currentItem.shipping.days || 5} dias
                  </Text>
                </View>
              )}

              {currentItem.description && (
                <View style={styles.detailDescriptionSection}>
                  <Text style={styles.detailSectionTitle}>Descrição</Text>
                  <Text style={styles.detailDescription}>{currentItem.description}</Text>
                </View>
              )}
            </View>
          </>
        ) : currentItem && currentItem.type === 'message' ? (
          /* Message Detail */
          <>
            {/* Owner Info with Interaction Buttons */}
            <View style={styles.messageOwnerInfoSection}>
              <View style={styles.ownerInfoWrapper}>
                <OwnerInfo
                  ownerName={currentItem.ownerName}
                  ownerRole={currentItem.ownerRole}
                  variant="detail"
                />
              </View>

              {/* Interaction Buttons on Right */}
              <View style={styles.interactionBar}>
                <TouchableOpacity style={styles.interactionButton} onPress={() => handleInteraction('favorite')}>
                  <Ionicons
                    name={currentItem.favorite?.includes(currentUser?.email || '') ? 'heart' : 'heart-outline'}
                    size={20}
                    color={currentItem.favorite?.includes(currentUser?.email || '') ? '#ef4444' : '#6b7280'}
                  />
                  <Text style={styles.interactionText}>{currentItem.favorite?.length || 0}</Text>
                </TouchableOpacity>

                <View style={styles.interactionButton}>
                  <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                  <Text style={styles.interactionText}>{currentItem.comments?.length || 0}</Text>
                </View>
              </View>
            </View>

            {/* Message Content */}
            <View style={styles.messageContentSection}>
              <Text style={styles.detailDescription}>{currentItem.content}</Text>
            </View>

            {/*Comments Container - Single White Card */}
            <View style={styles.messageContentCard}>
              {/* Comments Section */}
              <View style={styles.commentsSection}>
                <Text style={styles.commentsTitle}>Comentários ({currentItem.comments?.length || 0})</Text>

                {currentItem.comments && currentItem.comments.length > 0 ? (
                  currentItem.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <View style={styles.commentAvatar}>
                          <Text style={styles.commentAvatarText}>
                            {comment.ownerName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </Text>
                        </View>
                        <View style={styles.commentInfo}>
                          <Text style={styles.commentAuthor}>{comment.ownerName || 'Usuário'}</Text>
                          <Text style={styles.commentRole}>{comment.ownerRole || ''}</Text>
                        </View>
                      </View>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>Nenhum comentário ainda. Seja o primeiro!</Text>
                )}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      {/* Fixed Comment Input Section - Only for messages */}
      {isMessageType && (
        <View style={styles.commentInputSection}>
          <View style={styles.commentInputContainer}>
            {/* User Avatar */}
            <View style={styles.inputAvatar}>
              <Text style={styles.inputAvatarText}>{getUserInitials()}</Text>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Digite sua mensagem"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
            />

            {/* Image Button */}
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <Ionicons name="image-outline" size={22} color="#9ca3af" />
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, !commentText.trim() && styles.submitButtonDisabled]}
              onPress={handlePostComment}
              disabled={!commentText.trim()}
            >
              <Image
                source={require('../../assets/submit.png')}
                style={styles.submitIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fixed Contratar Button - Only for products */}
      {!isMessageType && currentItem && (
        <View style={styles.productButtonSection}>
          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.detailButtonText}>Contratar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  detailView: {
    flex: 1,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  detailScroll: {
    flex: 1,
  },
  detailScrollContent: {
    paddingBottom: 80, // Add space at bottom for fixed input
  },
  ownerInfoSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginTop: 12,
    padding: 5,
    borderRadius: 12,
  },
  detailHeader: {
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 12,
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
    backgroundColor: 'transparent',
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 10,
    borderRadius: 0,
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
  messageOwnerInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  ownerInfoWrapper: {
    flex: 1,
    marginRight: 12,
  },
  messageContentSection: {
    marginTop:5,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  messageContentCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    marginTop: 0,
  },
  interactionBar: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    flexShrink: 0,
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  commentsSection: {
    paddingTop: 0,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  productButtonSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  commentInputSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },
  commentCard: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  commentRole: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 25,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'visible',
  },
  inputAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    maxHeight: 60,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  imageButton: {
    padding: 4,
  },
  submitButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitIcon: {
    width: 20,
    height: 20,
  },
  inputFieldsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  sendButton: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
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
