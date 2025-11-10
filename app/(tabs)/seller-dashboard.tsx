import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/useAppStore';
import FABMenu from '../../components/FABMenu';

export default function SellerDashboard() {
  const { currentUser } = useAppStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Painel do Vendedor</Text>
        <Text style={styles.headerSubtitle}>Bem-vindo, {currentUser?.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="cube-outline" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Produtos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Aprovados</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="time-outline" size={24} color="#ca8a04" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: '#fce7f3' }]}>
              <Ionicons name="cart-outline" size={24} color="#be185d" />
            </View>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Vendas</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle" size={32} color="#2563eb" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Adicionar Produto</Text>
              <Text style={styles.actionDescription}>
                Cadastre um novo produto para venda
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="list" size={32} color="#2563eb" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Meus Produtos</Text>
              <Text style={styles.actionDescription}>
                Visualize e gerencie seus produtos
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="chatbubbles" size={32} color="#2563eb" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Fórum</Text>
              <Text style={styles.actionDescription}>
                Use o botão flutuante abaixo
              </Text>
            </View>
            <Ionicons name="information-circle-outline" size={24} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="bar-chart" size={32} color="#2563eb" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Relatórios</Text>
              <Text style={styles.actionDescription}>
                Veja estatísticas e análises
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyStateText}>Nenhuma atividade recente</Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB Menu - Forum and Logout */}
      <FABMenu mode="main" />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
});
