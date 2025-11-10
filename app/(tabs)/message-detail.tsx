import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { messageApi, Message } from '../../services/api';
import { messagesChannel } from '../../services/pusher';

export default function MessageDetail() {
  const { id } = useLocalSearchParams();
  const { currentUser, authToken } = useAppStore();
  const [commentText, setCommentText] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessage();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      loadMessage(true);

      // Listen to Pusher events for real-time updates
      const handleMessageUpdate = (data: any) => {
        console.log('Pusher event:', data);
        // Only refresh if it's for this message
        if (data.messageId.toString() === id) {
          loadMessage(false); // Silent refresh
        }
      };

      messagesChannel.bind('MessageUpdated', handleMessageUpdate);

      return () => {
        messagesChannel.unbind('MessageUpdated', handleMessageUpdate);
      };
    }, [id, authToken])
  );

  const loadMessage = async (showLoading = true) => {
    if (!authToken) return;
    try {
      if (showLoading) setLoading(true);
      const messages = await messageApi.getAll(authToken);
      const found = messages.find(m => m.id.toString() === id);
      if (found) {
        setMessage(found);
      }
    } catch (error) {
      console.error('Failed to load message:', error);
      if (showLoading) {
        Alert.alert('Erro', 'Não foi possível carregar a mensagem');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const userEmail = currentUser?.email || '';
  const isFavorited = message?.favorite.includes(userEmail) || false;
  const isGood = message?.good.includes(userEmail) || false;
  const isBad = message?.bad.includes(userEmail) || false;

  const handleBack = () => {
    router.push('/(tabs)/forum');
  };

  const handleInteraction = async (type: 'favorite' | 'good' | 'bad') => {
    if (!authToken || !message) return;
    try {
      const result = await messageApi.toggleInteraction(authToken, message.id, type);
      setMessage({ ...message, ...result });
    } catch (error) {
      console.error('Failed to toggle interaction:', error);
      Alert.alert('Erro', 'Não foi possível realizar a ação');
    }
  };

  const handlePostComment = async () => {
    if (commentText.trim() && authToken && message) {
      try {
        const newComment = await messageApi.addComment(authToken, message.id, commentText);
        setMessage({ ...message, comments: [...message.comments, newComment] });
        setCommentText('');
      } catch (error) {
        console.error('Failed to post comment:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o comentário');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mensagem</Text>
          <View style={styles.backButton} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : !message ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Mensagem não encontrada</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Message Card */}
            <View style={styles.messageCard}>
              {/* Message Header */}
              <View style={styles.messageHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {message.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={styles.messageHeaderInfo}>
                <Text style={styles.authorName}>{message.ownerName}</Text>
                <View style={styles.messageMeta}>
                  <View style={[styles.roleBadge, message.ownerRole === 'seller' ? styles.sellerBadge : styles.buyerBadge]}>
                    <Text style={styles.roleBadgeText}>
                      {message.ownerRole === 'seller' ? 'Vendedor' : 'Comprador'}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>• {message.timestamp}</Text>
                </View>
              </View>
            </View>

            {/* Message Content */}
            <Text style={styles.messageContent}>{message.content}</Text>

            {/* Interaction Buttons */}
            <View style={styles.interactionBar}>
              <TouchableOpacity style={styles.interactionButton} onPress={() => handleInteraction('favorite')}>
                <Ionicons name={isFavorited ? 'heart' : 'heart-outline'} size={22} color={isFavorited ? '#ef4444' : '#6b7280'} />
                <Text style={styles.interactionText}>{message.favorite.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton} onPress={() => handleInteraction('good')}>
                <Ionicons name={isGood ? 'thumbs-up' : 'thumbs-up-outline'} size={22} color={isGood ? '#3b82f6' : '#6b7280'} />
                <Text style={styles.interactionText}>{message.good.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.interactionButton} onPress={() => handleInteraction('bad')}>
                <Ionicons name={isBad ? 'thumbs-down' : 'thumbs-down-outline'} size={22} color={isBad ? '#6b7280' : '#9ca3af'} />
                <Text style={styles.interactionText}>{message.bad.length}</Text>
              </TouchableOpacity>

              <View style={styles.interactionButton}>
                <Ionicons name="chatbubble-outline" size={22} color="#6b7280" />
                <Text style={styles.interactionText}>{message.comments.length}</Text>
              </View>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>Comentários ({message.comments.length})</Text>

            {message.comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {comment.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.commentInfo}>
                    <View style={styles.commentTop}>
                      <Text style={styles.commentAuthor}>{comment.ownerName}</Text>
                      <View style={[styles.commentBadge, comment.ownerRole === 'seller' ? styles.sellerBadge : styles.buyerBadge]}>
                        <Text style={styles.commentBadgeText}>
                          {comment.ownerRole === 'seller' ? 'V' : 'C'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.commentTime}>{comment.timestamp}</Text>
                  </View>
                </View>
                <Text style={styles.commentContent}>{comment.content}</Text>
              </View>
            ))}
          </View>
          </ScrollView>
        )}

        {/* Comment Input */}
        {!loading && message && (
          <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handlePostComment}
            disabled={!commentText.trim()}
          >
            <Ionicons name="send" size={20} color={commentText.trim() ? '#2563eb' : '#9ca3af'} />
          </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 8,
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messageHeaderInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  sellerBadge: {
    backgroundColor: '#dbeafe',
  },
  buyerBadge: {
    backgroundColor: '#d1fae5',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#111827',
  },
  timestamp: {
    fontSize: 13,
    color: '#6b7280',
  },
  messageContent: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
    marginBottom: 16,
  },
  interactionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    gap: 24,
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
    backgroundColor: '#ffffff',
    padding: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  commentCard: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6b7280',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  commentAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  commentInfo: {
    flex: 1,
  },
  commentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  commentBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#111827',
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
});
