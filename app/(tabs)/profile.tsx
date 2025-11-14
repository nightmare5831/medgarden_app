import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { router } from 'expo-router';
import { messageApi, Message } from '../../services/api';
import { messagesChannel } from '../../services/pusher';

export default function PerfilScreen() {
  const { currentUser, authToken, logout } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    // Listen to Pusher events for real-time updates
    const handleMessageUpdate = () => {
      loadMessages(); // Reload messages when any message changes
    };

    messagesChannel.bind('MessageUpdated', handleMessageUpdate);

    return () => {
      messagesChannel.unbind('MessageUpdated', handleMessageUpdate);
    };
  }, [authToken]);

  const loadMessages = async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const data = await messageApi.getAll(authToken);
      // Filter to show all messages of current user
      const userMessages = data.filter(msg => msg.owner === currentUser?.email);
      setMessages(userMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  // Handle case when user is not loaded yet
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyStateText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isProfessional = currentUser.role === 'professional';

  // Helper function to get role display text
  const getRoleText = () => {
    if (currentUser.role === 'professional') return 'Profissional';
    if (currentUser.role === 'patient') return 'Paciente';
    if (currentUser.role === 'association') return 'Associação';
    if (currentUser.role === 'store') return 'Loja';
    if (currentUser.role === 'super_admin') return 'Administrador';
    return 'Usuário';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil: {currentUser.name}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {/* Avatar with Verified Badge */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            {isProfessional && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color="#ffffff" />
              </View>
            )}
          </View>

          {/* Name */}
          <Text style={styles.userName}>{currentUser.name}</Text>

          {/* Role Badge */}
          <View style={styles.professionalBadge}>
            <Text style={styles.professionalBadgeText}>{getRoleText().toUpperCase()}</Text>
          </View>

          {/* Rating and Price - Show for all users with mock data */}
          <View style={styles.ratingPriceContainer}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={20} color="#22c55e" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <Text style={styles.priceText}>R$ 250/h</Text>
          </View>

          {/* First Message */}
          {loading ? (
            <ActivityIndicator size="small" color="#2563eb" style={{ marginTop: 16 }} />
          ) : messages.length > 0 ? (
            <Text style={styles.firstMessage}>
              {messages[0].content}
            </Text>
          ) : null}
        </View>

        {/* Recent Messages Section */}
        <View style={styles.messagesSection}>
          <Text style={styles.sectionTitle}>Mensagens recentes</Text>

          {loading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : messages.length > 0 ? (
            messages.map((message: Message) => (
              <View key={message.id} style={styles.messageCard}>
                <View style={styles.messageHeader}>
                  <View style={styles.messageAvatarContainer}>
                    <View style={styles.messageAvatar}>
                      <Text style={styles.messageAvatarText}>
                        {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </Text>
                    </View>
                    {isProfessional && (
                      <View style={styles.messageVerifiedBadge}>
                        <Ionicons name="checkmark" size={10} color="#ffffff" />
                      </View>
                    )}
                  </View>

                  <View style={styles.messageInfo}>
                    <View style={styles.messageNameRow}>
                      <Text style={styles.messageUserName}>{currentUser.name}</Text>
                      {isProfessional && (
                        <View style={styles.messageProfessionalBadge}>
                          <Text style={styles.messageProfessionalBadgeText}>{getRoleText().toUpperCase()}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.messageTime}>• {message.timestamp}</Text>
                  </View>
                </View>

                <Text style={styles.messageText}>{message.content}</Text>

                <View style={styles.messageActions}>
                  <View style={styles.messageActionItem}>
                    <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
                    <Text style={styles.messageActionText}>{message.comments.length}</Text>
                  </View>
                  <View style={styles.messageActionItem}>
                    <Ionicons name="heart" size={16} color="#ef4444" />
                    <Text style={styles.messageActionText}>{message.favorite.length}</Text>
                  </View>
                  <View style={styles.messageActionItem}>
                    <Ionicons name="thumbs-up" size={16} color={message.good.length > 0 ? '#3b82f6' : '#d1d5db'} />
                    <Text style={styles.messageActionText}>{message.good.length}</Text>
                  </View>
                  <View style={styles.messageActionItem}>
                    <Ionicons name="thumbs-down" size={16} color={message.bad.length > 0 ? '#6b7280' : '#d1d5db'} />
                    <Text style={styles.messageActionText}>{message.bad.length}</Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyMessageState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyStateText}>Nenhuma mensagem ainda</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
    marginRight: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    backgroundColor: '#ffffff',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 60,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  professionalBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 50,
    marginTop:10,
    marginBottom: 16,
  },
  professionalBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  categoryPill: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryPillText: {
    fontSize: 12,
    color: '#4b5563',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
  },
  firstMessage: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 16,
  },
  messagesSection: {
    backgroundColor: '#ffffff',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  messageCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  messageAvatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  messageAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  messageVerifiedBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  messageInfo: {
    flex: 1,
  },
  messageNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  messageUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  messageProfessionalBadge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 3,
  },
  messageProfessionalBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  messageTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messageText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 16,
  },
  messageActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  messageActionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyMessageState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
});
