import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OwnerInfoProps {
  ownerName?: string;
  ownerRole?: string;
  variant?: 'header' | 'detail';
  style?: ViewStyle;
  // Optional product info for detail variant
  rating?: number;
  price?: number;
}

export const OwnerInfo: React.FC<OwnerInfoProps> = ({
  ownerName,
  ownerRole,
  variant = 'header',
  style,
  rating,
  price,
}) => {
  const getUserInitials = () => {
    if (!ownerName) return 'U';

    const names = ownerName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return ownerName.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    return ownerName || 'Usuário';
  };

  const getRoleText = () => {
    return ownerRole?.toUpperCase() || 'USUÁRIO';
  };

  if (variant === 'detail') {
    // Safely convert rating and price to numbers
    const safeRating = rating !== undefined && rating !== null ? Number(rating) : undefined;
    const safePrice = price !== undefined && price !== null ? Number(price) : undefined;

    return (
      <View style={[styles.detailContainer, style]}>
        <View style={styles.detailAvatar}>
          <Text style={styles.detailAvatarText}>{getUserInitials()}</Text>
        </View>
        <View style={styles.detailInfo}>
          <Text style={styles.detailName}>{getDisplayName()}</Text>
          <View style={styles.detailRoleBadge}>
            <Text style={styles.detailRoleText}>{getRoleText()}</Text>
          </View>
        </View>
        {safeRating !== undefined && !isNaN(safeRating) && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#f59e0b" />
            <Text style={styles.ratingText}>{safeRating.toFixed(1)}</Text>
          </View>
        )}
        {safePrice !== undefined && !isNaN(safePrice) && (
          <Text style={styles.priceText}>R$ {safePrice.toFixed(2)}</Text>
        )}
      </View>
    );
  }

  // Header variant (default)
  return (
    <View style={[styles.headerContainer, style]}>
      <View style={styles.headerAvatar}>
        <Text style={styles.headerAvatarText}>{getUserInitials()}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.headerName}>{getDisplayName()}</Text>
        <View style={styles.headerRoleBadge}>
          <Text style={styles.headerRoleText}>{getRoleText()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header variant styles
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerInfo: {
    marginLeft: 12,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerRoleBadge: {
    backgroundColor: '#6fee5f',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  headerRoleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },

  // Detail variant styles
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  detailInfo: {
    flex: 1,
  },
  detailName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  detailRoleBadge: {
    backgroundColor: '#6fee5f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailRoleText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
});
