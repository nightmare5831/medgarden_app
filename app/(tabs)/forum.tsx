import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import { messageApi, Message } from '../../services/api';
import { messagesChannel } from '../../services/pusher';

export default function Forum() {
  const { currentUser, authToken } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'mine'>('all');
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string | number>>(new Set());
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    // Listen to Pusher events for real-time updates
    const handleMessageUpdate = () => {
      loadMessages(false); // Silent refresh when any message changes
    };

    messagesChannel.bind('MessageUpdated', handleMessageUpdate);

    return () => {
      messagesChannel.unbind('MessageUpdated', handleMessageUpdate);
    };
  }, [authToken]);

  const filteredMessages = messages.filter((message) => {
    // Filter by tab
    if (activeTab === 'favorites' && !message.favorite.includes(currentUser?.email || '')) {
      return false;
    }
    if (activeTab === 'mine' && message.owner !== currentUser?.email) {
      return false;
    }

    // Filter by search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.content.toLowerCase().includes(query) ||
      message.ownerName.toLowerCase().includes(query)
    );
  });

  const loadMessages = async (showLoading = true) => {
    if (!authToken) return;
    try {
      if (showLoading) setLoading(true);
      const data = await messageApi.getAll(authToken);
      setMessages(data);
    } catch (error: any) {
      console.error('Failed to load messages:', error);

      // Check if it's a 401 error (unauthorized)
      if (error.status === 401) {
        Alert.alert(
          'Sessão expirada',
          'Sua sessão expirou. Por favor, faça login novamente.',
          [
            {
              text: 'OK',
              onPress: () => {
                useAppStore.getState().logout();
                router.replace('/auth/login');
              }
            }
          ]
        );
      } else if (showLoading) {
        Alert.alert('Erro', 'Não foi possível carregar as mensagens');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/(tabs)');
  };

  const handleCreateMessage = async () => {
    if (newMessageText.trim() && authToken) {
      try {
        await messageApi.create(authToken, newMessageText);
        setNewMessageText('');
        setShowNewMessage(false);
        Alert.alert('Sucesso', 'Mensagem criada com sucesso!');
        loadMessages(); // Reload messages
      } catch (error) {
        console.error('Failed to create message:', error);
        Alert.alert('Erro', 'Não foi possível criar a mensagem');
      }
    }
  };

  const toggleSelectMessage = (messageId: string | number) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    if (!authToken) return;

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta mensagem?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await messageApi.delete(authToken, messageId);
              Alert.alert('Sucesso', 'Mensagem excluída com sucesso!');
              loadMessages();
            } catch (error) {
              console.error('Failed to delete message:', error);
              Alert.alert('Erro', 'Não foi possível excluir a mensagem');
            }
          },
        },
      ]
    );
  };

  const handleDeleteSelected = async () => {
    if (!authToken || selectedMessages.size === 0) return;

    Alert.alert(
      'Confirmar exclusão',
      `Tem certeza que deseja excluir ${selectedMessages.size} mensagem(ns)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await messageApi.deleteMultiple(authToken, Array.from(selectedMessages));
              Alert.alert('Sucesso', 'Mensagens excluídas com sucesso!');
              setSelectedMessages(new Set());
              setSelectMode(false);
              loadMessages();
            } catch (error) {
              console.error('Failed to delete messages:', error);
              Alert.alert('Erro', 'Não foi possível excluir as mensagens');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fórum</Text>
        <View style={styles.userAvatarContainer}>
          {currentUser && (
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('all')} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Todas</Text>
            {activeTab === 'all' && <View style={styles.tabIndicatorLine} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('favorites')} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>Favoritas</Text>
            {activeTab === 'favorites' && <View style={styles.tabIndicatorLine} />}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('mine')} style={styles.tabItem}>
            <Text style={[styles.tabText, activeTab === 'mine' && styles.activeTabText]}>Minhas postagens</Text>
            {activeTab === 'mine' && <View style={styles.tabIndicatorLine} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Forum Posts List */}
        <View style={styles.postsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : filteredMessages.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyStateTitle}>
                {messages.length === 0 ? 'Nenhuma mensagem' : 'Nenhum resultado encontrado'}
              </Text>
              <Text style={styles.emptyStateText}>
                {messages.length === 0
                  ? 'Seja o primeiro a postar uma mensagem!'
                  : 'Tente buscar por outro termo'}
              </Text>
            </View>
          ) : (
            filteredMessages.map((message) => (
              <View key={message.id} style={styles.postCardWrapper}>
                {/* Delete button for single message when not in select mode */}
                {activeTab === 'mine' && !selectMode && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message.id);
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.postCard}
                  onPress={() => {
                    if (selectMode && activeTab === 'mine') {
                      toggleSelectMessage(message.id);
                    } else {
                      router.push(`/(tabs)/message-detail?id=${message.id}`);
                    }
                  }}
                >
                {/* Message Header */}
                <View style={styles.postHeader}>
                  {selectMode && activeTab === 'mine' && (
                    <TouchableOpacity
                      onPress={() => toggleSelectMessage(message.id)}
                      style={styles.checkbox}
                    >
                      <Ionicons
                        name={selectedMessages.has(message.id) ? "checkbox" : "square-outline"}
                        size={24}
                        color={selectedMessages.has(message.id) ? "#2563eb" : "#9ca3af"}
                      />
                    </TouchableOpacity>
                  )}
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarText}>
                      {message.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.postHeaderInfo}>
                    <Text style={styles.postAuthor}>{message.ownerName}</Text>
                    <View style={styles.postMeta}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>{message.ownerRole}</Text>
                      </View>
                      <Text style={styles.postTime}>• {message.timestamp}</Text>
                    </View>
                  </View>
                </View>

                {/* Message Content */}
                <Text style={styles.postContent} numberOfLines={3}>
                  {message.content}
                </Text>

                {/* Message Footer - Interactions */}
                <View style={styles.postFooter}>
                  <View style={styles.postStat}>
                    <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
                    <Text style={styles.postStatText}>{message.comments.length}</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="heart" size={16} color={message.favorite.length > 0 ? '#ef4444' : '#d1d5db'} />
                    <Text style={styles.postStatText}>{message.favorite.length}</Text>
                  </View>
                </View>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Delete Selected Button */}
      {selectMode && selectedMessages.size > 0 && (
        <TouchableOpacity
          style={styles.deleteSelectedButton}
          onPress={handleDeleteSelected}
        >
          <Ionicons name="trash" size={24} color="#ffffff" />
          <Text style={styles.deleteSelectedText}>{selectedMessages.size}</Text>
        </TouchableOpacity>
      )}

      {/* Create Message Button */}
      {!showNewMessage && !selectMode && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowNewMessage(true)}
        >
          <View style={styles.postarIconCircle}>
            <Image
              source={require('../../assets/post.png')}
              style={styles.postarImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Create Message Modal */}
      {showNewMessage && (
        <View style={styles.newMessageContainer}>
          <View style={styles.newMessageHeader}>
            <Text style={styles.newMessageTitle}>Nova Mensagem</Text>
            <TouchableOpacity onPress={() => setShowNewMessage(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.newMessageInput}
            placeholder="Digite sua mensagem..."
            value={newMessageText}
            onChangeText={setNewMessageText}
            multiline
            maxLength={300}
            autoFocus
          />

          {/* Image Preview */}
          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {selectedImages.map((uri, index) => (
                  <View key={index} style={styles.imagePreviewWrapper}>
                    <View style={styles.imagePreview}>
                      <Ionicons name="image" size={40} color="#6b7280" />
                    </View>
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Action Buttons Row */}
          <View style={styles.messageActionsRow}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={() => {
                Alert.alert('Adicionar Foto', 'Funcionalidade de upload de fotos será implementada em breve!');
                setSelectedImages([...selectedImages, 'placeholder']);
              }}
            >
              <Ionicons name="camera" size={18} color="#3b82f6" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.postButton, !newMessageText.trim() && styles.postButtonDisabled]}
              onPress={handleCreateMessage}
              disabled={!newMessageText.trim()}
            >
              <Text style={styles.postButtonText}>Publicar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    zIndex: -1,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  tabsWrapper: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
  },
  tabsRow: {
    alignSelf: 'flex-start',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  tabItem: {
    paddingBottom: 12,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabIndicatorLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1e40af',
  },
  userBanner: {
    backgroundColor: '#eff6ff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  userBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userBannerText: {
    flex: 1,
  },
  userBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 2,
  },
  userBannerSubtitle: {
    fontSize: 13,
    color: '#3b82f6',
  },
  postsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  postCardWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#6fee5f',
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
  },
  postTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postStatText: {
    fontSize: 13,
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deleteSelectedButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  deleteSelectedText: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 20,
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
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
    marginTop: 4,
  },
  postarImage: {
    width: 56,
    height: 56,
  },
  newMessageContainer: {
    position: 'absolute',
    bottom: 20,
    left: '5%',
    right: '5%',
    width: '90%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    maxHeight: '70%',
  },
  newMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  newMessageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  newMessageInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  postButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  privacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  privacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  privacyToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    padding: 2,
  },
  privacyToggleActive: {
    backgroundColor: '#ef4444',
  },
  privacyToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  privacyToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  imagePreviewContainer: {
    marginBottom: 12,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  messageActionsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
});
